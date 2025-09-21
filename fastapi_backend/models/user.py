from beanie import Document
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class Role(str, Enum):
    USER = "user"
    DOCTOR = "doctor"
    ADMIN = "admin"

# Pydantic schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    gender: Optional[Gender] = None
    age: Optional[int] = None
    weight: Optional[str] = None
    height: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    lifestyle: Optional[str] = None
    profile_picture: Optional[str] = None
    role: Role = Role.USER

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    gender: Optional[Gender] = None
    age: Optional[int] = None
    weight: Optional[str] = None
    height: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    lifestyle: Optional[str] = None
    profile_picture: Optional[str] = None

class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Beanie Document
class User(Document, UserBase):
    password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
        indexes = [
            "email",
            "role",
            "created_at"
        ]

    def __str__(self):
        return f"User(id={self.id}, email={self.email}, name={self.name})"
