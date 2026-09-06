import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from app.core.database import Base


class GuestMeal(Base):
    __tablename__ = "guest_meals"

    id = Column(String(50), primary_key=True, default=lambda: f"guest-{uuid.uuid4().hex[:8]}")
    period_id = Column(String(50), ForeignKey("management_periods.id"), index=True, nullable=False)
    guest_name = Column(String(100), nullable=False)
    host_student_id = Column(String(50), ForeignKey("students.id"), nullable=True)
    host_student_name = Column(String(100), nullable=False)
    block = Column(String(20), nullable=False)
    room = Column(String(20), nullable=False)
    meal_type = Column(String(20), nullable=False)  # 'lunch' | 'dinner'
    date = Column(String(20), index=True, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False, default=60.0)
    total_price = Column(Float, nullable=False, default=60.0)
    payment_method = Column(String(30), nullable=False, default="Cash")  # 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Due'
    payment_status = Column(String(30), nullable=False, default="Paid")  # 'Paid' | 'Due'
    recorded_by = Column(String(100), nullable=False, default="Admin")
    note = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
