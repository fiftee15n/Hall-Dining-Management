import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(50), primary_key=True, default=lambda: f"log-{uuid.uuid4().hex[:8]}")
    period_id = Column(String(50), ForeignKey("management_periods.id"), nullable=True)
    user = Column(String(100), nullable=False, default="Admin")
    role = Column(String(50), nullable=False, default="admin")
    action = Column(String(100), nullable=False)
    details = Column(String(500), nullable=False)
    timestamp = Column(String(50), nullable=False)
    entity_type = Column(String(50), nullable=True)  # 'Expense' | 'Booking' | 'Payment' | 'Period' | 'Attendance' | 'Receivable'
    entity_id = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
