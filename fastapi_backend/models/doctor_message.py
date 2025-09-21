from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class MessageSender(str, Enum):
    DOCTOR = "doctor"
    PATIENT = "patient"

class MessageType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    FILE = "file"
    PRESCRIPTION = "prescription"

# Pydantic schemas
class DoctorMessageBase(BaseModel):
    doctor_id: str
    patient_id: str
    sender: MessageSender
    message: str
    message_type: MessageType = MessageType.TEXT
    is_read: bool = False
    appointment_id: Optional[str] = None

class DoctorMessageCreate(DoctorMessageBase):
    pass

class DoctorMessageUpdate(BaseModel):
    message: Optional[str] = None
    message_type: Optional[MessageType] = None
    is_read: Optional[bool] = None
    appointment_id: Optional[str] = None

class DoctorMessageResponse(DoctorMessageBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Beanie Document
class DoctorMessage(Document, DoctorMessageBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "doctor_messages"
        indexes = [
            "doctor_id",
            "patient_id",
            "appointment_id",
            "is_read",
            "created_at"
        ]

    def __str__(self):
        return f"DoctorMessage(id={self.id}, doctor_id={self.doctor_id}, patient_id={self.patient_id})"
