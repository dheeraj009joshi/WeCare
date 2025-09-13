from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from .user import PyObjectId

# Address Models
class AddressBase(BaseModel):
    user_id: PyObjectId
    type: str = "home"  # home, work, billing, shipping
    street: str
    city: str
    state: str
    postal_code: str
    country: str = "India"
    is_default: bool = False

class AddressCreate(AddressBase):
    pass

class AddressUpdate(BaseModel):
    type: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    is_default: Optional[bool] = None

class Address(AddressBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Newsletter Models
class NewsletterBase(BaseModel):
    email: EmailStr
    is_subscribed: bool = True
    preferences: Optional[List[str]] = []  # health_tips, offers, updates
    source: Optional[str] = "website"

class NewsletterCreate(NewsletterBase):
    pass

class Newsletter(NewsletterBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Contact Models
class ContactBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str
    department: str = "general"  # general, support, medical, billing
    priority: str = "normal"
    status: str = "pending"  # pending, in_progress, resolved, closed
    assigned_to: Optional[PyObjectId] = None

class ContactCreate(ContactBase):
    pass

class ContactUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[PyObjectId] = None
    priority: Optional[str] = None

class Contact(ContactBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Footer Content Models
class FooterContentBase(BaseModel):
    section: str  # about, services, links, contact
    title: str
    content: Optional[str] = None
    links: Optional[List[Dict[str, str]]] = []
    order: int = 0
    is_active: bool = True

class FooterContentCreate(FooterContentBase):
    pass

class FooterContentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    links: Optional[List[Dict[str, str]]] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None

class FooterContent(FooterContentBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Service Models
class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    price: Optional[float] = None
    duration: Optional[int] = None  # in minutes
    image_url: Optional[str] = None
    features: Optional[List[str]] = []
    is_active: bool = True
    is_featured: bool = False

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    duration: Optional[int] = None
    image_url: Optional[str] = None
    features: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None

class Service(ServiceBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Product Models (for medicine store products)
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(ge=0)
    category: str
    brand: Optional[str] = None
    sku: Optional[str] = None
    stock_quantity: int = Field(ge=0, default=0)
    min_stock_level: int = Field(ge=0, default=5)
    image_url: Optional[str] = None
    images: Optional[List[str]] = []
    specifications: Optional[Dict[str, Any]] = None
    is_prescription_required: bool = False
    is_active: bool = True
    is_featured: bool = False
    weight: Optional[float] = None
    dimensions: Optional[Dict[str, float]] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    sku: Optional[str] = None
    stock_quantity: Optional[int] = None
    min_stock_level: Optional[int] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    specifications: Optional[Dict[str, Any]] = None
    is_prescription_required: Optional[bool] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    weight: Optional[float] = None
    dimensions: Optional[Dict[str, float]] = None

class Product(ProductBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}