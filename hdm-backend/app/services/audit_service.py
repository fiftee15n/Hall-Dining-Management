import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog


def log_audit(
    db: Session,
    action: str,
    details: str,
    period_id: Optional[str] = None,
    user: str = "Admin",
    role: str = "admin",
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None
) -> AuditLog:
    """Create and persist an audit log entry."""
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    log = AuditLog(
        id=f"log_{uuid.uuid4().hex[:9]}_{int(datetime.now().timestamp())}",
        period_id=period_id,
        user=user,
        role=role,
        action=action,
        details=details,
        timestamp=now_str,
        entity_type=entity_type,
        entity_id=entity_id
    )
    db.add(log)
    return log
