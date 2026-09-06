import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.guest_meal import GuestMeal
from app.schemas.guest_meal import GuestMealCreate, GuestMealOut, GuestMealPayRequest
from app.services.finance_service import record_transaction
from app.services.audit_service import log_audit
from app.api.deps import get_active_period, get_current_user_optional

router = APIRouter()


def guest_meal_to_out(g: GuestMeal) -> GuestMealOut:
    created_at_str = g.created_at.strftime("%Y-%m-%d %H:%M") if g.created_at else ""
    return GuestMealOut(
        id=g.id,
        periodId=g.period_id,
        guestName=g.guest_name,
        hostStudentId=g.host_student_id,
        hostStudentName=g.host_student_name,
        block=g.block,
        room=g.room,
        mealType=g.meal_type,
        date=g.date,
        quantity=g.quantity,
        unitPrice=float(g.unit_price),
        totalPrice=float(g.total_price),
        paymentMethod=g.payment_method,
        paymentStatus=g.payment_status,
        recordedBy=g.recorded_by,
        createdAt=created_at_str,
        note=g.note
    )


@router.get("", response_model=List[GuestMealOut])
def get_guest_meals(
    period_id: Optional[str] = Query(None, description="Management period ID"),
    date: Optional[str] = Query(None, description="Filter date"),
    db: Session = Depends(get_db)
):
    """List guest meals for the period."""
    active_period = get_active_period(period_id, db)
    query = db.query(GuestMeal).filter(GuestMeal.period_id == active_period.id)
    if date:
        query = query.filter(GuestMeal.date == date)
    guest_meals = query.order_by(GuestMeal.created_at.desc()).all()
    return [guest_meal_to_out(g) for g in guest_meals]


@router.post("", response_model=GuestMealOut, status_code=status.HTTP_201_CREATED)
def add_guest_meal(
    guest_in: GuestMealCreate,
    period_id: Optional[str] = Query(None, description="Target period ID"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Record a new guest meal."""
    active_period = get_active_period(period_id, db)
    total_price = float(guest_in.quantity * guest_in.unitPrice)
    effective_name = guest_in.guestName.strip() if guest_in.guestName and guest_in.guestName.strip() else (
        f"Guest of {guest_in.hostStudentName}" if guest_in.hostStudentName != "General Guest" else "Guest Visitor"
    )

    now_dt = datetime.now(timezone.utc)
    payment_status = "Due" if guest_in.paymentMethod == "Due" else "Paid"
    user_name = user.name if user else "Admin"

    new_guest = GuestMeal(
        id=f"guest_{uuid.uuid4().hex[:9]}_{int(now_dt.timestamp())}",
        period_id=active_period.id,
        guest_name=effective_name,
        host_student_name=guest_in.hostStudentName,
        block=guest_in.block,
        room=guest_in.room,
        meal_type=guest_in.mealType,
        date=guest_in.date,
        quantity=guest_in.quantity,
        unit_price=guest_in.unitPrice,
        total_price=total_price,
        payment_method=guest_in.paymentMethod,
        payment_status=payment_status,
        recorded_by=user_name,
        note=guest_in.note,
        created_at=now_dt
    )
    db.add(new_guest)

    # Inflow transaction if paid
    if payment_status == "Paid":
        record_transaction(
            db=db,
            period_id=active_period.id,
            amount=total_price,
            flow="inflow",
            txn_type="Guest Meal",
            payment_method=guest_in.paymentMethod,
            student_name=f"{guest_in.hostStudentName} (Guest: {effective_name})",
            block=guest_in.block,
            room=guest_in.room,
            reference_id=new_guest.id,
            recorded_by=user_name,
            note=f"Guest meal ({guest_in.quantity}x {guest_in.mealType})",
            date=guest_in.date
        )

    log_audit(
        db=db,
        action="ADD_GUEST_MEAL",
        details=f"Added {guest_in.quantity} guest meal(s) for {effective_name} (৳{total_price})",
        period_id=active_period.id,
        user=user_name,
        entity_type="GuestMeal",
        entity_id=new_guest.id
    )

    db.commit()
    db.refresh(new_guest)
    return guest_meal_to_out(new_guest)


@router.post("/{guest_meal_id}/pay", response_model=GuestMealOut)
def pay_guest_meal(
    guest_meal_id: str,
    req: GuestMealPayRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Collect payment for a guest meal previously marked as Due."""
    guest_meal = db.query(GuestMeal).filter(GuestMeal.id == guest_meal_id).first()
    if not guest_meal:
        raise HTTPException(status_code=404, detail="Guest meal record not found")

    guest_meal.payment_status = "Paid"
    guest_meal.payment_method = req.paymentMethod

    user_name = user.name if user else "Admin"
    record_transaction(
        db=db,
        period_id=guest_meal.period_id,
        amount=guest_meal.total_price,
        flow="inflow",
        txn_type="Guest Meal",
        payment_method=req.paymentMethod,
        student_name=f"{guest_meal.host_student_name} (Guest: {guest_meal.guest_name})",
        block=guest_meal.block,
        room=guest_meal.room,
        reference_id=guest_meal.id,
        recorded_by=user_name,
        note=f"Cleared due for guest meal ({guest_meal.guest_name})"
    )

    log_audit(
        db=db,
        action="MARK_GUEST_PAID",
        details=f"Collected ৳{guest_meal.total_price} for guest meal #{guest_meal.id[-5:]}",
        period_id=guest_meal.period_id,
        user=user_name,
        entity_type="GuestMeal",
        entity_id=guest_meal.id
    )

    db.commit()
    db.refresh(guest_meal)
    return guest_meal_to_out(guest_meal)
