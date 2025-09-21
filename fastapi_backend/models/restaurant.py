from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, time
from decimal import Decimal

# Pydantic schemas
class RestaurantBase(BaseModel):
    name: str
    category: str  # e.g., 'khichdi', 'fruits', 'juice'
    cuisine: str
    rating: Decimal = Field(default=Decimal("4.0"), ge=0, le=5)
    delivery_time: str  # e.g., "20 mins"
    price_range: str  # e.g., "₹120-₹200"
    image: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool = True
    is_open: bool = True
    opening_time: time = Field(default=time(9, 0, 0))
    closing_time: time = Field(default=time(22, 0, 0))

class RestaurantCreate(RestaurantBase):
    pass

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    cuisine: Optional[str] = None
    rating: Optional[Decimal] = Field(None, ge=0, le=5)
    delivery_time: Optional[str] = None
    price_range: Optional[str] = None
    image: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    is_open: Optional[bool] = None
    opening_time: Optional[time] = None
    closing_time: Optional[time] = None

class RestaurantResponse(RestaurantBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Beanie Document
class Restaurant(Document, RestaurantBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "restaurants"
        indexes = [
            "name",
            "category",
            "cuisine",
            "is_active",
            "is_open",
            "rating",
            "created_at"
        ]

    def __str__(self):
        return f"Restaurant(id={self.id}, name={self.name}, category={self.category})"
