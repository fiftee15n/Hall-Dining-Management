import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.booking import MealBooking
from app.schemas.booking import MealBookingCreate, MealBookingOut, DayMealSelection
from app.services.booking_service import create_meal_booking, cancel_meal_booking
from app.api.deps import get_active_period, get_current_user_optional

router = APIRouter()


def booking_to_out(b: MealBooking) -> MealBookingOut:
    try:
        meals = json.loads(b.selected_meals_json)
        selected_meals = [DayMealSelection(**m) for m in meals]
    except Exception:
        selected_meals = []

    created_at_str = b.created_at.strftime("%Y-%m-%d %H:%M") if b.created_at else ""

    return MealBookingOut(
        id=b.id,
        periodId=b.period_id,
        studentId=b.student_id,
        studentName=b.student_name,
        block=b.block,
        room=b.room,
        startDate=b.start_date,
        endDate=b.end_date,
        selectedMeals=selected_meals,
        totalLunchCount=b.total_lunch_count,
        totalDinnerCount=b.total_dinner_count,
        totalMealsCount=b.total_meals_count,
        totalAmount=float(b.total_amount),
        paidAmount=float(b.paid_amount),
        dueAmount=float(b.due_amount),
        payableAmount=float(b.payable_amount or 0.0),
        paymentMethod=b.payment_method,
        paymentStatus=b.payment_status,
        bookedBy=b.booked_by,
        createdAt=created_at_str,
        notes=b.notes
    )


@router.get("", response_model=List[MealBookingOut])
def get_bookings(
    period_id: Optional[str] = Query(None, description="Management period ID"),
    student_id: Optional[str] = Query(None, description="Filter by student ID"),
    db: Session = Depends(get_db)
):
    """List bookings for the specified or active management period."""
    active_period = get_active_period(period_id, db)
    query = db.query(MealBooking).filter(MealBooking.period_id == active_period.id)

    if student_id:
        query = query.filter(MealBooking.student_id == student_id)

    bookings = query.order_by(MealBooking.created_at.desc()).all()
    return [booking_to_out(b) for b in bookings]


@router.post("", response_model=MealBookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_in: MealBookingCreate,
    period_id: Optional[str] = Query(None, description="Target period ID"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Create a new meal booking with automatic attendance and payment processing."""
    active_period = get_active_period(period_id, db)
    user_name = user.name if user else "Admin"
    new_booking = create_meal_booking(
        db=db,
        booking_in=booking_in,
        active_period=active_period,
        booked_by=user_name
    )
    return booking_to_out(new_booking)


@router.delete("/{booking_id}")
def cancel_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Cancel meal booking, reverse attendance slots, and issue student refund receivable."""
    user_name = user.name if user else "Admin"
    cancel_meal_booking(db, booking_id, cancelled_by=user_name)
    return {"success": True, "message": f"Booking {booking_id} cancelled successfully."}
