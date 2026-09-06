from sqlalchemy import Column, String, Integer
from app.core.database import Base


class HallSettings(Base):
    __tablename__ = "hall_settings"

    id = Column(Integer, primary_key=True, default=1)
    hall_name = Column(String(150), nullable=False, default="New Female Hall Dining")
    university_name = Column(String(150), nullable=False, default="Gazipur Agriculture University")
    currency_symbol = Column(String(10), nullable=False, default="৳")
    lunch_time = Column(String(50), nullable=False, default="12:30 PM – 03:00 PM")
    dinner_time = Column(String(50), nullable=False, default="08:00 PM – 10:30 PM")
    contact_emergency = Column(String(50), nullable=False, default="+880 1700-000000")
