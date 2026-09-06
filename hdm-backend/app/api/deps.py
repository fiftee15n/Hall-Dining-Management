from typing import Optional, Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.models.period import ManagementPeriod

security_scheme = HTTPBearer(auto_error=False)


def get_current_user_optional(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Extract authenticated user if JWT token is present, else None."""
    if not auth or not auth.credentials:
        return None

    payload = decode_access_token(auth.credentials)
    if not payload or not payload.get("sub"):
        return None

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    return user


def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Require valid JWT token and return authenticated user."""
    user = get_current_user_optional(auth, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_active_period(
    period_id: Optional[str] = None,
    db: Session = Depends(get_db)
) -> ManagementPeriod:
    """Retrieve requested or currently active management period."""
    if period_id:
        period = db.query(ManagementPeriod).filter(ManagementPeriod.id == period_id).first()
        if period:
            return period

    # Default to active period, or first available period
    active = db.query(ManagementPeriod).filter(ManagementPeriod.status == "active").first()
    if not active:
        active = db.query(ManagementPeriod).first()
    if not active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No management period found. Please create a management period first."
        )
    return active
