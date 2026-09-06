import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from app.core.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String(50), primary_key=True, default=lambda: f"exp-{uuid.uuid4().hex[:8]}")
    period_id = Column(String(50), ForeignKey("management_periods.id"), index=True, nullable=False)
    item = Column(String(150), nullable=False)
    quantity = Column(String(50), nullable=False)
    unit = Column(String(20), nullable=True)
    total_cost = Column(Float, nullable=False, default=0.0)
    date = Column(String(20), index=True, nullable=False)
    category = Column(String(50), index=True, nullable=False)  # 'Grocery' | 'Meat' | 'Fish' | 'Vegetable' | 'Spices & Oil' | 'Gas & Utility' | 'Labor & Cook' | 'Feast Special' | 'Others'
    purchased_by = Column(String(100), nullable=False)
    vendor = Column(String(100), nullable=True)
    memo_no = Column(String(50), nullable=True)
    note = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
