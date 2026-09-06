from typing import List, Optional, Literal
from pydantic import BaseModel, ConfigDict
from app.schemas.student import BlockName


class DayMealSelection(BaseModel):
    date: str
    lunch: bool
    dinner: bool


class MealBookingCreate(BaseModel):
    studentId: str
    startDate: str
    endDate: str
    selectedMeals: List[DayMealSelection]
    paidAmount: float = 0.0
    paymentMethod: Literal["Cash", "bKash", "Nagad", "Rocket", "Due"] = "Cash"
    notes: Optional[str] = None


class MealBookingOut(BaseModel):
    id: str
    periodId: str
    studentId: str
    studentName: str
    block: BlockName
    room: str
    startDate: str
    endDate: str
    selectedMeals: List[DayMealSelection]
    totalLunchCount: int
    totalDinnerCount: int
    totalMealsCount: int
    totalAmount: float
    paidAmount: float
    dueAmount: float
    payableAmount: float = 0.0
    paymentMethod: Literal["Cash", "bKash", "Nagad", "Rocket", "Due"]
    paymentStatus: Literal["Paid", "Partial", "Due", "Overpaid"]
    bookedBy: str
    createdAt: str
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
