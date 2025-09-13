from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from bson import ObjectId
from ..core.database import get_database
from ..models.general import Service, ServiceCreate, ServiceUpdate
from ..models.user import UserInDB
from ..utils.auth import get_current_admin_user
from ..services.azure_storage import azure_storage
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[Service])
async def get_services(
    db: AsyncIOMotorDatabase = Depends(get_database),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category: Optional[str] = None,
    is_featured: Optional[bool] = None
):
    """Get all services with optional filtering"""
    query = {"is_active": True}
    
    if category:
        query["category"] = category
    
    if is_featured is not None:
        query["is_featured"] = is_featured
    
    cursor = db.services.find(query).skip(skip).limit(limit).sort("name", 1)
    services = []
    async for service in cursor:
        services.append(Service(**service))
    
    return services

@router.get("/categories")
async def get_service_categories(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all service categories"""
    pipeline = [
        {"$match": {"is_active": True}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    
    categories = []
    async for category in db.services.aggregate(pipeline):
        categories.append({
            "category": category["_id"],
            "count": category["count"]
        })
    
    return {"categories": categories}

@router.get("/featured", response_model=List[Service])
async def get_featured_services(
    db: AsyncIOMotorDatabase = Depends(get_database),
    limit: int = Query(6, ge=1, le=20)
):
    """Get featured services"""
    cursor = db.services.find({
        "is_active": True,
        "is_featured": True
    }).limit(limit).sort("name", 1)
    
    services = []
    async for service in cursor:
        services.append(Service(**service))
    
    return services

@router.get("/{service_id}", response_model=Service)
async def get_service(
    service_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific service by ID"""
    if not ObjectId.is_valid(service_id):
        raise HTTPException(status_code=400, detail="Invalid service ID")
    
    service = await db.services.find_one({
        "_id": ObjectId(service_id),
        "is_active": True
    })
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return Service(**service)

@router.post("/", response_model=Service)
async def create_service(
    service_data: ServiceCreate,
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new service (Admin only)"""
    service_dict = service_data.dict()
    
    result = await db.services.insert_one(service_dict)
    created_service = await db.services.find_one({"_id": result.inserted_id})
    
    return Service(**created_service)

@router.put("/{service_id}", response_model=Service)
async def update_service(
    service_id: str,
    service_data: ServiceUpdate,
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update a service (Admin only)"""
    if not ObjectId.is_valid(service_id):
        raise HTTPException(status_code=400, detail="Invalid service ID")
    
    update_data = {k: v for k, v in service_data.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.services.update_one(
        {"_id": ObjectId(service_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    
    updated_service = await db.services.find_one({"_id": ObjectId(service_id)})
    return Service(**updated_service)

@router.delete("/{service_id}")
async def delete_service(
    service_id: str,
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete a service (Admin only)"""
    if not ObjectId.is_valid(service_id):
        raise HTTPException(status_code=400, detail="Invalid service ID")
    
    result = await db.services.update_one(
        {"_id": ObjectId(service_id)},
        {"$set": {"is_active": False}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return {"message": "Service deleted successfully"}

@router.post("/upload-image/{service_id}")
async def upload_service_image(
    service_id: str,
    file: UploadFile = File(...),
    current_admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Upload service image"""
    if not ObjectId.is_valid(service_id):
        raise HTTPException(status_code=400, detail="Invalid service ID")
    
    # Check if service exists
    service = await db.services.find_one({"_id": ObjectId(service_id)})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Upload to Azure Storage
        file_content = await file.read()
        image_url = await azure_storage.upload_file(
            file_content=file_content,
            file_name=file.filename,
            content_type=file.content_type,
            folder="services"
        )
        
        # Update service with image URL
        await db.services.update_one(
            {"_id": ObjectId(service_id)},
            {"$set": {"image_url": image_url}}
        )
        
        return {"message": "Image uploaded successfully", "image_url": image_url}
        
    except Exception as e:
        logger.error(f"Error uploading image: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload image")