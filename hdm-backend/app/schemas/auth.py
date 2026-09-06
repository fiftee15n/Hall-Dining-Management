from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, ConfigDict


UserRoleType = Literal["Admin", "Authority", "Management Team"]


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: UserRoleType
    title: Optional[str] = None
    department: Optional[str] = None
    avatarLetter: Optional[str] = None
    periodId: Optional[str] = None  # Scoped period ID for Management Team accounts

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    period_id: Optional[str] = None
