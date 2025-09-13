from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from .user import PyObjectId

class OrderStatus(str):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class PaymentStatus(str):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"

# Medicine Store Cart Models
class CartBase(BaseModel):
    user_id: PyObjectId
    product_id: PyObjectId
    quantity: int = Field(ge=1)
    price_per_unit: float = Field(ge=0)
    total_price: float = Field(ge=0)

class CartCreate(CartBase):
    pass

class CartUpdate(BaseModel):
    quantity: Optional[int] = None
    price_per_unit: Optional[float] = None

class Cart(CartBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Medicine Store Order Models
class OrderBase(BaseModel):
    user_id: PyObjectId
    order_number: str
    total_amount: float = Field(ge=0)
    discount_amount: float = Field(ge=0, default=0)
    tax_amount: float = Field(ge=0, default=0)
    shipping_amount: float = Field(ge=0, default=0)
    final_amount: float = Field(ge=0)
    status: str = OrderStatus.PENDING
    payment_status: str = PaymentStatus.PENDING
    payment_method: str = "cod"  # cod, card, upi, wallet
    shipping_address: Dict[str, str]
    billing_address: Optional[Dict[str, str]] = None
    tracking_number: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    tracking_number: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    notes: Optional[str] = None

class Order(OrderBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    delivered_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Order Item Models
class OrderItemBase(BaseModel):
    order_id: PyObjectId
    product_id: PyObjectId
    quantity: int = Field(ge=1)
    price_per_unit: float = Field(ge=0)
    total_price: float = Field(ge=0)
    product_name: str
    product_details: Optional[Dict[str, Any]] = None

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Food Order Item Models (separate from regular order items)
class FoodOrderItemBase(BaseModel):
    order_id: PyObjectId
    menu_item_id: PyObjectId
    restaurant_id: PyObjectId
    quantity: int = Field(ge=1)
    price_per_unit: float = Field(ge=0)
    total_price: float = Field(ge=0)
    item_name: str
    special_instructions: Optional[str] = None
    customizations: Optional[Dict[str, Any]] = None

class FoodOrderItemCreate(FoodOrderItemBase):
    pass

class FoodOrderItem(FoodOrderItemBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Payment Models
class PaymentBase(BaseModel):
    order_id: PyObjectId
    user_id: PyObjectId
    amount: float = Field(ge=0)
    payment_method: str
    payment_gateway: Optional[str] = None
    transaction_id: Optional[str] = None
    gateway_response: Optional[Dict[str, Any]] = None
    status: str = PaymentStatus.PENDING
    failure_reason: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    status: Optional[str] = None
    transaction_id: Optional[str] = None
    gateway_response: Optional[Dict[str, Any]] = None
    failure_reason: Optional[str] = None

class Payment(PaymentBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}