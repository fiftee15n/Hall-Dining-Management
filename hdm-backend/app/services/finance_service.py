import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.student import Student
from app.models.booking import MealBooking
from app.models.receivable import Receivable
from app.models.transaction import PaymentTransaction
from app.services.audit_service import log_audit


def recalculate_student_balances(db: Session, student_id: str, period_id: str):
    """
    Recalculate balance_due and balance_receivable for a student in active period.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return

    # Total due from meal bookings in this period
    total_due = db.query(func.sum(MealBooking.due_amount))\
        .filter(MealBooking.student_id == student_id, MealBooking.period_id == period_id)\
        .scalar() or 0.0

    # Total pending receivable (overpayment/refunds owed to student)
    total_receivable = db.query(func.sum(Receivable.amount))\
        .filter(Receivable.student_id == student_id, Receivable.period_id == period_id, Receivable.status == "pending")\
        .scalar() or 0.0

    student.balance_due = float(total_due)
    student.balance_receivable = float(total_receivable)
    db.commit()
    db.refresh(student)


def record_transaction(
    db: Session,
    period_id: str,
    amount: float,
    flow: str,
    txn_type: str,
    payment_method: str = "Cash",
    student_id: Optional[str] = None,
    student_name: Optional[str] = None,
    block: Optional[str] = None,
    room: Optional[str] = None,
    reference_id: Optional[str] = None,
    transaction_id: Optional[str] = None,
    recorded_by: str = "Admin",
    note: Optional[str] = None,
    date: Optional[str] = None
) -> PaymentTransaction:
    """Create and persist a payment transaction record."""
    now_dt = datetime.now(timezone.utc)
    today_str = date or now_dt.strftime("%Y-%m-%d")
    created_at_str = now_dt.strftime("%Y-%m-%d %H:%M")

    txn = PaymentTransaction(
        id=f"txn_{uuid.uuid4().hex[:9]}_{int(now_dt.timestamp())}",
        period_id=period_id,
        date=today_str,
        amount=amount,
        flow=flow,
        type=txn_type,
        student_id=student_id,
        student_name=student_name,
        block=block,
        room=room,
        payment_method=payment_method,
        transaction_id=transaction_id,
        reference_id=reference_id,
        recorded_by=recorded_by,
        note=note,
        created_at=now_dt
    )
    db.add(txn)
    return txn
