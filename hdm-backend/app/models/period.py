import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime
from app.core.database import Base


class ManagementPeriod(Base):
    __tablename__ = "management_periods"

    id = Column(String(50), primary_key=True, default=lambda: f"period-{uuid.uuid4().hex[:8]}")
    name = Column(String(100), nullable=False)
    code = Column(String(20), nullable=False)
    start_date = Column(String(20), nullable=False)
    end_date = Column(String(20), nullable=False)
    managed_by_team = Column(String(100), nullable=False, default="Management Team")
    team_lead = Column(String(100), nullable=False, default="Admin")
    contact_number = Column(String(50), nullable=True)
    management_email = Column(String(120), nullable=True)  # System email: mp_periodno.hdm@gmail.com
    team_contact_email = Column(String(120), nullable=True)  # Actual Gmail of committee members to dispatch credentials
    lunch_price = Column(Float, nullable=False, default=50.0)
    dinner_price = Column(Float, nullable=False, default=50.0)
    feast_regular_price = Column(Float, nullable=False, default=160.0)
    feast_guest_price = Column(Float, nullable=False, default=220.0)
    min_booking_days = Column(Integer, nullable=False, default=3)
    opening_balance = Column(Float, nullable=False, default=0.0)
    status = Column(String(20), nullable=False, default="active")  # 'active' | 'completed' | 'upcoming'
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
