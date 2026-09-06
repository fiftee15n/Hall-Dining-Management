import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey
from app.core.database import Base


class MealAttendanceRecord(Base):
    __tablename__ = "meal_attendance"

    id = Column(String(50), primary_key=True, default=lambda: f"att-{uuid.uuid4().hex[:8]}")
    period_id = Column(String(50), ForeignKey("management_periods.id"), index=True, nullable=False)
    date = Column(String(20), index=True, nullable=False)
    meal_type = Column(String(20), index=True, nullable=False)  # 'lunch' | 'dinner'
    student_id = Column(String(50), ForeignKey("students.id"), index=True, nullable=False)
    student_name = Column(String(100), nullable=False)
    block = Column(String(20), nullable=False)
    room = Column(String(20), nullable=False)
    is_booked = Column(Boolean, nullable=False, default=True)
    is_taken = Column(Boolean, nullable=False, default=False)
    taken_at = Column(String(50), nullable=True)
    has_due = Column(Boolean, nullable=False, default=False)
    due_amount = Column(Float, nullable=False, default=0.0)
    payment_collected_on_spot = Column(Float, nullable=True, default=0.0)
    payment_method_on_spot = Column(String(30), nullable=True)  # 'Cash' | 'bKash' | 'Nagad' | 'Rocket'
    marked_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
