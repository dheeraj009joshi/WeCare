from beanie import Document
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class EscalationTrigger(str, Enum):
    AI = "ai"
    USER = "user"

class EscalationStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"

# Pydantic schemas
class EscalationBase(BaseModel):
    reason: str
    triggered_by: EscalationTrigger
    status: EscalationStatus = EscalationStatus.OPEN
    user_id: str
    session_id: str

class EscalationCreate(EscalationBase):
    pass

class EscalationUpdate(BaseModel):
    reason: Optional[str] = None
    status: Optional[EscalationStatus] = None

class EscalationResponse(EscalationBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Beanie Document
class Escalation(Document, EscalationBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "escalations"
        indexes = [
            "user_id",
            "session_id",
            "status",
            "triggered_by",
            "created_at"
        ]

    def __str__(self):
        return f"Escalation(id={self.id}, user_id={self.user_id}, status={self.status})"
