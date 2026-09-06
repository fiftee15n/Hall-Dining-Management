from typing import List, Dict, Any
from pydantic import BaseModel


class CategoryExpenseBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float


class PaymentMethodBreakdown(BaseModel):
    method: str
    inflow: float
    outflow: float
    net: float


class FinancialReportSummary(BaseModel):
    openingBalance: float
    totalCollected: float
    totalExpenses: float
    settledRefunds: float
    pendingReceivables: float
    currentNetBalance: float
    expenseCategories: List[CategoryExpenseBreakdown]
    paymentMethods: List[PaymentMethodBreakdown]
