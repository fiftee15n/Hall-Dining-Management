from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    students,
    periods,
    bookings,
    attendance,
    guests,
    feasts,
    expenses,
    finance,
    dashboard,
    audit,
    settings,
    reports,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(students.router, prefix="/students", tags=["Students"])
api_router.include_router(periods.router, prefix="/periods", tags=["Management Periods"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Meal Bookings"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["Meal Attendance"])
api_router.include_router(guests.router, prefix="/guest-meals", tags=["Guest Meals"])
api_router.include_router(feasts.router, prefix="/feasts", tags=["Feasts"])
api_router.include_router(expenses.router, prefix="/expenses", tags=["Expenses"])
api_router.include_router(finance.router, prefix="/finance", tags=["Finance & Transactions"])
api_router.include_router(audit.router, prefix="/audit-logs", tags=["Audit Logs"])
api_router.include_router(settings.router, prefix="/settings", tags=["Operational Settings"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports & Exports"])
