from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict


BlockName = Literal["A", "B", "C", "D", "Main", "Ext"]


class StudentBase(BaseModel):
    studentId: str = Field(..., description="Unique student ID or roll")
    name: str
    block: BlockName
    room: str
    phone: Optional[str] = ""
    department: Optional[str] = ""
    batch: Optional[str] = ""
    status: Literal["active", "inactive"] = "active"
    email: Optional[str] = None


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    studentId: Optional[str] = None
    name: Optional[str] = None
    block: Optional[BlockName] = None
    room: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    batch: Optional[str] = None
    status: Optional[Literal["active", "inactive"]] = None
    email: Optional[str] = None
    balanceDue: Optional[float] = None
    balanceReceivable: Optional[float] = None


class StudentOut(StudentBase):
    id: str
    balanceDue: float = 0.0
    balanceReceivable: float = 0.0

    model_config = ConfigDict(from_attributes=True)


class StudentImportItem(BaseModel):
    name: str
    block: BlockName
    room: str
    studentId: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    batch: Optional[str] = None
