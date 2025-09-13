from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, time
from bson import ObjectId
from .user import PyObjectId

class AppointmentStatus(str):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    RESCHEDULED = "rescheduled"

class AppointmentBase(BaseModel):
    patient_id: PyObjectId
    doctor_id: PyObjectId
    appointment_date: datetime
    appointment_time: str
    duration: int = 30  # minutes
    type: str = "consultation"  # consultation, checkup, followup
    status: str = AppointmentStatus.PENDING
    notes: Optional[str] = None
    symptoms: Optional[str] = None
    prescription: Optional[str] = None
    consultation_fee: float = Field(ge=0)
    payment_status: str = "pending"  # pending, paid, refunded
    meeting_link: Optional[str] = None
    is_online: bool = False

class AppointmentCreateRequest(BaseModel):
    """Model for appointment booking requests (patient_id auto-set from token)"""
    doctor_id: PyObjectId
    appointment_date: datetime
    appointment_time: str
    duration: int = 30  # minutes
    type: str = "consultation"  # consultation, checkup, followup
    notes: Optional[str] = None
    symptoms: Optional[str] = None
    consultation_fee: float = Field(ge=0)
    is_online: bool = False

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    appointment_date: Optional[datetime] = None
    appointment_time: Optional[str] = None
    duration: Optional[int] = None
    type: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    symptoms: Optional[str] = None
    prescription: Optional[str] = None
    consultation_fee: Optional[float] = None
    payment_status: Optional[str] = None
    meeting_link: Optional[str] = None
    is_online: Optional[bool] = None

class Appointment(AppointmentBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Doctor Availability Model
class DoctorAvailabilityBase(BaseModel):
    doctor_id: PyObjectId
    day_of_week: int = Field(ge=0, le=6)  # 0=Monday, 6=Sunday
    start_time: str
    end_time: str
    is_available: bool = True
    max_appointments: int = Field(ge=1, default=10)

class DoctorAvailabilityCreate(DoctorAvailabilityBase):
    pass

class DoctorAvailability(DoctorAvailabilityBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}