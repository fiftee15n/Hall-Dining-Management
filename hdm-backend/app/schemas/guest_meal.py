from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict
from app.schemas.student import BlockName


class GuestMealCreate(BaseModel):
    guestName: Optional[str] = None
    hostStudentName: str
    block: BlockName
    room: str
    mealType: Literal["lunch", "dinner"]
    date: str
    quantity: int = 1
    unitPrice: float = 60.0
    paymentMethod: Literal["Cash", "bKash", "Nagad", "Rocket", "Due"] = "Cash"
    note: Optional[str] = None


class GuestMealOut(BaseModel):
    id: str
    periodId: str
    guestName: str
    hostStudentId: Optional[str] = None
    hostStudentName: str
    block: BlockName
    room: str
    mealType: Literal["lunch", "dinner"]
    date: str
    quantity: int
    unitPrice: float
    totalPrice: float
    paymentMethod: Literal["Cash", "bKash", "Nagad", "Rocket", "Due"]
    paymentStatus: Literal["Paid", "Due"]
    recordedBy: str
    createdAt: str
    note: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class GuestMealPayRequest(BaseModel):
    paymentMethod: Literal["Cash", "bKash", "Nagad", "Rocket"]
