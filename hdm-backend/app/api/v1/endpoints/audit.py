from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogOut

router = APIRouter()


def log_to_out(l: AuditLog) -> AuditLogOut:
    return AuditLogOut(
        id=l.id,
        periodId=l.period_id,
        user=l.user,
        role=l.role,
        action=l.action,
        details=l.details,
        timestamp=l.timestamp,
        entityType=l.entity_type,
        entityId=l.entity_id
    )


@router.get("", response_model=List[AuditLogOut])
def get_audit_logs(
    period_id: Optional[str] = Query(None, description="Filter by period ID"),
    user: Optional[str] = Query(None, description="Filter by username"),
    action: Optional[str] = Query(None, description="Filter by action name"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """List system audit logs."""
    query = db.query(AuditLog)
    if period_id:
        query = query.filter(AuditLog.period_id == period_id)
    if user:
        query = query.filter(AuditLog.user.ilike(f"%{user}%"))
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))

    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [log_to_out(l) for l in logs]
