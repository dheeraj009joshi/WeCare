from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
from decimal import Decimal

class AppointmentType(str, Enum):
    VIDEO_CALL = "video_call"
    CHAT = "chat"
    IN_PERSON = "in_person"

class AppointmentStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    REFUNDED = "refunded"

# Pydantic schemas
class AppointmentBase(BaseModel):
    doctor_id: str
    patient_id: str
    appointment_date: datetime
    appointment_time: str
    appointment_type: AppointmentType = AppointmentType.VIDEO_CALL
    status: AppointmentStatus = AppointmentStatus.PENDING
    condition: str
    symptoms: Optional[str] = None
    notes: Optional[str] = None
    prescription: Optional[str] = None
    fee: Decimal
    payment_status: PaymentStatus = PaymentStatus.PENDING
    meeting_link: Optional[str] = None
    meeting_id: Optional[str] = None
    meeting_password: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    appointment_date: Optional[datetime] = None
    appointment_time: Optional[str] = None
    appointment_type: Optional[AppointmentType] = None
    status: Optional[AppointmentStatus] = None
    condition: Optional[str] = None
    symptoms: Optional[str] = None
    notes: Optional[str] = None
    prescription: Optional[str] = None
    fee: Optional[Decimal] = None
    payment_status: Optional[PaymentStatus] = None
    meeting_link: Optional[str] = None
    meeting_id: Optional[str] = None
    meeting_password: Optional[str] = None

class AppointmentResponse(AppointmentBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Beanie Document
class Appointment(Document, AppointmentBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "appointments"
        indexes = [
            "doctor_id",
            "patient_id",
            "appointment_date",
            "status",
            "created_at"
        ]

    def __str__(self):
        return f"Appointment(id={self.id}, doctor_id={self.doctor_id}, patient_id={self.patient_id})"
