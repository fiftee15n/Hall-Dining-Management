from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict
from app.schemas.student import BlockName


TransactionType = Literal[
    "Meal Booking",
    "Due Clearance",
    "Guest Meal",
    "Feast Registration",
    "Expense Payout",
    "Student Refund",
    "Opening Balance"
]

PaymentMethodType = Literal["Cash", "bKash", "Nagad", "Rocket"]


class PaymentTransactionCreate(BaseModel):
    date: str
    amount: float
    flow: Literal["inflow", "outflow"]
    type: TransactionType
    studentId: Optional[str] = None
    studentName: Optional[str] = None
    block: Optional[BlockName] = None
    room: Optional[str] = None
    paymentMethod: PaymentMethodType = "Cash"
    transactionId: Optional[str] = None
    referenceId: Optional[str] = None
    note: Optional[str] = None


class ManualPaymentRequest(BaseModel):
    studentId: str
    amount: float
    paymentMethod: PaymentMethodType = "Cash"
    note: Optional[str] = None


class PaymentTransactionOut(BaseModel):
    id: str
    periodId: str
    date: str
    amount: float
    flow: Literal["inflow", "outflow"]
    type: TransactionType
    studentId: Optional[str] = None
    studentName: Optional[str] = None
    block: Optional[BlockName] = None
    room: Optional[str] = None
    paymentMethod: PaymentMethodType
    transactionId: Optional[str] = None
    referenceId: Optional[str] = None
    recordedBy: str
    note: Optional[str] = None
    createdAt: str

    model_config = ConfigDict(from_attributes=True)
