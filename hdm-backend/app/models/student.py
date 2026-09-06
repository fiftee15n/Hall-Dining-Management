import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime
from app.core.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(String(50), primary_key=True, default=lambda: f"std-{uuid.uuid4().hex[:8]}")
    student_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), index=True, nullable=False)
    block = Column(String(20), index=True, nullable=False)  # 'A' | 'B' | 'C' | 'D' | 'Main' | 'Ext'
    room = Column(String(20), index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    department = Column(String(100), nullable=True)
    batch = Column(String(20), nullable=True)
    status = Column(String(20), nullable=False, default="active")  # 'active' | 'inactive'
    balance_due = Column(Float, nullable=False, default=0.0)
    balance_receivable = Column(Float, nullable=False, default=0.0)
    email = Column(String(120), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
