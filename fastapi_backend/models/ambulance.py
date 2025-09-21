from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
from decimal import Decimal

class AmbulanceType(str, Enum):
    BASIC = "basic"
    ADVANCED = "advanced"
    CARDIAC = "cardiac"
    NEONATAL = "neonatal"
    AIR = "air"

class AmbulanceStatus(str, Enum):
    AVAILABLE = "available"
    ASSIGNED = "assigned"
    BUSY = "busy"
    MAINTENANCE = "maintenance"

# Pydantic schemas
class AmbulanceBase(BaseModel):
    provider_name: str
    phone: str
    email: Optional[str] = None
    address: str
    city: str
    state: str
    zip_code: str
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    vehicle_number: str
    capacity: int = Field(default=1, ge=1)
    ambulance_type: AmbulanceType = AmbulanceType.BASIC
    status: AmbulanceStatus = AmbulanceStatus.AVAILABLE
    is_available: bool = True
    response_time: Optional[int] = None  # in minutes
    rating: Optional[Decimal] = Field(None, ge=0, le=5)
    is_verified: bool = False
    contact_person: Optional[str] = None
    emergency_number: str

class AmbulanceCreate(AmbulanceBase):
    pass

class AmbulanceUpdate(BaseModel):
    provider_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    vehicle_number: Optional[str] = None
    capacity: Optional[int] = Field(None, ge=1)
    ambulance_type: Optional[AmbulanceType] = None
    status: Optional[AmbulanceStatus] = None
    is_available: Optional[bool] = None
    response_time: Optional[int] = None
    rating: Optional[Decimal] = Field(None, ge=0, le=5)
    is_verified: Optional[bool] = None
    contact_person: Optional[str] = None
    emergency_number: Optional[str] = None

class AmbulanceResponse(AmbulanceBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Beanie Document
class Ambulance(Document, AmbulanceBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "ambulances"
        indexes = [
            "city",
            "state",
            "is_available",
            "status",
            "ambulance_type",
            "is_verified",
            "created_at"
        ]

    def __str__(self):
        return f"Ambulance(id={self.id}, provider_name={self.provider_name}, city={self.city})"
