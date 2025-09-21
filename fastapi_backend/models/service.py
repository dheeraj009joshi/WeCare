from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal

# Pydantic schemas
class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    price: Decimal = Field(default=Decimal("0.00"), ge=0)
    duration: Optional[int] = None  # in minutes
    is_active: bool = True
    image: Optional[str] = None
    requirements: Optional[List[str]] = None
    specializations: Optional[List[str]] = None
    min_experience: Optional[int] = None
    max_price: Optional[Decimal] = None
    location: Optional[str] = None

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0)
    duration: Optional[int] = None
    is_active: Optional[bool] = None
    image: Optional[str] = None
    requirements: Optional[List[str]] = None
    specializations: Optional[List[str]] = None
    min_experience: Optional[int] = None
    max_price: Optional[Decimal] = None
    location: Optional[str] = None

class ServiceResponse(ServiceBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Beanie Document
class Service(Document, ServiceBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "services"
        indexes = [
            "name",
            "category",
            "is_active",
            "specializations",
            "location",
            "created_at"
        ]

    def __str__(self):
        return f"Service(id={self.id}, name={self.name}, category={self.category})"
