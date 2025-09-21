from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

# Pydantic schemas
class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal = Field(..., ge=0)
    restaurant_id: str
    category: Optional[str] = None  # e.g., 'main', 'beverage', 'dessert'
    image: Optional[str] = None
    is_vegetarian: bool = True
    is_vegan: bool = False
    is_gluten_free: bool = False
    calories: Optional[int] = None
    ingredients: Optional[List[str]] = None  # Array of ingredients
    allergens: Optional[List[str]] = None  # Array of allergens
    preparation_time: Optional[int] = None  # in minutes
    is_available: bool = True
    is_popular: bool = False

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0)
    restaurant_id: Optional[str] = None
    category: Optional[str] = None
    image: Optional[str] = None
    is_vegetarian: Optional[bool] = None
    is_vegan: Optional[bool] = None
    is_gluten_free: Optional[bool] = None
    calories: Optional[int] = None
    ingredients: Optional[List[str]] = None
    allergens: Optional[List[str]] = None
    preparation_time: Optional[int] = None
    is_available: Optional[bool] = None
    is_popular: Optional[bool] = None

class MenuItemResponse(MenuItemBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Beanie Document
class MenuItem(Document, MenuItemBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "menu_items"
        indexes = [
            "name",
            "restaurant_id",
            "category",
            "is_available",
            "is_popular",
            "created_at"
        ]

    def __str__(self):
        return f"MenuItem(id={self.id}, name={self.name}, restaurant_id={self.restaurant_id})"
