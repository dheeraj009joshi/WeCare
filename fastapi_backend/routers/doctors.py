from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from beanie import PydanticObjectId

from models.doctor import Doctor, DoctorResponse, DoctorUpdate
from routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[DoctorResponse])
async def get_doctors(
    skip: int = 0,
    limit: int = 100,
    specialization: Optional[str] = None,
    city: Optional[str] = None,
    is_available: Optional[bool] = None
):
    query = {}
    if specialization:
        query["specializations"] = {"$in": [specialization]}
    if city:
        query["city"] = city
    if is_available is not None:
        query["is_available"] = is_available
    
    doctors = await Doctor.find(query).skip(skip).limit(limit).to_list()
    return doctors

@router.get("/{doctor_id}", response_model=DoctorResponse)
async def get_doctor(doctor_id: PydanticObjectId):
    doctor = await Doctor.get(doctor_id)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    return doctor

@router.put("/{doctor_id}", response_model=DoctorResponse)
async def update_doctor(
    doctor_id: PydanticObjectId,
    doctor_update: DoctorUpdate,
    current_user = Depends(get_current_user)
):
    doctor = await Doctor.get(doctor_id)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    # Check if doctor is updating their own profile or is admin
    if doctor.id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    update_data = doctor_update.dict(exclude_unset=True)
    if update_data:
        await doctor.update({"$set": update_data})
    
    return doctor

@router.delete("/{doctor_id}")
async def delete_doctor(
    doctor_id: PydanticObjectId,
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    doctor = await Doctor.get(doctor_id)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    await doctor.delete()
    return {"message": "Doctor deleted successfully"}
