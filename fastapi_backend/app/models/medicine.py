from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from .user import PyObjectId

class MedicineBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(ge=0)
    category: str
    brand: Optional[str] = None
    manufacturer: Optional[str] = None
    composition: Optional[str] = None
    dosage_form: Optional[str] = None  # tablet, capsule, syrup, etc.
    strength: Optional[str] = None
    package_size: Optional[str] = None
    prescription_required: bool = False
    in_stock: bool = True
    stock_quantity: int = Field(ge=0, default=0)
    image_url: Optional[str] = None
    side_effects: Optional[List[str]] = []
    contraindications: Optional[List[str]] = []
    storage_conditions: Optional[str] = None
    expiry_date: Optional[datetime] = None
    is_active: bool = True

class MedicineCreate(MedicineBase):
    pass

class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    manufacturer: Optional[str] = None
    composition: Optional[str] = None
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    package_size: Optional[str] = None
    prescription_required: Optional[bool] = None
    in_stock: Optional[bool] = None
    stock_quantity: Optional[int] = None
    image_url: Optional[str] = None
    side_effects: Optional[List[str]] = None
    contraindications: Optional[List[str]] = None
    storage_conditions: Optional[str] = None
    expiry_date: Optional[datetime] = None
    is_active: Optional[bool] = None

class MedicineInDB(MedicineBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Medicine(MedicineBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Cart Models
class CartItemBase(BaseModel):
    medicine_id: PyObjectId
    quantity: int = Field(ge=1)

class CartItem(CartItemBase):
    medicine: Medicine
    total_price: float

class CartBase(BaseModel):
    user_id: PyObjectId
    items: List[CartItemBase] = []
    total_amount: float = 0.0

class Cart(CartBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}