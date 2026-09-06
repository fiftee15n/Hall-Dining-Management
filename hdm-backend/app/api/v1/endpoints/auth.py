from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import UserLogin, Token, UserOut
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user with email and password, return JWT token and user info with period scoping."""
    clean_email = login_data.email.strip().lower()
    user = db.query(User).filter(User.email.ilike(clean_email)).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password. Please check your credentials."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive."
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )

    user_out = UserOut(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        title=user.title,
        department=user.department,
        avatarLetter=user.avatar_letter or user.name[:1].upper(),
        periodId=user.period_id
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_out
    )


@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get the profile of currently logged-in user with assigned period scope."""
    return UserOut(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        title=current_user.title,
        department=current_user.department,
        avatarLetter=current_user.avatar_letter or current_user.name[:1].upper(),
        periodId=current_user.period_id
    )
