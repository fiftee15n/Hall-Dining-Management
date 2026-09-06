import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.student import Student
from app.models.feast import Feast, FeastRegistration
from app.models.receivable import Receivable
from app.schemas.feast import FeastCreate, FeastOut, FeastRegistrationCreate, FeastRegistrationOut
from app.services.finance_service import record_transaction, recalculate_student_balances
from app.services.audit_service import log_audit
from app.api.deps import get_active_period, get_current_user_optional

router = APIRouter()


def feast_to_out(f: Feast) -> FeastOut:
    created_at_str = f.created_at.strftime("%Y-%m-%d %H:%M") if f.created_at else ""
    return FeastOut(
        id=f.id,
        periodId=f.period_id,
        title=f.title,
        date=f.date,
        mealType=f.meal_type,
        regularPrice=float(f.regular_price),
        guestPrice=float(f.guest_price),
        menuDescription=f.menu_description,
        maxCapacity=f.max_capacity,
        registeredCount=f.registered_count,
        status=f.status,
        createdAt=created_at_str
    )


def registration_to_out(r: FeastRegistration) -> FeastRegistrationOut:
    created_at_str = r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else ""
    return FeastRegistrationOut(
        id=r.id,
        feastId=r.feast_id,
        periodId=r.period_id,
        studentId=r.student_id,
        studentName=r.student_name,
        block=r.block,
        room=r.room,
        isGuest=r.is_guest,
        guestCount=r.guest_count,
        totalAmount=float(r.total_amount),
        paidAmount=float(r.paid_amount),
        dueAmount=float(r.due_amount),
        payableAmount=float(r.payable_amount or 0.0),
        paymentMethod=r.payment_method,
        paymentStatus=r.payment_status,
        status=r.status,
        tokenNumber=r.token_number,
        createdAt=created_at_str
    )


@router.get("", response_model=List[FeastOut])
def get_feasts(
    period_id: Optional[str] = Query(None, description="Management period ID"),
    db: Session = Depends(get_db)
):
    """List feasts for the period."""
    active_period = get_active_period(period_id, db)
    feasts = db.query(Feast).filter(Feast.period_id == active_period.id).order_by(Feast.created_at.desc()).all()
    return [feast_to_out(f) for f in feasts]


@router.post("", response_model=FeastOut, status_code=status.HTTP_201_CREATED)
def create_feast(
    feast_in: FeastCreate,
    period_id: Optional[str] = Query(None, description="Target period ID"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Create a new grand feast event."""
    active_period = get_active_period(period_id, db)
    now_dt = datetime.now(timezone.utc)
    new_feast = Feast(
        id=f"feast_{uuid.uuid4().hex[:8]}",
        period_id=active_period.id,
        title=feast_in.title,
        date=feast_in.date,
        meal_type=feast_in.mealType,
        regular_price=feast_in.regularPrice,
        guest_price=feast_in.guestPrice,
        menu_description=feast_in.menuDescription,
        max_capacity=feast_in.maxCapacity,
        registered_count=0,
        status=feast_in.status,
        created_at=now_dt
    )
    db.add(new_feast)

    user_name = user.name if user else "Admin"
    log_audit(
        db=db,
        action="CREATE_FEAST",
        details=f"Created feast '{new_feast.title}' on {new_feast.date}",
        period_id=active_period.id,
        user=user_name,
        entity_type="Feast",
        entity_id=new_feast.id
    )

    db.commit()
    db.refresh(new_feast)
    return feast_to_out(new_feast)


@router.get("/registrations", response_model=List[FeastRegistrationOut])
def get_all_feast_registrations(
    period_id: Optional[str] = Query(None, description="Period ID"),
    feast_id: Optional[str] = Query(None, description="Feast ID"),
    db: Session = Depends(get_db)
):
    """List feast registrations."""
    active_period = get_active_period(period_id, db)
    query = db.query(FeastRegistration).filter(FeastRegistration.period_id == active_period.id)
    if feast_id:
        query = query.filter(FeastRegistration.feast_id == feast_id)
    regs = query.order_by(FeastRegistration.token_number.asc()).all()
    return [registration_to_out(r) for r in regs]


@router.post("/{feast_id}/register", response_model=FeastRegistrationOut, status_code=status.HTTP_201_CREATED)
def register_for_feast(
    feast_id: str,
    reg_in: FeastRegistrationCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Register student or guest for a feast and allocate token number."""
    feast = db.query(Feast).filter(Feast.id == feast_id).first()
    if not feast:
        raise HTTPException(status_code=404, detail="Feast not found")

    student = db.query(Student).filter(Student.id == reg_in.studentId).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    regular_cost = feast.regular_price
    guest_cost = (reg_in.guestCount or 0) * feast.guest_price
    total = regular_cost + guest_cost
    paid = 0.0 if reg_in.paymentMethod == "Due" else float(reg_in.paidAmount)
    due = max(0.0, total - paid)
    payable = max(0.0, paid - total)

    token_number = (feast.registered_count or 0) + 101
    now_dt = datetime.now(timezone.utc)
    today_str = now_dt.strftime("%Y-%m-%d")

    payment_status = "Paid"
    if due > 0:
        payment_status = "Partial" if paid > 0 else "Due"
    elif payable > 0:
        payment_status = "Overpaid"

    new_reg = FeastRegistration(
        id=f"freg_{uuid.uuid4().hex[:9]}_{int(now_dt.timestamp())}",
        feast_id=feast.id,
        period_id=feast.period_id,
        student_id=student.id,
        student_name=student.name,
        block=student.block,
        room=student.room,
        is_guest=reg_in.isGuest,
        guest_count=reg_in.guestCount,
        total_amount=total,
        paid_amount=paid,
        due_amount=due,
        payable_amount=payable,
        payment_method=reg_in.paymentMethod,
        payment_status=payment_status,
        status="confirmed",
        token_number=token_number,
        created_at=now_dt
    )
    db.add(new_reg)

    # Overpayment receivable
    if payable > 0:
        rec = Receivable(
            id=f"rec_{uuid.uuid4().hex[:9]}_{int(now_dt.timestamp())}",
            period_id=feast.period_id,
            student_id=student.id,
            student_name=student.name,
            block=student.block,
            room=student.room,
            amount=payable,
            reason=f"Overpayment change for feast registration ({feast.title})",
            date=today_str,
            status="pending",
            created_at=now_dt
        )
        db.add(rec)

    # Update feast count
    feast.registered_count += 1 + (reg_in.guestCount or 0)

    user_name = user.name if user else "Admin"
    # Payment transaction inflow
    if paid > 0 and reg_in.paymentMethod != "Due":
        record_transaction(
            db=db,
            period_id=feast.period_id,
            amount=paid,
            flow="inflow",
            txn_type="Feast Registration",
            payment_method=reg_in.paymentMethod,
            student_id=student.id,
            student_name=f"{student.name} (Feast Token #{token_number})",
            block=student.block,
            room=student.room,
            reference_id=new_reg.id,
            recorded_by=user_name,
            note=f"Feast registration for {feast.title}"
        )

    log_audit(
        db=db,
        action="REGISTER_FEAST",
        details=f"Registered {student.name} for {feast.title} (Token #{token_number})",
        period_id=feast.period_id,
        user=user_name,
        entity_type="Feast",
        entity_id=new_reg.id
    )

    db.commit()
    recalculate_student_balances(db, student.id, feast.period_id)
    db.refresh(new_reg)
    return registration_to_out(new_reg)
