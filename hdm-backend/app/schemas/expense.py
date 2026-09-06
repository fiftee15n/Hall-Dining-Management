from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict


ExpenseCategoryType = Literal[
    "Grocery",
    "Meat",
    "Fish",
    "Vegetable",
    "Spices & Oil",
    "Gas & Utility",
    "Labor & Cook",
    "Feast Special",
    "Others"
]


class ExpenseBase(BaseModel):
    item: str
    quantity: str
    unit: Optional[str] = ""
    totalCost: float
    date: str
    category: ExpenseCategoryType
    purchasedBy: str
    vendor: Optional[str] = None
    memoNo: Optional[str] = None
    note: Optional[str] = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    item: Optional[str] = None
    quantity: Optional[str] = None
    unit: Optional[str] = None
    totalCost: Optional[float] = None
    date: Optional[str] = None
    category: Optional[ExpenseCategoryType] = None
    purchasedBy: Optional[str] = None
    vendor: Optional[str] = None
    memoNo: Optional[str] = None
    note: Optional[str] = None


class ExpenseOut(ExpenseBase):
    id: str
    periodId: str
    createdAt: str

    model_config = ConfigDict(from_attributes=True)
