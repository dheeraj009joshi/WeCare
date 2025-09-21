from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from decimal import Decimal

# Pydantic schemas
class ProductBase(BaseModel):
    name: str
    price: Decimal = Field(..., gt=0)
    stock: int = Field(default=0, ge=0)
    category: str
    prescription: bool = False
    image: Optional[str] = None
    dosha: Optional[str] = None
    benefits: Optional[str] = None
    description: Optional[str] = None
    manufacturer: Optional[str] = None
    expiry_date: Optional[date] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    category: Optional[str] = None
    prescription: Optional[bool] = None
    image: Optional[str] = None
    dosha: Optional[str] = None
    benefits: Optional[str] = None
    description: Optional[str] = None
    manufacturer: Optional[str] = None
    expiry_date: Optional[date] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Beanie Document
class Product(Document, ProductBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "products"
        indexes = [
            "name",
            "category",
            "is_active",
            "prescription",
            "created_at"
        ]

    def __str__(self):
        return f"Product(id={self.id}, name={self.name}, price={self.price})"
