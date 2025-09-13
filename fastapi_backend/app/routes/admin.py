from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional, Dict, Any
from bson import ObjectId
from datetime import datetime, timedelta
import uuid
from ..core.database import get_database
from ..models.user import UserInDB, User
from ..models.doctor import Doctor, DoctorInDB
from ..models.medicine import Medicine
from ..models.orders import Order, OrderStatus
from ..models.appointment import Appointment
from ..models.emergency import EmergencyRequest
from ..models.general import Contact, Service, FooterContent
from ..utils.auth import get_current_admin_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Dashboard Analytics
@router.get("/dashboard/analytics")
async def get_admin_analytics(
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get admin dashboard analytics"""
    try:
        # Get current date for time-based analytics
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=7)
        month_start = today_start - timedelta(days=30)
        
        # User analytics
        total_users = await db.users.count_documents({"is_active": True})
        new_users_today = await db.users.count_documents({
            "created_at": {"$gte": today_start}
        })
        new_users_week = await db.users.count_documents({
            "created_at": {"$gte": week_start}
        })
        
        # Doctor analytics
        total_doctors = await db.doctors.count_documents({"is_active": True})
        verified_doctors = await db.doctors.count_documents({
            "is_active": True, 
            "is_verified": True
        })
        pending_verifications = await db.doctors.count_documents({
            "is_active": True,
            "is_verified": False
        })
        
        # Appointment analytics
        total_appointments = await db.appointments.count_documents({})
        today_appointments = await db.appointments.count_documents({
            "appointment_date": {"$gte": today_start, "$lt": today_start + timedelta(days=1)}
        })
        pending_appointments = await db.appointments.count_documents({
            "status": "pending"
        })
        
        # Order analytics
        total_orders = await db.orders.count_documents({})
        pending_orders = await db.orders.count_documents({
            "status": {"$in": ["pending", "confirmed", "processing"]}
        })
        completed_orders = await db.orders.count_documents({
            "status": "delivered"
        })
        
        # Revenue analytics (sum of completed orders)
        revenue_pipeline = [
            {"$match": {"status": "delivered"}},
            {"$group": {"_id": None, "total": {"$sum": "$final_amount"}}}
        ]
        revenue_result = await db.orders.aggregate(revenue_pipeline).to_list(1)
        total_revenue = revenue_result[0]["total"] if revenue_result else 0
        
        # Emergency analytics
        total_emergencies = await db.emergency_requests.count_documents({})
        active_emergencies = await db.emergency_requests.count_documents({
            "status": {"$in": ["pending", "dispatched", "en_route"]}
        })
        
        # Medicine analytics
        total_medicines = await db.medicines.count_documents({"is_active": True})
        out_of_stock = await db.medicines.count_documents({
            "is_active": True,
            "in_stock": False
        })
        
        # Contact/Support analytics
        pending_contacts = await db.contacts.count_documents({
            "status": "pending"
        })
        
        return {
            "users": {
                "total": total_users,
                "new_today": new_users_today,
                "new_this_week": new_users_week
            },
            "doctors": {
                "total": total_doctors,
                "verified": verified_doctors,
                "pending_verification": pending_verifications
            },
            "appointments": {
                "total": total_appointments,
                "today": today_appointments,
                "pending": pending_appointments
            },
            "orders": {
                "total": total_orders,
                "pending": pending_orders,
                "completed": completed_orders,
                "total_revenue": total_revenue
            },
            "emergency": {
                "total": total_emergencies,
                "active": active_emergencies
            },
            "medicine": {
                "total": total_medicines,
                "out_of_stock": out_of_stock
            },
            "support": {
                "pending_contacts": pending_contacts
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching admin analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics")

# User Management
@router.get("/users", response_model=List[User])
async def get_all_users(
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    is_active: Optional[bool] = None
):
    """Get all users with filtering"""
    query = {}
    
    if is_active is not None:
        query["is_active"] = is_active
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    
    cursor = db.users.find(query).skip(skip).limit(limit).sort("created_at", -1)
    users = []
    async for user_data in cursor:
        # Remove sensitive data
        user_data.pop("hashed_password", None)
        users.append(User(**user_data))
    
    return users

@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    is_active: bool,
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update user active status"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": is_active, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": f"User {'activated' if is_active else 'deactivated'} successfully"}

# Doctor Management
@router.get("/doctors", response_model=List[Doctor])
async def get_all_doctors(
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    is_verified: Optional[bool] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None
):
    """Get all doctors with filtering"""
    query = {}
    
    if is_verified is not None:
        query["is_verified"] = is_verified
    
    if is_active is not None:
        query["is_active"] = is_active
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"license_number": {"$regex": search, "$options": "i"}}
        ]
    
    cursor = db.doctors.find(query).skip(skip).limit(limit).sort("created_at", -1)
    doctors = []
    async for doctor_data in cursor:
        # Remove sensitive data
        doctor_data.pop("hashed_password", None)
        doctors.append(Doctor(**doctor_data))
    
    return doctors

@router.put("/doctors/{doctor_id}/verify")
async def verify_doctor(
    doctor_id: str,
    is_verified: bool,
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Verify or unverify a doctor"""
    if not ObjectId.is_valid(doctor_id):
        raise HTTPException(status_code=400, detail="Invalid doctor ID")
    
    result = await db.doctors.update_one(
        {"_id": ObjectId(doctor_id)},
        {"$set": {"is_verified": is_verified, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    return {"message": f"Doctor {'verified' if is_verified else 'unverified'} successfully"}

# Order Management
@router.get("/orders", response_model=List[Order])
async def get_all_orders(
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    order_number: Optional[str] = None
):
    """Get all orders with filtering"""
    query = {}
    
    if status:
        query["status"] = status
    
    if order_number:
        query["order_number"] = {"$regex": order_number, "$options": "i"}
    
    cursor = db.orders.find(query).skip(skip).limit(limit).sort("created_at", -1)
    orders = []
    async for order in cursor:
        orders.append(Order(**order))
    
    return orders

@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status: str,
    tracking_number: Optional[str] = None,
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update order status"""
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
    
    # Validate status
    valid_statuses = [getattr(OrderStatus, attr) for attr in dir(OrderStatus) if not attr.startswith('_')]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid order status")
    
    update_data = {
        "status": status,
        "updated_at": datetime.utcnow()
    }
    
    if tracking_number:
        update_data["tracking_number"] = tracking_number
    
    if status == OrderStatus.DELIVERED:
        update_data["delivered_at"] = datetime.utcnow()
    
    result = await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated successfully"}

# Appointment Management
@router.get("/appointments", response_model=List[Appointment])
async def get_all_appointments(
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    date: Optional[str] = None
):
    """Get all appointments with filtering"""
    query = {}
    
    if status:
        query["status"] = status
    
    if date:
        try:
            date_obj = datetime.strptime(date, "%Y-%m-%d")
            next_day = date_obj + timedelta(days=1)
            query["appointment_date"] = {"$gte": date_obj, "$lt": next_day}
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    cursor = db.appointments.find(query).skip(skip).limit(limit).sort("appointment_date", -1)
    appointments = []
    async for appointment in cursor:
        appointments.append(Appointment(**appointment))
    
    return appointments

# Emergency Management
@router.get("/emergency-requests", response_model=List[EmergencyRequest])
async def get_all_emergency_requests(
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    emergency_type: Optional[str] = None
):
    """Get all emergency requests with filtering"""
    query = {}
    
    if status:
        query["status"] = status
    
    if emergency_type:
        query["emergency_type"] = emergency_type
    
    cursor = db.emergency_requests.find(query).skip(skip).limit(limit).sort("created_at", -1)
    requests = []
    async for request in cursor:
        requests.append(EmergencyRequest(**request))
    
    return requests

# Contact/Support Management
@router.get("/contacts", response_model=List[Contact])
async def get_all_contacts(
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    department: Optional[str] = None
):
    """Get all contact requests"""
    query = {}
    
    if status:
        query["status"] = status
    
    if department:
        query["department"] = department
    
    cursor = db.contacts.find(query).skip(skip).limit(limit).sort("created_at", -1)
    contacts = []
    async for contact in cursor:
        contacts.append(Contact(**contact))
    
    return contacts

@router.put("/contacts/{contact_id}/assign")
async def assign_contact(
    contact_id: str,
    assigned_to: str,
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Assign contact to admin/doctor"""
    if not ObjectId.is_valid(contact_id):
        raise HTTPException(status_code=400, detail="Invalid contact ID")
    
    if assigned_to and not ObjectId.is_valid(assigned_to):
        raise HTTPException(status_code=400, detail="Invalid assigned_to ID")
    
    update_data = {
        "assigned_to": ObjectId(assigned_to) if assigned_to else None,
        "status": "in_progress" if assigned_to else "pending",
        "updated_at": datetime.utcnow()
    }
    
    result = await db.contacts.update_one(
        {"_id": ObjectId(contact_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    return {"message": "Contact assigned successfully"}

# System Configuration
@router.get("/config/services", response_model=List[Service])
async def get_services_config(
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get system services configuration"""
    cursor = db.services.find({}).sort("name", 1)
    services = []
    async for service in cursor:
        services.append(Service(**service))
    
    return services

@router.get("/config/footer", response_model=List[FooterContent])
async def get_footer_config(
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get footer content configuration"""
    cursor = db.footer_content.find({"is_active": True}).sort("order", 1)
    footer_content = []
    async for content in cursor:
        footer_content.append(FooterContent(**content))
    
    return footer_content

# System Health
@router.get("/system/health")
async def get_system_health(
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get system health status"""
    try:
        # Test database connection
        await db.command("ping")
        db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    # Get collection counts for health check
    collections_health = {}
    try:
        collections = ["users", "doctors", "appointments", "orders", "medicines"]
        for collection in collections:
            count = await db[collection].count_documents({})
            collections_health[collection] = {"count": count, "status": "healthy"}
    except Exception as e:
        collections_health["error"] = str(e)
    
    return {
        "database": db_status,
        "collections": collections_health,
        "timestamp": datetime.utcnow()
    }