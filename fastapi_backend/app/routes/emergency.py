from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional, Dict
from bson import ObjectId
from datetime import datetime, timedelta
import uuid
from ..core.database import get_database
from ..models.emergency import (
    Ambulance, AmbulanceCreate, AmbulanceUpdate,
    EmergencyRequest, EmergencyRequestCreate, EmergencyRequestUpdate, EmergencyStatus,
    EmergencyContact, EmergencyContactCreate, EmergencyContactUpdate
)
from ..models.user import UserInDB
from ..utils.auth import get_current_active_user, get_current_admin_user
from ..services.email_service import email_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Emergency Request endpoints
@router.post("/request", response_model=EmergencyRequest)
async def create_emergency_request(
    request_data: EmergencyRequestCreate,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new emergency request"""
    # Generate unique request number
    request_number = f"ER{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:8].upper()}"
    
    # Find nearest available ambulance
    ambulance = await db.ambulances.find_one({
        "is_available": True
    })
    
    request_dict = request_data.dict()
    request_dict["user_id"] = current_user.id
    request_dict["request_number"] = request_number
    
    if ambulance:
        request_dict["ambulance_id"] = ambulance["_id"]
        # Set estimated arrival (15-30 minutes from now)
        estimated_time = datetime.utcnow() + timedelta(minutes=20)
        request_dict["estimated_arrival"] = estimated_time
        
        # Mark ambulance as unavailable
        await db.ambulances.update_one(
            {"_id": ambulance["_id"]},
            {"$set": {"is_available": False}}
        )
    
    result = await db.emergency_requests.insert_one(request_dict)
    created_request = await db.emergency_requests.find_one({"_id": result.inserted_id})
    
    # Send emergency notification (in production, use SMS/push notifications)
    try:
        await email_service.send_email(
            current_user.email,
            "Emergency Request Received - WeCure",
            f"""
            <h2>Emergency Request Confirmed</h2>
            <p>Your emergency request #{request_number} has been received.</p>
            <p><strong>Request Details:</strong></p>
            <ul>
                <li>Type: {request_data.emergency_type}</li>
                <li>Location: {request_data.address}</li>
                <li>Estimated Arrival: {estimated_time.strftime('%H:%M') if ambulance else 'Processing'}</li>
            </ul>
            <p>Stay calm. Help is on the way.</p>
            """,
            is_html=True
        )
    except Exception as e:
        logger.error(f"Failed to send emergency email: {e}")
    
    return EmergencyRequest(**created_request)

@router.get("/requests", response_model=List[EmergencyRequest])
async def get_user_emergency_requests(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get user's emergency requests"""
    cursor = db.emergency_requests.find({
        "user_id": current_user.id
    }).sort("created_at", -1).skip(skip).limit(limit)
    
    requests = []
    async for request in cursor:
        requests.append(EmergencyRequest(**request))
    
    return requests

@router.get("/requests/{request_id}", response_model=EmergencyRequest)
async def get_emergency_request(
    request_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific emergency request"""
    if not ObjectId.is_valid(request_id):
        raise HTTPException(status_code=400, detail="Invalid request ID")
    
    request = await db.emergency_requests.find_one({
        "_id": ObjectId(request_id),
        "user_id": current_user.id
    })
    
    if not request:
        raise HTTPException(status_code=404, detail="Emergency request not found")
    
    return EmergencyRequest(**request)

@router.put("/requests/{request_id}/status")
async def update_emergency_status(
    request_id: str,
    status: str,
    current_user: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update emergency request status (Admin only)"""
    if not ObjectId.is_valid(request_id):
        raise HTTPException(status_code=400, detail="Invalid request ID")
    
    if status not in [s for s in dir(EmergencyStatus) if not s.startswith('_')]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    update_data = {
        "status": status,
        "updated_at": datetime.utcnow()
    }
    
    if status == EmergencyStatus.COMPLETED:
        update_data["completed_at"] = datetime.utcnow()
        
        # Mark ambulance as available again
        request = await db.emergency_requests.find_one({"_id": ObjectId(request_id)})
        if request and request.get("ambulance_id"):
            await db.ambulances.update_one(
                {"_id": request["ambulance_id"]},
                {"$set": {"is_available": True}}
            )
    
    result = await db.emergency_requests.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Emergency request not found")
    
    return {"message": "Status updated successfully"}

# Emergency Contact endpoints
@router.get("/contacts", response_model=List[EmergencyContact])
async def get_emergency_contacts(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get user's emergency contacts"""
    cursor = db.emergency_contacts.find({
        "user_id": current_user.id,
        "is_active": True
    }).sort("is_primary", -1)
    
    contacts = []
    async for contact in cursor:
        contacts.append(EmergencyContact(**contact))
    
    return contacts

@router.post("/contacts", response_model=EmergencyContact)
async def create_emergency_contact(
    contact_data: EmergencyContactCreate,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new emergency contact"""
    contact_dict = contact_data.dict()
    contact_dict["user_id"] = current_user.id
    
    # If this is marked as primary, unset other primary contacts
    if contact_data.is_primary:
        await db.emergency_contacts.update_many(
            {"user_id": current_user.id},
            {"$set": {"is_primary": False}}
        )
    
    result = await db.emergency_contacts.insert_one(contact_dict)
    created_contact = await db.emergency_contacts.find_one({"_id": result.inserted_id})
    
    return EmergencyContact(**created_contact)

@router.put("/contacts/{contact_id}", response_model=EmergencyContact)
async def update_emergency_contact(
    contact_id: str,
    contact_data: EmergencyContactUpdate,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update an emergency contact"""
    if not ObjectId.is_valid(contact_id):
        raise HTTPException(status_code=400, detail="Invalid contact ID")
    
    update_data = {k: v for k, v in contact_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    # If setting as primary, unset other primary contacts
    if contact_data.is_primary:
        await db.emergency_contacts.update_many(
            {"user_id": current_user.id, "_id": {"$ne": ObjectId(contact_id)}},
            {"$set": {"is_primary": False}}
        )
    
    result = await db.emergency_contacts.update_one(
        {
            "_id": ObjectId(contact_id),
            "user_id": current_user.id
        },
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Emergency contact not found")
    
    updated_contact = await db.emergency_contacts.find_one({"_id": ObjectId(contact_id)})
    return EmergencyContact(**updated_contact)

@router.delete("/contacts/{contact_id}")
async def delete_emergency_contact(
    contact_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete an emergency contact"""
    if not ObjectId.is_valid(contact_id):
        raise HTTPException(status_code=400, detail="Invalid contact ID")
    
    result = await db.emergency_contacts.update_one(
        {
            "_id": ObjectId(contact_id),
            "user_id": current_user.id
        },
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Emergency contact not found")
    
    return {"message": "Emergency contact deleted successfully"}

# Ambulance endpoints (Admin only)
@router.get("/ambulances", response_model=List[Ambulance])
async def get_ambulances(
    current_user: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    is_available: Optional[bool] = None
):
    """Get all ambulances (Admin only)"""
    query = {}
    if is_available is not None:
        query["is_available"] = is_available
    
    cursor = db.ambulances.find(query)
    ambulances = []
    async for ambulance in cursor:
        ambulances.append(Ambulance(**ambulance))
    
    return ambulances

@router.post("/ambulances", response_model=Ambulance)
async def create_ambulance(
    ambulance_data: AmbulanceCreate,
    current_user: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new ambulance (Admin only)"""
    ambulance_dict = ambulance_data.dict()
    
    result = await db.ambulances.insert_one(ambulance_dict)
    created_ambulance = await db.ambulances.find_one({"_id": result.inserted_id})
    
    return Ambulance(**created_ambulance)

@router.put("/ambulances/{ambulance_id}", response_model=Ambulance)
async def update_ambulance(
    ambulance_id: str,
    ambulance_data: AmbulanceUpdate,
    current_user: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update an ambulance (Admin only)"""
    if not ObjectId.is_valid(ambulance_id):
        raise HTTPException(status_code=400, detail="Invalid ambulance ID")
    
    update_data = {k: v for k, v in ambulance_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.ambulances.update_one(
        {"_id": ObjectId(ambulance_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    
    updated_ambulance = await db.ambulances.find_one({"_id": ObjectId(ambulance_id)})
    return Ambulance(**updated_ambulance)

@router.get("/ambulances/track/{request_id}")
async def track_ambulance(
    request_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Track ambulance for emergency request"""
    if not ObjectId.is_valid(request_id):
        raise HTTPException(status_code=400, detail="Invalid request ID")
    
    # Get emergency request
    request = await db.emergency_requests.find_one({
        "_id": ObjectId(request_id),
        "user_id": current_user.id
    })
    
    if not request:
        raise HTTPException(status_code=404, detail="Emergency request not found")
    
    if not request.get("ambulance_id"):
        return {
            "status": "no_ambulance_assigned",
            "message": "No ambulance assigned yet"
        }
    
    # Get ambulance details
    ambulance = await db.ambulances.find_one({"_id": request["ambulance_id"]})
    
    if not ambulance:
        return {
            "status": "ambulance_not_found",
            "message": "Ambulance details not available"
        }
    
    return {
        "status": request["status"],
        "ambulance": {
            "vehicle_number": ambulance["vehicle_number"],
            "driver_name": ambulance["driver_name"],
            "driver_phone": ambulance["driver_phone"],
            "current_location": ambulance.get("current_location", {}),
            "estimated_arrival": request.get("estimated_arrival")
        },
        "request_details": {
            "request_number": request["request_number"],
            "emergency_type": request["emergency_type"],
            "created_at": request["created_at"],
            "status": request["status"]
        }
    }