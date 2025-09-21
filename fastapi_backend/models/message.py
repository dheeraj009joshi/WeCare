from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class SenderType(str, Enum):
    USER = "user"
    AI = "ai"

# Pydantic schemas
class MessageBase(BaseModel):
    sender: SenderType
    text: str
    session_id: str

class MessageCreate(MessageBase):
    pass

class MessageUpdate(BaseModel):
    text: Optional[str] = None

class MessageResponse(MessageBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Chat Session schemas
class ChatSessionBase(BaseModel):
    title: str = "Chat"
    user_id: str

class ChatSessionCreate(ChatSessionBase):
    pass

class ChatSessionUpdate(BaseModel):
    title: Optional[str] = None

class ChatSessionResponse(ChatSessionBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Beanie Documents
class Message(Document, MessageBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "messages"
        indexes = [
            "session_id",
            "sender",
            "created_at"
        ]

    def __str__(self):
        return f"Message(id={self.id}, sender={self.sender}, session_id={self.session_id})"

class ChatSession(Document, ChatSessionBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "chat_sessions"
        indexes = [
            "user_id",
            "created_at"
        ]

    def __str__(self):
        return f"ChatSession(id={self.id}, user_id={self.user_id}, title={self.title})"
