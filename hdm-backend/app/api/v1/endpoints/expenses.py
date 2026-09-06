import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.expense import Expense
from app.models.transaction import PaymentTransaction
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseOut
from app.services.finance_service import record_transaction
from app.services.audit_service import log_audit
from app.api.deps import get_active_period, get_current_user_optional

router = APIRouter()


def expense_to_out(e: Expense) -> ExpenseOut:
    created_at_str = e.created_at.strftime("%Y-%m-%d %H:%M") if e.created_at else ""
    return ExpenseOut(
        id=e.id,
        periodId=e.period_id,
        item=e.item,
        quantity=e.quantity,
        unit=e.unit or "",
        totalCost=float(e.total_cost),
        date=e.date,
        category=e.category,
        purchasedBy=e.purchased_by,
        vendor=e.vendor,
        memoNo=e.memo_no,
        note=e.note,
        createdAt=created_at_str
    )


@router.get("", response_model=List[ExpenseOut])
def get_expenses(
    period_id: Optional[str] = Query(None, description="Management period ID"),
    category: Optional[str] = Query(None, description="Category filter"),
    date: Optional[str] = Query(None, description="Date filter"),
    db: Session = Depends(get_db)
):
    """List expenses with optional category and date filters."""
    active_period = get_active_period(period_id, db)
    query = db.query(Expense).filter(Expense.period_id == active_period.id)

    if category:
        query = query.filter(Expense.category == category)
    if date:
        query = query.filter(Expense.date == date)

    expenses = query.order_by(Expense.date.desc(), Expense.created_at.desc()).all()
    return [expense_to_out(e) for e in expenses]


@router.post("", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def add_expense(
    expense_in: ExpenseCreate,
    period_id: Optional[str] = Query(None, description="Target period ID"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Record an operational expense (grocery, meat, utilities, etc.)."""
    active_period = get_active_period(period_id, db)
    now_dt = datetime.now(timezone.utc)

    new_exp = Expense(
        id=f"exp_{uuid.uuid4().hex[:9]}_{int(now_dt.timestamp())}",
        period_id=active_period.id,
        item=expense_in.item,
        quantity=expense_in.quantity,
        unit=expense_in.unit or "",
        total_cost=float(expense_in.totalCost),
        date=expense_in.date,
        category=expense_in.category,
        purchased_by=expense_in.purchasedBy,
        vendor=expense_in.vendor,
        memo_no=expense_in.memoNo,
        note=expense_in.note,
        created_at=now_dt
    )
    db.add(new_exp)

    # Record Outflow transaction
    record_transaction(
        db=db,
        period_id=active_period.id,
        amount=float(expense_in.totalCost),
        flow="outflow",
        txn_type="Expense Payout",
        payment_method="Cash",
        reference_id=new_exp.id,
        recorded_by=expense_in.purchasedBy,
        note=f"{expense_in.item} ({expense_in.quantity} {expense_in.unit or ''}) - {expense_in.category}",
        date=expense_in.date
    )

    user_name = user.name if user else expense_in.purchasedBy
    log_audit(
        db=db,
        action="ADD_EXPENSE",
        details=f"Recorded expense: {expense_in.item} (৳{expense_in.totalCost}) by {expense_in.purchasedBy}",
        period_id=active_period.id,
        user=user_name,
        entity_type="Expense",
        entity_id=new_exp.id
    )

    db.commit()
    db.refresh(new_exp)
    return expense_to_out(new_exp)


@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: str,
    expense_update: ExpenseUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Update expense record and sync transaction ledger."""
    exp = db.query(Expense).filter(Expense.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")

    data = expense_update.model_dump(exclude_unset=True)
    old_cost = exp.total_cost

    if "item" in data: exp.item = data["item"]
    if "quantity" in data: exp.quantity = data["quantity"]
    if "unit" in data: exp.unit = data["unit"]
    if "totalCost" in data: exp.total_cost = data["totalCost"]
    if "date" in data: exp.date = data["date"]
    if "category" in data: exp.category = data["category"]
    if "purchasedBy" in data: exp.purchased_by = data["purchasedBy"]
    if "vendor" in data: exp.vendor = data["vendor"]
    if "memoNo" in data: exp.memo_no = data["memoNo"]
    if "note" in data: exp.note = data["note"]

    # Sync corresponding transaction
    txn = db.query(PaymentTransaction).filter(PaymentTransaction.reference_id == expense_id).first()
    if txn:
        txn.amount = exp.total_cost
        txn.date = exp.date
        txn.note = f"{exp.item} ({exp.quantity} {exp.unit or ''}) - {exp.category}"

    user_name = user.name if user else "Admin"
    log_audit(
        db=db,
        action="EDIT_EXPENSE",
        details=f"Edited expense #{expense_id[-5:]} ({exp.item}, ৳{old_cost} -> ৳{exp.total_cost})",
        period_id=exp.period_id,
        user=user_name,
        entity_type="Expense",
        entity_id=expense_id
    )

    db.commit()
    db.refresh(exp)
    return expense_to_out(exp)


@router.delete("/{expense_id}")
def delete_expense(
    expense_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Delete expense and remove associated transaction from ledger."""
    exp = db.query(Expense).filter(Expense.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")

    item_name = exp.item
    cost = exp.total_cost
    period_id = exp.period_id

    # Remove linked transaction
    db.query(PaymentTransaction).filter(PaymentTransaction.reference_id == expense_id).delete()
    db.delete(exp)

    user_name = user.name if user else "Admin"
    log_audit(
        db=db,
        action="DELETE_EXPENSE",
        details=f"Deleted expense: {item_name} (৳{cost})",
        period_id=period_id,
        user=user_name,
        entity_type="Expense",
        entity_id=expense_id
    )

    db.commit()
    return {"success": True, "message": f"Expense '{item_name}' deleted."}
