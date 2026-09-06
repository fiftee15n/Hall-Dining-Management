import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, default=lambda: f"user-{uuid.uuid4().hex[:8]}")
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False, default="Management Team")  # 'Admin' | 'Authority' | 'Management Team'
    title = Column(String(150), nullable=True)
    department = Column(String(150), nullable=True)
    avatar_letter = Column(String(5), nullable=True)
    period_id = Column(String(50), ForeignKey("management_periods.id"), nullable=True, index=True)  # Dedicated period scope for Management Team
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
