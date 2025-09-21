from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Pydantic schemas
class FoodCartBase(BaseModel):
    user_id: str
    menu_item_id: str
    restaurant_id: str
    quantity: int = Field(default=1, ge=1)
    special_instructions: Optional[str] = None
    session_id: Optional[str] = None  # For guest users

class FoodCartCreate(FoodCartBase):
    pass

class FoodCartUpdate(BaseModel):
    quantity: Optional[int] = Field(None, ge=1)
    special_instructions: Optional[str] = None

class FoodCartResponse(FoodCartBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Beanie Document
class FoodCart(Document, FoodCartBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "food_cart"
        indexes = [
            "user_id",
            "menu_item_id",
            "restaurant_id",
            "session_id",
            "created_at"
        ]

    def __str__(self):
        return f"FoodCart(id={self.id}, user_id={self.user_id}, menu_item_id={self.menu_item_id})"
