from beanie import Document
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class ContactStatus(str, Enum):
    NEW = "new"
    IN_PROGRESS = "in-progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class ContactPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

# Pydantic schemas
class ContactBase(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str
    status: ContactStatus = ContactStatus.NEW
    priority: ContactPriority = ContactPriority.MEDIUM
    source: str = "footer"
    assigned_to: Optional[str] = None
    resolved_at: Optional[datetime] = None
    notes: Optional[str] = None

class ContactCreate(ContactBase):
    pass

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    subject: Optional[str] = None
    message: Optional[str] = None
    status: Optional[ContactStatus] = None
    priority: Optional[ContactPriority] = None
    source: Optional[str] = None
    assigned_to: Optional[str] = None
    resolved_at: Optional[datetime] = None
    notes: Optional[str] = None

class ContactResponse(ContactBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Beanie Document
class Contact(Document, ContactBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "contacts"
        indexes = [
            "email",
            "status",
            "priority",
            "assigned_to",
            "created_at"
        ]

    def __str__(self):
        return f"Contact(id={self.id}, name={self.name}, email={self.email})"
