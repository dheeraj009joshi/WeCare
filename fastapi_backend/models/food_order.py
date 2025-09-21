from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum
from decimal import Decimal

class FoodOrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class PaymentMethod(str, Enum):
    CARD = "card"
    UPI = "upi"
    COD = "cod"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"

# Pydantic schemas
class FoodOrderBase(BaseModel):
    order_number: str
    user_id: str
    status: FoodOrderStatus = FoodOrderStatus.PENDING
    subtotal: Decimal = Field(..., gt=0)
    delivery_fee: Decimal = Field(default=Decimal("30.00"), ge=0)
    taxes: Decimal = Field(..., gt=0)
    total: Decimal = Field(..., gt=0)
    payment_method: PaymentMethod
    payment_status: PaymentStatus = PaymentStatus.PENDING
    delivery_address: Dict[str, Any]  # Structure: { fullName, phone, address, city, pincode }
    estimated_delivery_time: Optional[datetime] = None
    actual_delivery_time: Optional[datetime] = None
    delivery_instructions: Optional[str] = None
    cancellation_reason: Optional[str] = None
    refund_amount: Optional[Decimal] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    feedback: Optional[str] = None

class FoodOrderCreate(FoodOrderBase):
    pass

class FoodOrderUpdate(BaseModel):
    status: Optional[FoodOrderStatus] = None
    subtotal: Optional[Decimal] = Field(None, gt=0)
    delivery_fee: Optional[Decimal] = Field(None, ge=0)
    taxes: Optional[Decimal] = Field(None, gt=0)
    total: Optional[Decimal] = Field(None, gt=0)
    payment_method: Optional[PaymentMethod] = None
    payment_status: Optional[PaymentStatus] = None
    delivery_address: Optional[Dict[str, Any]] = None
    estimated_delivery_time: Optional[datetime] = None
    actual_delivery_time: Optional[datetime] = None
    delivery_instructions: Optional[str] = None
    cancellation_reason: Optional[str] = None
    refund_amount: Optional[Decimal] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    feedback: Optional[str] = None

class FoodOrderResponse(FoodOrderBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Food Order Item schemas
class FoodOrderItemBase(BaseModel):
    order_id: str
    menu_item_id: str
    restaurant_id: str
    quantity: int = Field(..., ge=1)
    unit_price: Decimal = Field(..., gt=0)
    total_price: Decimal = Field(..., gt=0)
    special_instructions: Optional[str] = None
    item_snapshot: Dict[str, Any]  # Structure: { name, description, price, restaurant details }

class FoodOrderItemCreate(FoodOrderItemBase):
    pass

class FoodOrderItemUpdate(BaseModel):
    quantity: Optional[int] = Field(None, ge=1)
    unit_price: Optional[Decimal] = Field(None, gt=0)
    total_price: Optional[Decimal] = Field(None, gt=0)
    special_instructions: Optional[str] = None
    item_snapshot: Optional[Dict[str, Any]] = None

class FoodOrderItemResponse(FoodOrderItemBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Beanie Documents
class FoodOrder(Document, FoodOrderBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "food_orders"
        indexes = [
            "order_number",
            "user_id",
            "status",
            "payment_status",
            "created_at"
        ]

    def __str__(self):
        return f"FoodOrder(id={self.id}, order_number={self.order_number}, user_id={self.user_id})"

class FoodOrderItem(Document, FoodOrderItemBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "food_order_items"
        indexes = [
            "order_id",
            "menu_item_id",
            "restaurant_id",
            "created_at"
        ]

    def __str__(self):
        return f"FoodOrderItem(id={self.id}, order_id={self.order_id}, menu_item_id={self.menu_item_id})"
