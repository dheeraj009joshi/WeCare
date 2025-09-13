from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional, Dict, Any
from bson import ObjectId
from datetime import datetime
import json
from ..core.database import get_database
from ..models.chat import (
    ChatSession, ChatSessionCreate, ChatSessionStatus,
    Message, MessageCreate,
    Escalation, EscalationCreate,
    FileUpload, FileUploadCreate
)
from ..models.user import UserInDB
from ..utils.auth import get_current_active_user
from ..services.ai_service import ai_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
    
    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
    
    async def send_message(self, message: str, session_id: str):
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_text(message)

manager = ConnectionManager()

@router.get("/sessions", response_model=List[ChatSession])
async def get_chat_sessions(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    session_type: Optional[str] = None,
    status: Optional[str] = None
):
    """Get user's chat sessions"""
    query = {"user_id": current_user.id}
    
    if session_type:
        query["session_type"] = session_type
    
    if status:
        query["status"] = status
    
    cursor = db.chat_sessions.find(query).sort("last_activity", -1)
    sessions = []
    async for session in cursor:
        sessions.append(ChatSession(**session))
    
    return sessions

@router.post("/sessions", response_model=ChatSession)
async def create_chat_session(
    session_data: ChatSessionCreate,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new chat session"""
    session_dict = session_data.dict()
    session_dict["user_id"] = current_user.id
    
    result = await db.chat_sessions.insert_one(session_dict)
    created_session = await db.chat_sessions.find_one({"_id": result.inserted_id})
    
    return ChatSession(**created_session)

@router.get("/sessions/{session_id}", response_model=ChatSession)
async def get_chat_session(
    session_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific chat session"""
    if not ObjectId.is_valid(session_id):
        raise HTTPException(status_code=400, detail="Invalid session ID")
    
    session = await db.chat_sessions.find_one({
        "_id": ObjectId(session_id),
        "user_id": current_user.id
    })
    
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    return ChatSession(**session)

@router.get("/sessions/{session_id}/messages", response_model=List[Message])
async def get_session_messages(
    session_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    skip: int = 0,
    limit: int = 100
):
    """Get messages from a chat session"""
    if not ObjectId.is_valid(session_id):
        raise HTTPException(status_code=400, detail="Invalid session ID")
    
    # Verify user owns the session
    session = await db.chat_sessions.find_one({
        "_id": ObjectId(session_id),
        "user_id": current_user.id
    })
    
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    cursor = db.messages.find({
        "session_id": ObjectId(session_id)
    }).sort("created_at", 1).skip(skip).limit(limit)
    
    messages = []
    async for message in cursor:
        messages.append(Message(**message))
    
    return messages

@router.post("/sessions/{session_id}/messages", response_model=Message)
async def send_message(
    session_id: str,
    message_data: MessageCreate,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Send a message in a chat session"""
    if not ObjectId.is_valid(session_id):
        raise HTTPException(status_code=400, detail="Invalid session ID")
    
    # Verify session exists and user owns it
    session = await db.chat_sessions.find_one({
        "_id": ObjectId(session_id),
        "user_id": current_user.id
    })
    
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    # Create user message
    message_dict = message_data.dict()
    message_dict["session_id"] = ObjectId(session_id)
    message_dict["sender_id"] = current_user.id
    message_dict["sender_type"] = "user"
    
    result = await db.messages.insert_one(message_dict)
    user_message = await db.messages.find_one({"_id": result.inserted_id})
    
    # Update session last activity
    await db.chat_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"last_activity": datetime.utcnow()}}
    )
    
    # Generate AI response if it's a general chat
    if session.get("session_type") == "general" or session.get("session_type") == "medical":
        try:
            ai_response = await ai_service.generate_response(
                message_data.content,
                session_type=session.get("session_type", "general"),
                context=session.get("context", {})
            )
            
            # Create AI response message
            ai_message_dict = {
                "session_id": ObjectId(session_id),
                "sender_type": "ai",
                "content": ai_response,
                "message_type": "text"
            }
            
            await db.messages.insert_one(ai_message_dict)
            
            # Send real-time update via WebSocket
            await manager.send_message(
                json.dumps({
                    "type": "ai_response",
                    "content": ai_response,
                    "session_id": session_id
                }),
                session_id
            )
            
        except Exception as e:
            logger.error(f"AI response generation failed: {e}")
    
    return Message(**user_message)

@router.websocket("/sessions/{session_id}/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """WebSocket endpoint for real-time chat"""
    await manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo the message back (in real implementation, you'd process it)
            await manager.send_message(f"Echo: {data}", session_id)
    except WebSocketDisconnect:
        manager.disconnect(session_id)

@router.put("/sessions/{session_id}/close")
async def close_chat_session(
    session_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Close a chat session"""
    if not ObjectId.is_valid(session_id):
        raise HTTPException(status_code=400, detail="Invalid session ID")
    
    result = await db.chat_sessions.update_one(
        {
            "_id": ObjectId(session_id),
            "user_id": current_user.id
        },
        {
            "$set": {
                "status": ChatSessionStatus.CLOSED,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    return {"message": "Chat session closed successfully"}

# Escalation endpoints
@router.post("/sessions/{session_id}/escalate", response_model=Escalation)
async def escalate_session(
    session_id: str,
    escalation_data: EscalationCreate,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Escalate a chat session"""
    if not ObjectId.is_valid(session_id):
        raise HTTPException(status_code=400, detail="Invalid session ID")
    
    # Verify session exists
    session = await db.chat_sessions.find_one({
        "_id": ObjectId(session_id),
        "user_id": current_user.id
    })
    
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    # Create escalation
    escalation_dict = escalation_data.dict()
    escalation_dict["session_id"] = ObjectId(session_id)
    escalation_dict["user_id"] = current_user.id
    
    result = await db.escalations.insert_one(escalation_dict)
    
    # Update session status
    await db.chat_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"status": ChatSessionStatus.ESCALATED}}
    )
    
    created_escalation = await db.escalations.find_one({"_id": result.inserted_id})
    return Escalation(**created_escalation)

@router.get("/escalations", response_model=List[Escalation])
async def get_user_escalations(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get user's escalations"""
    cursor = db.escalations.find({"user_id": current_user.id}).sort("created_at", -1)
    escalations = []
    async for escalation in cursor:
        escalations.append(Escalation(**escalation))
    
    return escalations

# File upload endpoints
@router.post("/sessions/{session_id}/upload", response_model=FileUpload)
async def upload_chat_file(
    session_id: str,
    file_data: FileUploadCreate,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Upload a file to chat session"""
    if not ObjectId.is_valid(session_id):
        raise HTTPException(status_code=400, detail="Invalid session ID")
    
    # Verify session exists
    session = await db.chat_sessions.find_one({
        "_id": ObjectId(session_id),
        "user_id": current_user.id
    })
    
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    file_dict = file_data.dict()
    file_dict["user_id"] = current_user.id
    file_dict["session_id"] = ObjectId(session_id)
    
    result = await db.file_uploads.insert_one(file_dict)
    created_file = await db.file_uploads.find_one({"_id": result.inserted_id})
    
    return FileUpload(**created_file)