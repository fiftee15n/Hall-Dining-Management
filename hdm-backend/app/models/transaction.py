import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from app.core.database import Base


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(String(50), primary_key=True, default=lambda: f"txn-{uuid.uuid4().hex[:8]}")
    period_id = Column(String(50), ForeignKey("management_periods.id"), index=True, nullable=False)
    date = Column(String(20), index=True, nullable=False)
    amount = Column(Float, nullable=False, default=0.0)
    flow = Column(String(20), nullable=False, default="inflow")  # 'inflow' | 'outflow'
    type = Column(String(50), nullable=False)  # 'Meal Booking' | 'Due Clearance' | 'Guest Meal' | 'Feast Registration' | 'Expense Payout' | 'Student Refund' | 'Opening Balance'
    student_id = Column(String(50), ForeignKey("students.id"), nullable=True)
    student_name = Column(String(100), nullable=True)
    block = Column(String(20), nullable=True)
    room = Column(String(20), nullable=True)
    payment_method = Column(String(30), nullable=False, default="Cash")  # 'Cash' | 'bKash' | 'Nagad' | 'Rocket'
    transaction_id = Column(String(100), nullable=True)
    reference_id = Column(String(50), nullable=True)
    recorded_by = Column(String(100), nullable=False, default="Admin")
    note = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
