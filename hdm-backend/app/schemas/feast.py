from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict
from app.schemas.student import BlockName


class FeastCreate(BaseModel):
    title: str
    date: str
    mealType: Literal["lunch", "dinner"] = "dinner"
    regularPrice: float = 160.0
    guestPrice: float = 220.0
    menuDescription: Optional[str] = ""
    maxCapacity: int = 300
    status: Literal["upcoming", "ongoing", "completed"] = "upcoming"


class FeastOut(BaseModel):
    id: str
    periodId: str
    title: str
    date: str
    mealType: Literal["lunch", "dinner"]
    regularPrice: float
    guestPrice: float
    menuDescription: Optional[str] = None
    maxCapacity: int
    registeredCount: int
    status: Literal["upcoming", "ongoing", "completed"]
    createdAt: str

    model_config = ConfigDict(from_attributes=True)


class FeastRegistrationCreate(BaseModel):
    studentId: str
    isGuest: bool = False
    guestCount: int = 0
    paidAmount: float = 0.0
    paymentMethod: Literal["Cash", "bKash", "Nagad", "Rocket", "Due"] = "Cash"


class FeastRegistrationOut(BaseModel):
    id: str
    feastId: str
    periodId: str
    studentId: str
    studentName: str
    block: BlockName
    room: str
    isGuest: bool
    guestCount: int
    totalAmount: float
    paidAmount: float
    dueAmount: float
    payableAmount: float = 0.0
    paymentMethod: Literal["Cash", "bKash", "Nagad", "Rocket", "Due"]
    paymentStatus: Literal["Paid", "Partial", "Due", "Overpaid"]
    status: Literal["confirmed", "attended", "cancelled"]
    tokenNumber: int
    createdAt: str

    model_config = ConfigDict(from_attributes=True)
