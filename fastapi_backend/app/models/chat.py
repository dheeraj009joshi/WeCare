from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from .user import PyObjectId

class ChatSessionStatus(str):
    ACTIVE = "active"
    CLOSED = "closed"
    ESCALATED = "escalated"
    WAITING = "waiting"

class ChatSessionBase(BaseModel):
    user_id: PyObjectId
    session_type: str = "general"  # general, medical, emergency, food_delivery
    status: str = ChatSessionStatus.ACTIVE
    title: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    is_anonymous: bool = False
    priority: str = "normal"  # low, normal, high, urgent

class ChatSessionCreate(ChatSessionBase):
    pass

class ChatSession(ChatSessionBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Message Models
class MessageBase(BaseModel):
    session_id: PyObjectId
    sender_type: str  # user, ai, doctor, system
    sender_id: Optional[PyObjectId] = None
    content: str
    message_type: str = "text"  # text, image, file, system
    metadata: Optional[Dict[str, Any]] = None
    is_read: bool = False

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Doctor Message Models (for doctor-patient communication)
class DoctorMessageBase(BaseModel):
    doctor_id: PyObjectId
    patient_id: PyObjectId
    appointment_id: Optional[PyObjectId] = None
    subject: Optional[str] = None
    content: str
    message_type: str = "text"  # text, prescription, report
    is_read: bool = False
    priority: str = "normal"

class DoctorMessageCreate(DoctorMessageBase):
    pass

class DoctorMessage(DoctorMessageBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Escalation Models
class EscalationBase(BaseModel):
    session_id: PyObjectId
    user_id: PyObjectId
    escalation_type: str  # technical, medical, emergency, complaint
    reason: str
    description: Optional[str] = None
    status: str = "pending"  # pending, in_progress, resolved, closed
    assigned_to: Optional[PyObjectId] = None
    priority: str = "normal"

class EscalationCreate(EscalationBase):
    pass

class Escalation(EscalationBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# File Upload Models
class FileUploadBase(BaseModel):
    user_id: PyObjectId
    session_id: Optional[PyObjectId] = None
    appointment_id: Optional[PyObjectId] = None
    file_name: str
    file_url: str
    file_type: str
    file_size: int
    upload_purpose: str  # profile_picture, prescription, report, chat_attachment
    is_processed: bool = False

class FileUploadCreate(FileUploadBase):
    pass

class FileUpload(FileUploadBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}