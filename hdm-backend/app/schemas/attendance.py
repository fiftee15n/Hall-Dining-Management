from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict
from app.schemas.student import BlockName


class MealAttendanceOut(BaseModel):
    id: str
    periodId: str
    date: str
    mealType: Literal["lunch", "dinner"]
    studentId: str
    studentName: str
    block: BlockName
    room: str
    isBooked: bool
    isTaken: bool
    takenAt: Optional[str] = None
    hasDue: bool
    dueAmount: float
    paymentCollectedOnSpot: Optional[float] = None
    paymentMethodOnSpot: Optional[Literal["Cash", "bKash", "Nagad", "Rocket"]] = None
    markedBy: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MarkAttendanceRequest(BaseModel):
    isTaken: bool
    paymentCollected: Optional[float] = None
    paymentMethod: Optional[Literal["Cash", "bKash", "Nagad", "Rocket"]] = None


class QuickTakeMealRequest(BaseModel):
    studentId: str
    date: str
    mealType: Literal["lunch", "dinner"]
    onSpotPayment: Optional[float] = None
    paymentMethod: Optional[Literal["Cash", "bKash", "Nagad", "Rocket"]] = None
