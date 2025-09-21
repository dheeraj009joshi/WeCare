from beanie import Document
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime, date
from enum import Enum
from decimal import Decimal

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

# Pydantic schemas
class DoctorBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    specializations: List[str] = []
    qualifications: str
    experience: int = Field(..., ge=0)
    bio: Optional[str] = None
    gender: Gender
    date_of_birth: date
    address: str
    city: str
    state: str
    country: str
    pincode: str
    profile_image: Optional[str] = None
    license_number: str
    hospital: Optional[str] = None
    consultation_fee: Optional[Decimal] = Field(default=Decimal("0.00"), ge=0)
    is_available: bool = True
    rating: Decimal = Field(default=Decimal("0.00"), ge=0, le=5)
    total_ratings: int = 0

class DoctorCreate(DoctorBase):
    password: str

class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    specializations: Optional[List[str]] = None
    qualifications: Optional[str] = None
    experience: Optional[int] = Field(None, ge=0)
    bio: Optional[str] = None
    gender: Optional[Gender] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None
    profile_image: Optional[str] = None
    license_number: Optional[str] = None
    hospital: Optional[str] = None
    consultation_fee: Optional[Decimal] = Field(None, ge=0)
    is_available: Optional[bool] = None
    rating: Optional[Decimal] = Field(None, ge=0, le=5)
    total_ratings: Optional[int] = None

class DoctorResponse(DoctorBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DoctorLogin(BaseModel):
    email: EmailStr
    password: str

# Beanie Document
class Doctor(Document):
    name: str
    email: EmailStr
    password: str
    phone: str
    specializations: List[str] = []
    qualifications: str
    experience: int = Field(..., ge=0)
    bio: Optional[str] = None
    gender: str
    date_of_birth: str  # Store as string for now
    address: str
    city: str
    state: str
    country: str
    pincode: str
    profile_image: Optional[str] = None
    license_number: str
    hospital: Optional[str] = None
    consultation_fee: float = Field(default=0.0, ge=0)
    is_available: bool = True
    rating: float = Field(default=0.0, ge=0, le=5)
    total_ratings: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "doctors"
        indexes = [
            "email",
            "license_number",
            "specializations",
            "city",
            "state",
            "is_available",
            "rating"
        ]

    def __str__(self):
        return f"Doctor(id={self.id}, email={self.email}, name={self.name})"
