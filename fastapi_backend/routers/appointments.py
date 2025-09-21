from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from beanie import PydanticObjectId
from datetime import datetime

from models.appointment import Appointment, AppointmentResponse, AppointmentCreate, AppointmentUpdate
from models.doctor import Doctor
from models.user import User
from routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[AppointmentResponse])
async def get_appointments(
    skip: int = 0,
    limit: int = 100,
    doctor_id: Optional[str] = None,
    patient_id: Optional[str] = None,
    status: Optional[str] = None
):
    query = {}
    if doctor_id:
        query["doctor_id"] = doctor_id
    if patient_id:
        query["patient_id"] = patient_id
    if status:
        query["status"] = status
    
    appointments = await Appointment.find(query).skip(skip).limit(limit).to_list()
    return appointments

@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(appointment_id: PydanticObjectId):
    appointment = await Appointment.get(appointment_id)
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    return appointment

@router.post("/", response_model=AppointmentResponse)
async def create_appointment(
    appointment: AppointmentCreate,
    current_user = Depends(get_current_user)
):
    # Verify doctor exists
    doctor = await Doctor.get(appointment.doctor_id)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    # Verify patient exists (if not current user)
    if appointment.patient_id != str(current_user.id):
        patient = await User.get(appointment.patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
    
    new_appointment = Appointment(**appointment.dict())
    await new_appointment.insert()
    return new_appointment

@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: PydanticObjectId,
    appointment_update: AppointmentUpdate,
    current_user = Depends(get_current_user)
):
    appointment = await Appointment.get(appointment_id)
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Check permissions
    if (appointment.patient_id != str(current_user.id) and 
        appointment.doctor_id != str(current_user.id) and 
        current_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    update_data = appointment_update.dict(exclude_unset=True)
    if update_data:
        await appointment.update({"$set": update_data})
    
    return appointment

@router.delete("/{appointment_id}")
async def delete_appointment(
    appointment_id: PydanticObjectId,
    current_user = Depends(get_current_user)
):
    appointment = await Appointment.get(appointment_id)
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Check permissions
    if (appointment.patient_id != str(current_user.id) and 
        appointment.doctor_id != str(current_user.id) and 
        current_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    await appointment.delete()
    return {"message": "Appointment deleted successfully"}
