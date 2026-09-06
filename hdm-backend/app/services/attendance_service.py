import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.student import Student
from app.models.period import ManagementPeriod
from app.models.attendance import MealAttendanceRecord
from app.models.booking import MealBooking
from app.services.finance_service import record_transaction, recalculate_student_balances
from app.services.audit_service import log_audit


def mark_meal_attendance(
    db: Session,
    attendance_id: str,
    is_taken: bool,
    payment_collected: Optional[float] = None,
    payment_method: Optional[str] = None,
    marked_by: str = "Admin"
) -> MealAttendanceRecord:
    att = db.query(MealAttendanceRecord).filter(MealAttendanceRecord.id == attendance_id).first()
    if not att:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    att.is_taken = is_taken
    att.taken_at = now_str if is_taken else None
    att.marked_by = marked_by

    if payment_collected and payment_collected > 0 and payment_method:
        att.payment_collected_on_spot = payment_collected
        att.payment_method_on_spot = payment_method

        # Record Inflow transaction for On-spot payment
        record_transaction(
            db=db,
            period_id=att.period_id,
            amount=payment_collected,
            flow="inflow",
            txn_type="Due Clearance",
            payment_method=payment_method,
            student_id=att.student_id,
            student_name=att.student_name,
            block=att.block,
            room=att.room,
            reference_id=att.id,
            recorded_by=marked_by,
            note=f"On-spot payment at dining token counter ({att.meal_type})"
        )

        # Allocate payment towards student's active bookings due
        student_bookings = db.query(MealBooking).filter(
            MealBooking.student_id == att.student_id,
            MealBooking.period_id == att.period_id,
            MealBooking.due_amount > 0
        ).order_by(MealBooking.created_at.asc()).all()

        rem_payment = payment_collected
        for b in student_bookings:
            if rem_payment <= 0:
                break
            pay = min(b.due_amount, rem_payment)
            rem_payment -= pay
            b.paid_amount += pay
            b.due_amount -= pay
            b.payment_status = "Paid" if b.due_amount == 0 else "Partial"

    log_audit(
        db=db,
        action="MARK_ATTENDANCE",
        details=f"Marked attendance {'Taken' if is_taken else 'Unmarked'} for token {att.id[-6:]}",
        period_id=att.period_id,
        user=marked_by,
        entity_type="Attendance",
        entity_id=att.id
    )

    db.commit()
    recalculate_student_balances(db, att.student_id, att.period_id)
    db.refresh(att)
    return att


def quick_take_meal(
    db: Session,
    student_id: str,
    date: str,
    meal_type: str,
    period_id: str,
    on_spot_payment: Optional[float] = None,
    payment_method: Optional[str] = None,
    marked_by: str = "Admin"
) -> MealAttendanceRecord:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    existing = db.query(MealAttendanceRecord).filter(
        MealAttendanceRecord.student_id == student_id,
        MealAttendanceRecord.period_id == period_id,
        MealAttendanceRecord.date == date,
        MealAttendanceRecord.meal_type == meal_type
    ).first()

    if existing:
        return mark_meal_attendance(
            db=db,
            attendance_id=existing.id,
            is_taken=True,
            payment_collected=on_spot_payment,
            payment_method=payment_method,
            marked_by=marked_by
        )

    now_dt = datetime.now(timezone.utc)
    now_str = now_dt.strftime("%Y-%m-%d %H:%M")

    new_att = MealAttendanceRecord(
        id=f"att_{uuid.uuid4().hex[:9]}_{int(now_dt.timestamp())}",
        period_id=period_id,
        date=date,
        meal_type=meal_type,
        student_id=student.id,
        student_name=student.name,
        block=student.block,
        room=student.room,
        is_booked=False,
        is_taken=True,
        taken_at=now_str,
        has_due=(student.balance_due > 0),
        due_amount=student.balance_due,
        payment_collected_on_spot=on_spot_payment,
        payment_method_on_spot=payment_method,
        marked_by=marked_by,
        created_at=now_dt
    )
    db.add(new_att)

    if on_spot_payment and on_spot_payment > 0 and payment_method:
        record_transaction(
            db=db,
            period_id=period_id,
            amount=on_spot_payment,
            flow="inflow",
            txn_type="Due Clearance",
            payment_method=payment_method,
            student_id=student.id,
            student_name=student.name,
            block=student.block,
            room=student.room,
            reference_id=new_att.id,
            recorded_by=marked_by,
            note=f"On-spot quick meal payment ({meal_type})"
        )

    log_audit(
        db=db,
        action="QUICK_TAKE_MEAL",
        details=f"Quick meal issued for {student.name} ({meal_type} on {date})",
        period_id=period_id,
        user=marked_by,
        entity_type="Attendance",
        entity_id=new_att.id
    )

    db.commit()
    recalculate_student_balances(db, student.id, period_id)
    db.refresh(new_att)
    return new_att
