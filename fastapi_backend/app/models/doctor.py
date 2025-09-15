from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from .user import PyObjectId

class DoctorBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: int = Field(default=0, ge=0)
    license_number: Optional[str] = None
    clinic_address: Optional[str] = None
    consultation_fee: float = Field(default=0.0, ge=0)
    qualification: Optional[List[str]] = []
    bio: Optional[str] = None
    availability: Optional[dict] = {}
    google_id: Optional[str] = None
    profile_picture: Optional[str] = None
    is_google_user: Optional[bool] = False
    is_verified: bool = True
    is_active: bool = True

class DoctorCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    specialization: str
    experience_years: int = Field(default=0, ge=0)
    license_number: str
    clinic_address: Optional[str] = None
    consultation_fee: float = Field(default=0.0, ge=0)
    qualification: Optional[List[str]] = []
    bio: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class DoctorUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    license_number: Optional[str] = None
    clinic_address: Optional[str] = None
    consultation_fee: Optional[float] = None
    qualification: Optional[List[str]] = None
    bio: Optional[str] = None
    availability: Optional[dict] = None
    profile_picture: Optional[str] = None
    is_verified: Optional[bool] = None
    is_active: Optional[bool] = None

class DoctorInDB(DoctorBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Doctor(DoctorBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}