from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.period import ManagementPeriod
from app.models.student import Student
from app.models.booking import MealBooking
from app.models.attendance import MealAttendanceRecord
from app.models.guest_meal import GuestMeal
from app.models.feast import FeastRegistration
from app.models.expense import Expense
from app.models.receivable import Receivable
from app.models.transaction import PaymentTransaction
from app.schemas.dashboard import DashboardStats
from app.schemas.report import FinancialReportSummary, CategoryExpenseBreakdown, PaymentMethodBreakdown


def get_dashboard_stats(db: Session, period_id: str, today_str: str = None) -> DashboardStats:
    if not today_str:
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    period = db.query(ManagementPeriod).filter(ManagementPeriod.id == period_id).first()
    opening_bal = period.opening_balance if period else 0.0

    # Active students count
    active_students_count = db.query(Student).filter(Student.status == "active").count()

    # Today's attendance counts
    today_attendance = db.query(MealAttendanceRecord).filter(
        MealAttendanceRecord.period_id == period_id,
        MealAttendanceRecord.date == today_str
    ).all()

    today_lunch = [a for a in today_attendance if a.meal_type == "lunch"]
    today_dinner = [a for a in today_attendance if a.meal_type == "dinner"]
    today_taken_lunch = sum(1 for a in today_lunch if a.is_taken)
    today_taken_dinner = sum(1 for a in today_dinner if a.is_taken)

    # Today's guest meals
    today_guest_qty = db.query(func.sum(GuestMeal.quantity)).filter(
        GuestMeal.period_id == period_id,
        GuestMeal.date == today_str
    ).scalar() or 0

    # Booking collections
    booking_total = db.query(func.sum(MealBooking.total_amount)).filter(MealBooking.period_id == period_id).scalar() or 0.0
    booking_collected = db.query(func.sum(MealBooking.paid_amount)).filter(MealBooking.period_id == period_id).scalar() or 0.0
    booking_due = db.query(func.sum(MealBooking.due_amount)).filter(MealBooking.period_id == period_id).scalar() or 0.0

    # Guest meal collections
    guest_collected = db.query(func.sum(GuestMeal.total_price)).filter(
        GuestMeal.period_id == period_id, GuestMeal.payment_status == "Paid"
    ).scalar() or 0.0
    guest_due = db.query(func.sum(GuestMeal.total_price)).filter(
        GuestMeal.period_id == period_id, GuestMeal.payment_status == "Due"
    ).scalar() or 0.0

    # Feast collections
    feast_collected = db.query(func.sum(FeastRegistration.paid_amount)).filter(
        FeastRegistration.period_id == period_id
    ).scalar() or 0.0
    feast_due = db.query(func.sum(FeastRegistration.due_amount)).filter(
        FeastRegistration.period_id == period_id
    ).scalar() or 0.0

    total_expected = float(booking_total + guest_collected + guest_due + feast_collected + feast_due)
    total_collected = float(booking_collected + guest_collected + feast_collected)
    total_due = float(booking_due + guest_due + feast_due)

    # Expenses
    total_expense = db.query(func.sum(Expense.total_cost)).filter(Expense.period_id == period_id).scalar() or 0.0
    today_expense = db.query(func.sum(Expense.total_cost)).filter(
        Expense.period_id == period_id,
        Expense.date == today_str
    ).scalar() or 0.0

    # Receivables & Refunds
    pending_receivables = db.query(func.sum(Receivable.amount)).filter(
        Receivable.period_id == period_id,
        Receivable.status == "pending"
    ).scalar() or 0.0

    settled_refunds = db.query(func.sum(Receivable.amount)).filter(
        Receivable.period_id == period_id,
        Receivable.status == "settled"
    ).scalar() or 0.0

    # Current net cash balance = Opening Balance + Total Collected - Total Expenses - Settled Refunds
    current_balance = float(opening_bal + total_collected - total_expense - settled_refunds)

    return DashboardStats(
        todayTotalMeals=len(today_lunch) + len(today_dinner),
        todayLunchMeals=len(today_lunch),
        todayDinnerMeals=len(today_dinner),
        todayTakenLunch=today_taken_lunch,
        todayTakenDinner=today_taken_dinner,
        todayGuestMeals=int(today_guest_qty),
        registeredStudentsCount=active_students_count,
        totalExpectedCollection=total_expected,
        totalCollected=total_collected,
        totalDue=total_due,
        totalPayable=float(pending_receivables),
        totalExpense=float(total_expense),
        todayExpense=float(today_expense),
        currentBalance=current_balance,
        studentReceivablesTotal=float(pending_receivables)
    )


def get_financial_summary_report(db: Session, period_id: str) -> FinancialReportSummary:
    period = db.query(ManagementPeriod).filter(ManagementPeriod.id == period_id).first()
    opening_bal = period.opening_balance if period else 0.0

    # Total collected across all channels
    booking_collected = db.query(func.sum(MealBooking.paid_amount)).filter(MealBooking.period_id == period_id).scalar() or 0.0
    guest_collected = db.query(func.sum(GuestMeal.total_price)).filter(
        GuestMeal.period_id == period_id, GuestMeal.payment_status == "Paid"
    ).scalar() or 0.0
    feast_collected = db.query(func.sum(FeastRegistration.paid_amount)).filter(
        FeastRegistration.period_id == period_id
    ).scalar() or 0.0

    total_collected = float(booking_collected + guest_collected + feast_collected)
    total_expenses = db.query(func.sum(Expense.total_cost)).filter(Expense.period_id == period_id).scalar() or 0.0

    settled_refunds = db.query(func.sum(Receivable.amount)).filter(
        Receivable.period_id == period_id, Receivable.status == "settled"
    ).scalar() or 0.0

    pending_receivables = db.query(func.sum(Receivable.amount)).filter(
        Receivable.period_id == period_id, Receivable.status == "pending"
    ).scalar() or 0.0

    current_net = float(opening_bal + total_collected - total_expenses - settled_refunds)

    # Category breakdown
    expenses = db.query(Expense).filter(Expense.period_id == period_id).all()
    cat_totals = {}
    for exp in expenses:
        cat_totals[exp.category] = cat_totals.get(exp.category, 0.0) + exp.total_cost

    cat_breakdown = []
    for cat, amt in cat_totals.items():
        pct = (amt / total_expenses * 100) if total_expenses > 0 else 0.0
        cat_breakdown.append(CategoryExpenseBreakdown(category=cat, amount=amt, percentage=round(pct, 1)))

    # Payment method breakdown
    txns = db.query(PaymentTransaction).filter(PaymentTransaction.period_id == period_id).all()
    pm_stats = {}
    for t in txns:
        m = t.payment_method or "Cash"
        if m not in pm_stats:
            pm_stats[m] = {"inflow": 0.0, "outflow": 0.0}
        if t.flow == "inflow":
            pm_stats[m]["inflow"] += t.amount
        else:
            pm_stats[m]["outflow"] += t.amount

    pm_breakdown = []
    for m, vals in pm_stats.items():
        pm_breakdown.append(PaymentMethodBreakdown(
            method=m,
            inflow=vals["inflow"],
            outflow=vals["outflow"],
            net=vals["inflow"] - vals["outflow"]
        ))

    return FinancialReportSummary(
        openingBalance=float(opening_bal),
        totalCollected=total_collected,
        totalExpenses=float(total_expenses),
        settledRefunds=float(settled_refunds),
        pendingReceivables=float(pending_receivables),
        currentNetBalance=current_net,
        expenseCategories=cat_breakdown,
        paymentMethods=pm_breakdown
    )
