from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from beanie import PydanticObjectId

from models.service import Service, ServiceResponse, ServiceCreate, ServiceUpdate
from routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ServiceResponse])
async def get_services(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
    location: Optional[str] = None
):
    query = {}
    if category:
        query["category"] = category
    if is_active is not None:
        query["is_active"] = is_active
    if location:
        query["location"] = location
    
    services = await Service.find(query).skip(skip).limit(limit).to_list()
    return services

@router.get("/{service_id}", response_model=ServiceResponse)
async def get_service(service_id: PydanticObjectId):
    service = await Service.get(service_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    return service

@router.post("/", response_model=ServiceResponse)
async def create_service(
    service: ServiceCreate,
    current_user = Depends(get_current_user)
):
    if current_user.role not in ["admin", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    new_service = Service(**service.dict())
    await new_service.insert()
    return new_service

@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: PydanticObjectId,
    service_update: ServiceUpdate,
    current_user = Depends(get_current_user)
):
    if current_user.role not in ["admin", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    service = await Service.get(service_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    update_data = service_update.dict(exclude_unset=True)
    if update_data:
        await service.update({"$set": update_data})
    
    return service

@router.delete("/{service_id}")
async def delete_service(
    service_id: PydanticObjectId,
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    service = await Service.get(service_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    await service.delete()
    return {"message": "Service deleted successfully"}
