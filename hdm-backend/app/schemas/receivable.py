from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict
from app.schemas.student import BlockName
from app.schemas.transaction import PaymentMethodType


class ReceivableCreate(BaseModel):
    studentId: str
    amount: float
    reason: str
    date: Optional[str] = None


class SettleReceivableRequest(BaseModel):
    method: PaymentMethodType = "Cash"
    note: Optional[str] = None


class ReceivableOut(BaseModel):
    id: str
    periodId: str
    studentId: str
    studentName: str
    block: BlockName
    room: str
    amount: float
    reason: str
    date: str
    status: Literal["pending", "settled"]
    settledAt: Optional[str] = None
    settledBy: Optional[str] = None
    settledMethod: Optional[PaymentMethodType] = None
    settleNote: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
