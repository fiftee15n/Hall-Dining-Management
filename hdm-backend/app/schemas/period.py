from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict


class ManagementPeriodBase(BaseModel):
    name: str
    code: str
    startDate: str
    endDate: str
    managedByTeam: str = "Management Team"
    teamLead: str = "Admin"
    contactNumber: Optional[str] = ""
    managementEmail: Optional[str] = None  # Format: mp_periodno.hdm@gmail.com
    teamContactEmail: Optional[str] = None  # Committee members' actual Gmail
    lunchPrice: float = 50.0
    dinnerPrice: float = 50.0
    feastRegularPrice: float = 160.0
    feastGuestPrice: float = 220.0
    minBookingDays: int = 3
    openingBalance: float = 0.0
    status: Literal["active", "completed", "upcoming"] = "active"
    notes: Optional[str] = None


class ManagementPeriodCreate(ManagementPeriodBase):
    managementPassword: Optional[str] = "Management@@"  # Set by authority on creation


class ManagementPeriodUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    managedByTeam: Optional[str] = None
    teamLead: Optional[str] = None
    contactNumber: Optional[str] = None
    managementEmail: Optional[str] = None
    teamContactEmail: Optional[str] = None
    lunchPrice: Optional[float] = None
    dinnerPrice: Optional[float] = None
    feastRegularPrice: Optional[float] = None
    feastGuestPrice: Optional[float] = None
    minBookingDays: Optional[int] = None
    openingBalance: Optional[float] = None
    status: Optional[Literal["active", "completed", "upcoming"]] = None
    notes: Optional[str] = None


class ResetPeriodPasswordRequest(BaseModel):
    newPassword: str


class ManagementPeriodOut(ManagementPeriodBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
