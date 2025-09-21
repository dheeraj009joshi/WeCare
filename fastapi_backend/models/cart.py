from beanie import Document
from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal

# Pydantic schemas
class CartBase(BaseModel):
    user_id: str
    product_id: str
    quantity: int = Field(default=1, ge=1)
    price: Decimal = Field(..., gt=0)

class CartCreate(CartBase):
    pass

class CartUpdate(BaseModel):
    quantity: Optional[int] = Field(None, ge=1)
    price: Optional[Decimal] = Field(None, gt=0)

class CartResponse(CartBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Beanie Document
class Cart(Document, CartBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "carts"
        indexes = [
            "user_id",
            "product_id",
            "created_at"
        ]

    def __str__(self):
        return f"Cart(id={self.id}, user_id={self.user_id}, product_id={self.product_id})"
