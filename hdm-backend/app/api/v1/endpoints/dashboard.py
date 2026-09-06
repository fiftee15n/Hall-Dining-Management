from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.dashboard import DashboardStats
from app.services.stats_service import get_dashboard_stats
from app.api.deps import get_active_period

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
def get_stats(
    period_id: Optional[str] = Query(None, description="Management period ID"),
    date: Optional[str] = Query(None, description="Current date YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    """Retrieve realtime dashboard statistics for active or specified period."""
    active_period = get_active_period(period_id, db)
    return get_dashboard_stats(db=db, period_id=active_period.id, today_str=date)
