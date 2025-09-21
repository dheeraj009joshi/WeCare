from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Pydantic schemas
class DoctorAvailabilityBase(BaseModel):
    doctor_id: str
    day_of_week: int = Field(..., ge=0, le=6)  # 0 = Sunday, 1 = Monday, etc.
    start_time: str  # Format: "09:00"
    end_time: str  # Format: "17:00"
    is_available: bool = True
    max_appointments: int = Field(default=10, ge=1)
    appointment_duration: int = Field(default=30, ge=1)  # in minutes
    break_start: Optional[str] = None  # Format: "12:00"
    break_end: Optional[str] = None  # Format: "13:00"

class DoctorAvailabilityCreate(DoctorAvailabilityBase):
    pass

class DoctorAvailabilityUpdate(BaseModel):
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    is_available: Optional[bool] = None
    max_appointments: Optional[int] = Field(None, ge=1)
    appointment_duration: Optional[int] = Field(None, ge=1)
    break_start: Optional[str] = None
    break_end: Optional[str] = None

class DoctorAvailabilityResponse(DoctorAvailabilityBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Beanie Document
class DoctorAvailability(Document, DoctorAvailabilityBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "doctor_availabilities"
        indexes = [
            "doctor_id",
            "day_of_week",
            "is_available",
            "created_at"
        ]

    def __str__(self):
        return f"DoctorAvailability(id={self.id}, doctor_id={self.doctor_id}, day={self.day_of_week})"
