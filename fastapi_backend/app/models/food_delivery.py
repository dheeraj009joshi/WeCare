from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, time
from bson import ObjectId
from .user import PyObjectId

class RestaurantBase(BaseModel):
    name: str
    description: Optional[str] = None
    cuisine_type: List[str] = []
    rating: float = Field(ge=0, le=5, default=0.0)
    delivery_time: str = "30-45 mins"
    price_range: str = "$$"
    image_url: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    is_open: bool = True
    is_active: bool = True
    opening_hours: Optional[Dict[str, str]] = None  # {"monday": "9:00-22:00", ...}

class RestaurantCreate(RestaurantBase):
    pass

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cuisine_type: Optional[List[str]] = None
    rating: Optional[float] = None
    delivery_time: Optional[str] = None
    price_range: Optional[str] = None
    image_url: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    is_open: Optional[bool] = None
    is_active: Optional[bool] = None
    opening_hours: Optional[Dict[str, str]] = None

class Restaurant(RestaurantBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Food Category Models
class FoodCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True

class FoodCategory(FoodCategoryBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Menu Item Models
class MenuItemBase(BaseModel):
    restaurant_id: PyObjectId
    name: str
    description: Optional[str] = None
    price: float = Field(ge=0)
    category: str
    image_url: Optional[str] = None
    ingredients: List[str] = []
    is_vegetarian: bool = False
    is_vegan: bool = False
    is_gluten_free: bool = False
    is_spicy: bool = False
    calories: Optional[int] = None
    prep_time: Optional[str] = None
    is_available: bool = True

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    ingredients: Optional[List[str]] = None
    is_vegetarian: Optional[bool] = None
    is_vegan: Optional[bool] = None
    is_gluten_free: Optional[bool] = None
    is_spicy: Optional[bool] = None
    calories: Optional[int] = None
    prep_time: Optional[str] = None
    is_available: Optional[bool] = None

class MenuItem(MenuItemBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Food Cart Models
class FoodCartItemBase(BaseModel):
    menu_item_id: PyObjectId
    quantity: int = Field(ge=1)
    special_instructions: Optional[str] = None

class FoodCartItem(FoodCartItemBase):
    menu_item: MenuItem
    total_price: float

class FoodCartBase(BaseModel):
    user_id: PyObjectId
    restaurant_id: PyObjectId
    items: List[FoodCartItemBase] = []
    total_amount: float = 0.0
    delivery_address: Optional[str] = None

class FoodCart(FoodCartBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Food Order Models
class FoodOrderStatus(str):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class FoodOrderBase(BaseModel):
    user_id: PyObjectId
    restaurant_id: PyObjectId
    items: List[FoodCartItemBase]
    total_amount: float
    delivery_address: str
    phone: str
    payment_method: str = "cash_on_delivery"
    status: str = FoodOrderStatus.PENDING
    estimated_delivery_time: Optional[datetime] = None
    special_instructions: Optional[str] = None

class FoodOrderCreate(FoodOrderBase):
    pass

class FoodOrder(FoodOrderBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    order_number: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}