from typing import Optional
from pydantic import BaseModel, ConfigDict


class AuditLogOut(BaseModel):
    id: str
    periodId: Optional[str] = None
    user: str
    role: str = "admin"
    action: str
    details: str
    timestamp: str
    entityType: Optional[str] = None
    entityId: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
