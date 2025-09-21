from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from decimal import Decimal

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"

# Pydantic schemas
class OrderBase(BaseModel):
    order_number: str
    user_id: str
    total_amount: Decimal = Field(..., gt=0)
    status: OrderStatus = OrderStatus.PENDING
    payment_method: str
    payment_status: PaymentStatus = PaymentStatus.PENDING
    delivery_address: Dict[str, Any]
    delivery_phone: str
    delivery_name: str
    estimated_delivery: Optional[datetime] = None
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    delivery_address: Optional[Dict[str, Any]] = None
    delivery_phone: Optional[str] = None
    delivery_name: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    notes: Optional[str] = None

class OrderResponse(OrderBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Order Item schemas
class OrderItemBase(BaseModel):
    order_id: str
    product_id: str
    quantity: int = Field(..., ge=1)
    price: Decimal = Field(..., gt=0)
    total_price: Decimal = Field(..., gt=0)

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemUpdate(BaseModel):
    quantity: Optional[int] = Field(None, ge=1)
    price: Optional[Decimal] = Field(None, gt=0)
    total_price: Optional[Decimal] = Field(None, gt=0)

class OrderItemResponse(OrderItemBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Beanie Documents
class Order(Document, OrderBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "orders"
        indexes = [
            "order_number",
            "user_id",
            "status",
            "payment_status",
            "created_at"
        ]

    def __str__(self):
        return f"Order(id={self.id}, order_number={self.order_number}, user_id={self.user_id})"

class OrderItem(Document, OrderItemBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "order_items"
        indexes = [
            "order_id",
            "product_id",
            "created_at"
        ]

    def __str__(self):
        return f"OrderItem(id={self.id}, order_id={self.order_id}, product_id={self.product_id})"
