import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.student import Student
from app.models.booking import MealBooking
from app.models.receivable import Receivable
from app.models.transaction import PaymentTransaction
from app.schemas.transaction import PaymentTransactionOut, ManualPaymentRequest
from app.schemas.receivable import ReceivableOut, SettleReceivableRequest, ReceivableCreate
from app.services.finance_service import record_transaction, recalculate_student_balances
from app.services.audit_service import log_audit
from app.api.deps import get_active_period, get_current_user_optional

router = APIRouter()


def transaction_to_out(t: PaymentTransaction) -> PaymentTransactionOut:
    created_at_str = t.created_at.strftime("%Y-%m-%d %H:%M") if t.created_at else ""
    return PaymentTransactionOut(
        id=t.id,
        periodId=t.period_id,
        date=t.date,
        amount=float(t.amount),
        flow=t.flow,
        type=t.type,
        studentId=t.student_id,
        studentName=t.student_name,
        block=t.block,
        room=t.room,
        paymentMethod=t.payment_method,
        transactionId=t.transaction_id,
        referenceId=t.reference_id,
        recordedBy=t.recorded_by,
        note=t.note,
        createdAt=created_at_str
    )


def receivable_to_out(r: Receivable) -> ReceivableOut:
    return ReceivableOut(
        id=r.id,
        periodId=r.period_id,
        studentId=r.student_id,
        studentName=r.student_name,
        block=r.block,
        room=r.room,
        amount=float(r.amount),
        reason=r.reason,
        date=r.date,
        status=r.status,
        settledAt=r.settled_at,
        settledBy=r.settled_by,
        settledMethod=r.settled_method,
        settleNote=r.settle_note
    )


@router.get("/transactions", response_model=List[PaymentTransactionOut])
def get_transactions(
    period_id: Optional[str] = Query(None, description="Management period ID"),
    flow: Optional[str] = Query(None, description="inflow or outflow"),
    type_filter: Optional[str] = Query(None, alias="type", description="Transaction type"),
    student_id: Optional[str] = Query(None, description="Student ID filter"),
    db: Session = Depends(get_db)
):
    """List financial transactions / ledger records."""
    active_period = get_active_period(period_id, db)
    query = db.query(PaymentTransaction).filter(PaymentTransaction.period_id == active_period.id)

    if flow:
        query = query.filter(PaymentTransaction.flow == flow)
    if type_filter:
        query = query.filter(PaymentTransaction.type == type_filter)
    if student_id:
        query = query.filter(PaymentTransaction.student_id == student_id)

    txns = query.order_by(PaymentTransaction.date.desc(), PaymentTransaction.created_at.desc()).all()
    return [transaction_to_out(t) for t in txns]


@router.post("/payments", response_model=PaymentTransactionOut, status_code=status.HTTP_201_CREATED)
def record_manual_payment(
    payment_in: ManualPaymentRequest,
    period_id: Optional[str] = Query(None, description="Target period ID"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Record manual due clearance payment from student and allocate to outstanding dues."""
    active_period = get_active_period(period_id, db)
    student = db.query(Student).filter(Student.id == payment_in.studentId).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    user_name = user.name if user else "Admin"
    now_dt = datetime.now(timezone.utc)
    today_str = now_dt.strftime("%Y-%m-%d")

    # Inflow transaction
    txn = record_transaction(
        db=db,
        period_id=active_period.id,
        amount=float(payment_in.amount),
        flow="inflow",
        txn_type="Due Clearance",
        payment_method=payment_in.paymentMethod,
        student_id=student.id,
        student_name=student.name,
        block=student.block,
        room=student.room,
        recorded_by=user_name,
        note=payment_in.note or f"Manual due payment by {student.name}"
    )

    # Allocate across active period bookings that have dues
    bookings = db.query(MealBooking).filter(
        MealBooking.student_id == student.id,
        MealBooking.period_id == active_period.id,
        MealBooking.due_amount > 0
    ).order_by(MealBooking.created_at.asc()).all()

    rem_payment = float(payment_in.amount)
    for b in bookings:
        if rem_payment <= 0:
            break
        pay = min(b.due_amount, rem_payment)
        rem_payment -= pay
        b.paid_amount += pay
        b.due_amount -= pay
        b.payment_status = "Paid" if b.due_amount == 0 else "Partial"

    # If overpayment exists after clearing all dues, record as pending receivable
    if rem_payment > 0:
        rec = Receivable(
            id=f"rec_{uuid.uuid4().hex[:9]}_{int(now_dt.timestamp())}",
            period_id=active_period.id,
            student_id=student.id,
            student_name=student.name,
            block=student.block,
            room=student.room,
            amount=rem_payment,
            reason="Excess overpayment during due clearance",
            date=today_str,
            status="pending",
            created_at=now_dt
        )
        db.add(rec)

    log_audit(
        db=db,
        action="MANUAL_PAYMENT",
        details=f"Recorded payment ৳{payment_in.amount} for {student.name} ({student.room})",
        period_id=active_period.id,
        user=user_name,
        entity_type="Payment",
        entity_id=txn.id
    )

    db.commit()
    recalculate_student_balances(db, student.id, active_period.id)
    db.refresh(txn)
    return transaction_to_out(txn)


@router.get("/receivables", response_model=List[ReceivableOut])
def get_receivables(
    period_id: Optional[str] = Query(None, description="Management period ID"),
    status_filter: Optional[str] = Query(None, alias="status", description="pending or settled"),
    student_id: Optional[str] = Query(None, description="Student ID filter"),
    db: Session = Depends(get_db)
):
    """List student receivables (refunds/change owed by mess to student)."""
    active_period = get_active_period(period_id, db)
    query = db.query(Receivable).filter(Receivable.period_id == active_period.id)

    if status_filter:
        query = query.filter(Receivable.status == status_filter)
    if student_id:
        query = query.filter(Receivable.student_id == student_id)

    recs = query.order_by(Receivable.created_at.desc()).all()
    return [receivable_to_out(r) for r in recs]


@router.post("/receivables", response_model=ReceivableOut, status_code=status.HTTP_201_CREATED)
def create_manual_receivable(
    rec_in: ReceivableCreate,
    period_id: Optional[str] = Query(None, description="Target period ID"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Create a new change/refund receivable record."""
    active_period = get_active_period(period_id, db)
    student = db.query(Student).filter(Student.id == rec_in.studentId).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    now_dt = datetime.now(timezone.utc)
    today_str = rec_in.date or now_dt.strftime("%Y-%m-%d")

    new_rec = Receivable(
        id=f"rec_{uuid.uuid4().hex[:9]}_{int(now_dt.timestamp())}",
        period_id=active_period.id,
        student_id=student.id,
        student_name=student.name,
        block=student.block,
        room=student.room,
        amount=float(rec_in.amount),
        reason=rec_in.reason,
        date=today_str,
        status="pending",
        created_at=now_dt
    )
    db.add(new_rec)

    user_name = user.name if user else "Admin"
    log_audit(
        db=db,
        action="CREATE_RECEIVABLE",
        details=f"Added receivable: ৳{rec_in.amount} for {student.name}",
        period_id=active_period.id,
        user=user_name,
        entity_type="Receivable",
        entity_id=new_rec.id
    )

    db.commit()
    recalculate_student_balances(db, student.id, active_period.id)
    db.refresh(new_rec)
    return receivable_to_out(new_rec)


@router.post("/receivables/{receivable_id}/settle", response_model=ReceivableOut)
def settle_receivable_endpoint(
    receivable_id: str,
    req: SettleReceivableRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Settle/Refund cash back to student and record outflow transaction."""
    rec = db.query(Receivable).filter(Receivable.id == receivable_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Receivable record not found")

    if rec.status == "settled":
        raise HTTPException(status_code=400, detail="Receivable is already settled.")

    user_name = user.name if user else "Admin"
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")

    rec.status = "settled"
    rec.settled_at = now_str
    rec.settled_by = user_name
    rec.settled_method = req.method
    rec.settle_note = req.note

    # Record Outflow transaction
    record_transaction(
        db=db,
        period_id=rec.period_id,
        amount=rec.amount,
        flow="outflow",
        txn_type="Student Refund",
        payment_method=req.method,
        student_id=rec.student_id,
        student_name=rec.student_name,
        block=rec.block,
        room=rec.room,
        reference_id=receivable_id,
        recorded_by=user_name,
        note=f"Settled change refund for {rec.student_name}"
    )

    log_audit(
        db=db,
        action="SETTLE_RECEIVABLE",
        details=f"Settled refund of ৳{rec.amount} to {rec.student_name}",
        period_id=rec.period_id,
        user=user_name,
        entity_type="Receivable",
        entity_id=receivable_id
    )

    db.commit()
    recalculate_student_balances(db, rec.student_id, rec.period_id)
    db.refresh(rec)
    return receivable_to_out(rec)
