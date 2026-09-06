from typing import Optional
from pydantic import BaseModel


class HallSettingsBase(BaseModel):
    hallName: str = "New Female Hall Dining"
    universityName: str = "Gazipur Agriculture University"
    currencySymbol: str = "৳"
    lunchTime: str = "12:30 PM – 03:00 PM"
    dinnerTime: str = "08:00 PM – 10:30 PM"
    contactEmergency: str = "+880 1700-000000"


class HallSettingsUpdate(BaseModel):
    hallName: Optional[str] = None
    universityName: Optional[str] = None
    currencySymbol: Optional[str] = None
    lunchTime: Optional[str] = None
    dinnerTime: Optional[str] = None
    contactEmergency: Optional[str] = None


class HallSettingsOut(HallSettingsBase):
    pass
