from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class ContentType(str, Enum):
    SOCIAL_MEDIA = "social_media"
    COMPANY_INFO = "company_info"
    QUICK_LINKS = "quick_links"
    CONTACT_INFO = "contact_info"

# Pydantic schemas
class FooterContentBase(BaseModel):
    type: ContentType
    key: str
    value: str
    label: Optional[str] = None
    order: int = 0
    is_active: bool = True
    metadata: Optional[Dict[str, Any]] = None

class FooterContentCreate(FooterContentBase):
    pass

class FooterContentUpdate(BaseModel):
    type: Optional[ContentType] = None
    key: Optional[str] = None
    value: Optional[str] = None
    label: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None

class FooterContentResponse(FooterContentBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Beanie Document
class FooterContent(Document, FooterContentBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "footer_contents"
        indexes = [
            "type",
            "key",
            "is_active",
            "order",
            "created_at"
        ]

    def __str__(self):
        return f"FooterContent(id={self.id}, type={self.type}, key={self.key})"
