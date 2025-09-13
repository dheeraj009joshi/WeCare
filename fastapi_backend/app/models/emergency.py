from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from bson import ObjectId
from .user import PyObjectId

class EmergencyStatus(str):
    PENDING = "pending"
    DISPATCHED = "dispatched"
    EN_ROUTE = "en_route"
    ARRIVED = "arrived"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class AmbulanceBase(BaseModel):
    driver_name: str
    driver_phone: str
    vehicle_number: str
    current_location: Optional[Dict[str, float]] = None  # {"lat": float, "lng": float}
    is_available: bool = True
    equipment_list: Optional[List[str]] = []
    capacity: int = 1

class AmbulanceCreate(AmbulanceBase):
    pass

class AmbulanceUpdate(BaseModel):
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    vehicle_number: Optional[str] = None
    current_location: Optional[Dict[str, float]] = None
    is_available: Optional[bool] = None
    equipment_list: Optional[List[str]] = None
    capacity: Optional[int] = None

class Ambulance(AmbulanceBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Emergency Request Models
class EmergencyRequestBase(BaseModel):
    user_id: PyObjectId
    emergency_type: str  # medical, accident, fire, other
    description: str
    location: Dict[str, float]  # {"lat": float, "lng": float}
    address: str
    contact_phone: str
    severity: str = "medium"  # low, medium, high, critical
    status: str = EmergencyStatus.PENDING
    ambulance_id: Optional[PyObjectId] = None
    estimated_arrival: Optional[datetime] = None

class EmergencyRequestCreate(EmergencyRequestBase):
    pass

class EmergencyRequestUpdate(BaseModel):
    emergency_type: Optional[str] = None
    description: Optional[str] = None
    location: Optional[Dict[str, float]] = None
    address: Optional[str] = None
    contact_phone: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    ambulance_id: Optional[PyObjectId] = None
    estimated_arrival: Optional[datetime] = None

class EmergencyRequest(EmergencyRequestBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    request_number: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Emergency Contact Models
class EmergencyContactBase(BaseModel):
    user_id: PyObjectId
    name: str
    phone: str
    relationship: str
    is_primary: bool = False
    is_active: bool = True

class EmergencyContactCreate(EmergencyContactBase):
    pass

class EmergencyContactUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    relationship: Optional[str] = None
    is_primary: Optional[bool] = None
    is_active: Optional[bool] = None

class EmergencyContact(EmergencyContactBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}