from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Pydantic schemas
class FoodCategoryBase(BaseModel):
    name: str
    identifier: str  # e.g., 'khichdi', 'fruits', 'juice'
    image: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True

class FoodCategoryCreate(FoodCategoryBase):
    pass

class FoodCategoryUpdate(BaseModel):
    name: Optional[str] = None
    identifier: Optional[str] = None
    image: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class FoodCategoryResponse(FoodCategoryBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Beanie Document
class FoodCategory(Document, FoodCategoryBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "food_categories"
        indexes = [
            "name",
            "identifier",
            "is_active",
            "created_at"
        ]

    def __str__(self):
        return f"FoodCategory(id={self.id}, name={self.name}, identifier={self.identifier})"
