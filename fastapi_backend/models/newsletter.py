from beanie import Document
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class NewsletterStatus(str, Enum):
    ACTIVE = "active"
    UNSUBSCRIBED = "unsubscribed"
    PENDING = "pending"

# Pydantic schemas
class NewsletterBase(BaseModel):
    email: EmailStr
    status: NewsletterStatus = NewsletterStatus.ACTIVE
    subscribed_at: datetime = Field(default_factory=datetime.utcnow)
    unsubscribed_at: Optional[datetime] = None
    source: str = "footer"

class NewsletterCreate(NewsletterBase):
    pass

class NewsletterUpdate(BaseModel):
    status: Optional[NewsletterStatus] = None
    unsubscribed_at: Optional[datetime] = None
    source: Optional[str] = None

class NewsletterResponse(NewsletterBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Beanie Document
class Newsletter(Document, NewsletterBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "newsletters"
        indexes = [
            "email",
            "status",
            "source",
            "subscribed_at"
        ]

    def __str__(self):
        return f"Newsletter(id={self.id}, email={self.email}, status={self.status})"
