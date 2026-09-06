import json
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.student import Student
from app.models.period import ManagementPeriod
from app.models.booking import MealBooking
from app.models.attendance import MealAttendanceRecord
from app.models.receivable import Receivable
from app.schemas.booking import DayMealSelection, MealBookingCreate
from app.services.finance_service import record_transaction, recalculate_student_balances
from app.services.audit_service import log_audit


def create_meal_booking(
    db: Session,
    booking_in: MealBookingCreate,
    active_period: ManagementPeriod,
    booked_by: str = "Admin"
) -> MealBooking:
    student = db.query(Student).filter(Student.id == booking_in.studentId).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    total_lunch = sum(1 for m in booking_in.selectedMeals if m.lunch)
    total_dinner = sum(1 for m in booking_in.selectedMeals if m.dinner)
    total_meals = total_lunch + total_dinner

    if total_meals < active_period.min_booking_days and total_meals > 0:
        # Note: minimum booking check or warning
        pass

    total_cost = (total_lunch * active_period.lunch_price) + (total_dinner * active_period.dinner_price)
    paid = 0.0 if booking_in.paymentMethod == "Due" else float(booking_in.paidAmount)
    due = max(0.0, total_cost - paid)
    payable = max(0.0, paid - total_cost)

    payment_status = "Paid"
    if due > 0:
        payment_status = "Partial" if paid > 0 else "Due"
    elif payable > 0:
        payment_status = "Overpaid"

    now_dt = datetime.now(timezone.utc)
    today_str = now_dt.strftime("%Y-%m-%d")
    selected_meals_data = [m.model_dump() for m in booking_in.selectedMeals]

    new_booking = MealBooking(
        id=f"book_{uuid.uuid4().hex[:9]}_{int(now_dt.timestamp())}",
        period_id=active_period.id,
        student_id=student.id,
        student_name=student.name,
        block=student.block,
        room=student.room,
        start_date=booking_in.startDate,
        end_date=booking_in.endDate,
        selected_meals_json=json.dumps(selected_meals_data),
        total_lunch_count=total_lunch,
        total_dinner_count=total_dinner,
        total_meals_count=total_meals,
        total_amount=total_cost,
        paid_amount=paid,
        due_amount=due,
        payable_amount=payable,
        payment_method=booking_in.paymentMethod,
        payment_status=payment_status,
        booked_by=booked_by,
        notes=booking_in.notes,
        created_at=now_dt
    )
    db.add(new_booking)
    db.flush()

    # If overpayment exists, record Receivable (cash return owed to student)
    if payable > 0:
        rec = Receivable(
            id=f"rec_{uuid.uuid4().hex[:9]}_{int(now_dt.timestamp())}",
            period_id=active_period.id,
            student_id=student.id,
            student_name=student.name,
            block=student.block,
            room=student.room,
            amount=payable,
            reason=f"Overpayment change for meal booking #{new_booking.id[-5:]} ({total_meals} meals)",
            date=today_str,
            status="pending",
            created_at=now_dt
        )
        db.add(rec)

    # If payment was made, record inflow transaction
    if paid > 0 and booking_in.paymentMethod != "Due":
        overpaid_note = f" [Overpaid ৳{payable:.0f} recorded as Payable]" if payable > 0 else ""
        record_transaction(
            db=db,
            period_id=active_period.id,
            amount=paid,
            flow="inflow",
            txn_type="Meal Booking",
            payment_method=booking_in.paymentMethod,
            student_id=student.id,
            student_name=student.name,
            block=student.block,
            room=student.room,
            reference_id=new_booking.id,
            recorded_by=booked_by,
            note=f"Booking {booking_in.startDate} to {booking_in.endDate} ({total_meals} meals){overpaid_note}",
            date=today_str
        )

    # Generate attendance slots for all selected meals
    for meal in booking_in.selectedMeals:
        if meal.lunch:
            att_lunch = MealAttendanceRecord(
                id=f"att_{uuid.uuid4().hex[:9]}_{int(now_dt.timestamp())}",
                period_id=active_period.id,
                date=meal.date,
                meal_type="lunch",
                student_id=student.id,
                student_name=student.name,
                block=student.block,
                room=student.room,
                is_booked=True,
                is_taken=False,
                has_due=(due > 0),
                due_amount=due,
                created_at=now_dt
            )
            db.add(att_lunch)
        if meal.dinner:
            att_dinner = MealAttendanceRecord(
                id=f"att_{uuid.uuid4().hex[:9]}_{int(now_dt.timestamp())}",
                period_id=active_period.id,
                date=meal.date,
                meal_type="dinner",
                student_id=student.id,
                student_name=student.name,
                block=student.block,
                room=student.room,
                is_booked=True,
                is_taken=False,
                has_due=(due > 0),
                due_amount=due,
                created_at=now_dt
            )
            db.add(att_dinner)

    log_audit(
        db=db,
        action="CREATE_BOOKING",
        details=f"Booked {total_meals} meals for {student.name} ({student.room}). Total: ৳{total_cost}, Paid: ৳{paid}",
        period_id=active_period.id,
        user=booked_by,
        entity_type="Booking",
        entity_id=new_booking.id
    )

    db.commit()
    recalculate_student_balances(db, student.id, active_period.id)
    db.refresh(new_booking)
    return new_booking


def cancel_meal_booking(db: Session, booking_id: str, cancelled_by: str = "Admin") -> bool:
    booking = db.query(MealBooking).filter(MealBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    student_id = booking.student_id
    period_id = booking.period_id

    # Remove all un-taken attendance records generated for this student & period
    db.query(MealAttendanceRecord).filter(
        MealAttendanceRecord.student_id == student_id,
        MealAttendanceRecord.period_id == period_id,
        MealAttendanceRecord.is_taken == False
    ).delete()

    # If student had paid, issue a refund receivable
    if booking.paid_amount > 0:
        now_dt = datetime.now(timezone.utc)
        today_str = now_dt.strftime("%Y-%m-%d")
        rec = Receivable(
            id=f"rec_{uuid.uuid4().hex[:9]}_{int(now_dt.timestamp())}",
            period_id=period_id,
            student_id=student_id,
            student_name=booking.student_name,
            block=booking.block,
            room=booking.room,
            amount=booking.paid_amount,
            reason=f"Refund for cancelled booking #{booking.id[-5:]} ({booking.start_date} to {booking.end_date})",
            date=today_str,
            status="pending",
            created_at=now_dt
        )
        db.add(rec)

    log_audit(
        db=db,
        action="CANCEL_BOOKING",
        details=f"Cancelled booking #{booking.id[-5:]} for {booking.student_name}",
        period_id=period_id,
        user=cancelled_by,
        entity_type="Booking",
        entity_id=booking_id
    )

    db.delete(booking)
    db.commit()
    recalculate_student_balances(db, student_id, period_id)
    return True
