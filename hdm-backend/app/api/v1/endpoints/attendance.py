from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.attendance import MealAttendanceRecord
from app.schemas.attendance import MealAttendanceOut, MarkAttendanceRequest, QuickTakeMealRequest
from app.services.attendance_service import mark_meal_attendance, quick_take_meal
from app.api.deps import get_active_period, get_current_user_optional

router = APIRouter()


def attendance_to_out(a: MealAttendanceRecord) -> MealAttendanceOut:
    return MealAttendanceOut(
        id=a.id,
        periodId=a.period_id,
        date=a.date,
        mealType=a.meal_type,
        studentId=a.student_id,
        studentName=a.student_name,
        block=a.block,
        room=a.room,
        isBooked=a.is_booked,
        isTaken=a.is_taken,
        takenAt=a.taken_at,
        hasDue=a.has_due,
        dueAmount=float(a.due_amount or 0.0),
        paymentCollectedOnSpot=a.payment_collected_on_spot,
        paymentMethodOnSpot=a.payment_method_on_spot,
        markedBy=a.marked_by
    )


@router.get("", response_model=List[MealAttendanceOut])
def get_attendance(
    period_id: Optional[str] = Query(None, description="Management period ID"),
    date: Optional[str] = Query(None, description="Specific date YYYY-MM-DD"),
    meal_type: Optional[str] = Query(None, description="lunch or dinner"),
    block: Optional[str] = Query(None, description="Block A, B, C, D"),
    is_taken: Optional[bool] = Query(None, description="Filter taken status"),
    db: Session = Depends(get_db)
):
    """List attendance records with filters."""
    active_period = get_active_period(period_id, db)
    query = db.query(MealAttendanceRecord).filter(MealAttendanceRecord.period_id == active_period.id)

    if date:
        query = query.filter(MealAttendanceRecord.date == date)
    if meal_type:
        query = query.filter(MealAttendanceRecord.meal_type == meal_type)
    if block:
        query = query.filter(MealAttendanceRecord.block == block)
    if is_taken is not None:
        query = query.filter(MealAttendanceRecord.is_taken == is_taken)

    records = query.order_by(MealAttendanceRecord.room.asc(), MealAttendanceRecord.student_name.asc()).all()
    return [attendance_to_out(r) for r in records]


@router.post("/{attendance_id}/mark", response_model=MealAttendanceOut)
def mark_attendance(
    attendance_id: str,
    req: MarkAttendanceRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Mark meal attendance taken/unmarked and process on-spot payment if provided."""
    user_name = user.name if user else "Admin"
    updated = mark_meal_attendance(
        db=db,
        attendance_id=attendance_id,
        is_taken=req.isTaken,
        payment_collected=req.paymentCollected,
        payment_method=req.paymentMethod,
        marked_by=user_name
    )
    return attendance_to_out(updated)


@router.post("/quick-take", response_model=MealAttendanceOut)
def quick_take(
    req: QuickTakeMealRequest,
    period_id: Optional[str] = Query(None, description="Target period ID"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Instant unbooked meal attendance & on-spot payment recording."""
    active_period = get_active_period(period_id, db)
    user_name = user.name if user else "Admin"
    record = quick_take_meal(
        db=db,
        student_id=req.studentId,
        date=req.date,
        meal_type=req.mealType,
        period_id=active_period.id,
        on_spot_payment=req.onSpotPayment,
        payment_method=req.paymentMethod,
        marked_by=user_name
    )
    return attendance_to_out(record)
