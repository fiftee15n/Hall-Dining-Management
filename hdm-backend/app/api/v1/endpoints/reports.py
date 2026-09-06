import csv
import io
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.student import Student
from app.models.booking import MealBooking
from app.models.attendance import MealAttendanceRecord
from app.models.expense import Expense
from app.models.transaction import PaymentTransaction
from app.schemas.report import FinancialReportSummary
from app.services.stats_service import get_financial_summary_report
from app.api.deps import get_active_period

router = APIRouter()


@router.get("/financial-summary", response_model=FinancialReportSummary)
def get_financial_summary(
    period_id: Optional[str] = Query(None, description="Management period ID"),
    db: Session = Depends(get_db)
):
    """Retrieve full financial summary report with category and payment method breakdowns."""
    active_period = get_active_period(period_id, db)
    return get_financial_summary_report(db, active_period.id)


@router.get("/export-csv/{report_type}")
def export_csv(
    report_type: str,
    period_id: Optional[str] = Query(None, description="Management period ID"),
    db: Session = Depends(get_db)
):
    """Export tabular data to CSV (students, expenses, transactions, bookings, dues)."""
    active_period = get_active_period(period_id, db)
    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == "students":
        writer.writerow(["Student ID", "Name", "Block", "Room", "Phone", "Department", "Batch", "Status", "Balance Due (৳)", "Receivable (৳)"])
        students = db.query(Student).order_by(Student.room.asc()).all()
        for s in students:
            writer.writerow([s.student_id, s.name, s.block, s.room, s.phone or "", s.department or "", s.batch or "", s.status, s.balance_due, s.balance_receivable])
        filename = "students_list.csv"

    elif report_type == "expenses":
        writer.writerow(["Date", "Item", "Quantity", "Category", "Total Cost (৳)", "Purchased By", "Vendor", "Memo No", "Note"])
        expenses = db.query(Expense).filter(Expense.period_id == active_period.id).order_by(Expense.date.desc()).all()
        for e in expenses:
            writer.writerow([e.date, e.item, f"{e.quantity} {e.unit or ''}".strip(), e.category, e.total_cost, e.purchased_by, e.vendor or "", e.memo_no or "", e.note or ""])
        filename = f"expenses_{active_period.code}.csv"

    elif report_type == "transactions":
        writer.writerow(["Date", "Type", "Flow", "Amount (৳)", "Method", "Student", "Block", "Room", "Recorded By", "Note"])
        txns = db.query(PaymentTransaction).filter(PaymentTransaction.period_id == active_period.id).order_by(PaymentTransaction.date.desc()).all()
        for t in txns:
            writer.writerow([t.date, t.type, t.flow, t.amount, t.payment_method, t.student_name or "", t.block or "", t.room or "", t.recorded_by, t.note or ""])
        filename = f"transactions_{active_period.code}.csv"

    elif report_type == "dues":
        writer.writerow(["Student ID", "Name", "Block", "Room", "Phone", "Total Due (৳)", "Payable (৳)"])
        students = db.query(Student).filter((Student.balance_due > 0) | (Student.balance_receivable > 0)).order_by(Student.balance_due.desc()).all()
        for s in students:
            writer.writerow([s.student_id, s.name, s.block, s.room, s.phone or "", s.balance_due, s.balance_receivable])
        filename = f"student_dues_{active_period.code}.csv"

    else:
        writer.writerow(["Error"])
        filename = "export.csv"

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
