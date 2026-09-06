import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from app.core.database import Base


class Receivable(Base):
    __tablename__ = "receivables"

    id = Column(String(50), primary_key=True, default=lambda: f"rec-{uuid.uuid4().hex[:8]}")
    period_id = Column(String(50), ForeignKey("management_periods.id"), index=True, nullable=False)
    student_id = Column(String(50), ForeignKey("students.id"), index=True, nullable=False)
    student_name = Column(String(100), nullable=False)
    block = Column(String(20), nullable=False)
    room = Column(String(20), nullable=False)
    amount = Column(Float, nullable=False, default=0.0)
    reason = Column(String(255), nullable=False)
    date = Column(String(20), index=True, nullable=False)
    status = Column(String(20), nullable=False, default="pending")  # 'pending' | 'settled'
    settled_at = Column(String(50), nullable=True)
    settled_by = Column(String(100), nullable=True)
    settled_method = Column(String(30), nullable=True)  # 'Cash' | 'bKash' | 'Nagad' | 'Rocket'
    settle_note = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
