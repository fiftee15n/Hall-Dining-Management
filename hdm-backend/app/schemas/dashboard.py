from pydantic import BaseModel


class DashboardStats(BaseModel):
    todayTotalMeals: int = 0
    todayLunchMeals: int = 0
    todayDinnerMeals: int = 0
    todayTakenLunch: int = 0
    todayTakenDinner: int = 0
    todayGuestMeals: int = 0
    registeredStudentsCount: int = 0
    totalExpectedCollection: float = 0.0
    totalCollected: float = 0.0
    totalDue: float = 0.0
    totalPayable: float = 0.0
    totalExpense: float = 0.0
    todayExpense: float = 0.0
    currentBalance: float = 0.0
    studentReceivablesTotal: float = 0.0
