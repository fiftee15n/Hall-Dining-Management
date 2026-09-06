import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey
from app.core.database import Base


class Feast(Base):
    __tablename__ = "feasts"

    id = Column(String(50), primary_key=True, default=lambda: f"feast-{uuid.uuid4().hex[:8]}")
    period_id = Column(String(50), ForeignKey("management_periods.id"), index=True, nullable=False)
    title = Column(String(150), nullable=False)
    date = Column(String(20), nullable=False)
    meal_type = Column(String(20), nullable=False, default="dinner")  # 'lunch' | 'dinner'
    regular_price = Column(Float, nullable=False, default=160.0)
    guest_price = Column(Float, nullable=False, default=220.0)
    menu_description = Column(String(500), nullable=True)
    max_capacity = Column(Integer, nullable=False, default=300)
    registered_count = Column(Integer, nullable=False, default=0)
    status = Column(String(20), nullable=False, default="upcoming")  # 'upcoming' | 'ongoing' | 'completed'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class FeastRegistration(Base):
    __tablename__ = "feast_registrations"

    id = Column(String(50), primary_key=True, default=lambda: f"freg-{uuid.uuid4().hex[:8]}")
    feast_id = Column(String(50), ForeignKey("feasts.id"), index=True, nullable=False)
    period_id = Column(String(50), ForeignKey("management_periods.id"), index=True, nullable=False)
    student_id = Column(String(50), ForeignKey("students.id"), index=True, nullable=False)
    student_name = Column(String(100), nullable=False)
    block = Column(String(20), nullable=False)
    room = Column(String(20), nullable=False)
    is_guest = Column(Boolean, nullable=False, default=False)
    guest_count = Column(Integer, nullable=False, default=0)
    total_amount = Column(Float, nullable=False, default=0.0)
    paid_amount = Column(Float, nullable=False, default=0.0)
    due_amount = Column(Float, nullable=False, default=0.0)
    payable_amount = Column(Float, nullable=False, default=0.0)
    payment_method = Column(String(30), nullable=False, default="Cash")
    payment_status = Column(String(30), nullable=False, default="Paid")
    status = Column(String(20), nullable=False, default="confirmed")  # 'confirmed' | 'attended' | 'cancelled'
    token_number = Column(Integer, nullable=False, default=101)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
