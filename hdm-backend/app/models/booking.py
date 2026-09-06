import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, ForeignKey
from app.core.database import Base


class MealBooking(Base):
    __tablename__ = "meal_bookings"

    id = Column(String(50), primary_key=True, default=lambda: f"book-{uuid.uuid4().hex[:8]}")
    period_id = Column(String(50), ForeignKey("management_periods.id"), index=True, nullable=False)
    student_id = Column(String(50), ForeignKey("students.id"), index=True, nullable=False)
    student_name = Column(String(100), nullable=False)
    block = Column(String(20), nullable=False)
    room = Column(String(20), nullable=False)
    start_date = Column(String(20), nullable=False)
    end_date = Column(String(20), nullable=False)
    selected_meals_json = Column(Text, nullable=False)  # JSON string of DayMealSelection[]
    total_lunch_count = Column(Integer, nullable=False, default=0)
    total_dinner_count = Column(Integer, nullable=False, default=0)
    total_meals_count = Column(Integer, nullable=False, default=0)
    total_amount = Column(Float, nullable=False, default=0.0)
    paid_amount = Column(Float, nullable=False, default=0.0)
    due_amount = Column(Float, nullable=False, default=0.0)
    payable_amount = Column(Float, nullable=False, default=0.0)  # Overpayment change owed to student
    payment_method = Column(String(30), nullable=False, default="Cash")  # 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Due'
    payment_status = Column(String(30), nullable=False, default="Paid")  # 'Paid' | 'Partial' | 'Due' | 'Overpaid'
    booked_by = Column(String(100), nullable=False, default="Admin")
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
