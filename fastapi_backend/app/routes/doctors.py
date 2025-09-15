"""
Doctor Management Routes for WeCure
Handles doctor listing, profiles, and availability management
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import Optional, List
from datetime import datetime

from ..core.database import get_database
from ..models.doctor import Doctor, DoctorUpdate
from ..utils.auth import get_current_doctor
from ..services.availability_service import availability_service

router = APIRouter()

@router.get("/", response_model=List[Doctor])
async def get_all_doctors(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    specialization: Optional[str] = Query(None),
    is_verified: Optional[bool] = Query(None),
    is_active: Optional[bool] = Query(True),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all doctors with filtering options"""
    try:
        # Build query filter
        query_filter = {}
        if specialization:
            query_filter["specialization"] = {"$regex": specialization, "$options": "i"}
        if is_verified is not None:
            query_filter["is_verified"] = is_verified
        if is_active is not None:
            query_filter["is_active"] = is_active

        # Get doctors from database
        doctors_cursor = db.doctors.find(query_filter).skip(skip).limit(limit)
        doctors = await doctors_cursor.to_list(None)
        
        # Convert to Doctor models with field mapping
        result = []
        for doctor_data in doctors:
            # Handle field mapping for backward compatibility
            if "name" in doctor_data and "full_name" not in doctor_data:
                doctor_data["full_name"] = doctor_data["name"]
            if "specializations" in doctor_data and "specialization" not in doctor_data:
                specializations = doctor_data.get("specializations", [])
                doctor_data["specialization"] = specializations[0] if specializations else ""
            if "experience" in doctor_data and "experience_years" not in doctor_data:
                doctor_data["experience_years"] = doctor_data["experience"]
            if "qualifications" in doctor_data and "qualification" not in doctor_data:
                doctor_data["qualification"] = doctor_data["qualifications"]
            if "address" in doctor_data and "clinic_address" not in doctor_data:
                doctor_data["clinic_address"] = doctor_data["address"]
            
            try:
                doctor = Doctor(**doctor_data)
                result.append(doctor)
            except Exception as e:
                # Skip invalid doctors
                continue
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving doctors: {str(e)}"
        )

@router.get("/{doctor_id}", response_model=Doctor)
async def get_doctor_by_id(
    doctor_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get doctor by ID"""
    try:
        if not ObjectId.is_valid(doctor_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid doctor ID format"
            )
        
        doctor_data = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
        if not doctor_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )
        
        # Handle field mapping for backward compatibility
        if "name" in doctor_data and "full_name" not in doctor_data:
            doctor_data["full_name"] = doctor_data["name"]
        if "specializations" in doctor_data and "specialization" not in doctor_data:
            specializations = doctor_data.get("specializations", [])
            doctor_data["specialization"] = specializations[0] if specializations else ""
        if "experience" in doctor_data and "experience_years" not in doctor_data:
            doctor_data["experience_years"] = doctor_data["experience"]
        if "qualifications" in doctor_data and "qualification" not in doctor_data:
            doctor_data["qualification"] = doctor_data["qualifications"]
        if "address" in doctor_data and "clinic_address" not in doctor_data:
            doctor_data["clinic_address"] = doctor_data["address"]
        
        return Doctor(**doctor_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving doctor: {str(e)}"
        )

@router.get("/profile/me", response_model=Doctor)
async def get_doctor_profile(
    current_doctor = Depends(get_current_doctor),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get current doctor's profile"""
    try:
        doctor_data = await db.doctors.find_one({"_id": ObjectId(current_doctor.id)})
        if not doctor_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor profile not found"
            )
        
        # Handle field mapping
        if "name" in doctor_data and "full_name" not in doctor_data:
            doctor_data["full_name"] = doctor_data["name"]
        if "specializations" in doctor_data and "specialization" not in doctor_data:
            specializations = doctor_data.get("specializations", [])
            doctor_data["specialization"] = specializations[0] if specializations else ""
        if "experience" in doctor_data and "experience_years" not in doctor_data:
            doctor_data["experience_years"] = doctor_data["experience"]
        if "qualifications" in doctor_data and "qualification" not in doctor_data:
            doctor_data["qualification"] = doctor_data["qualifications"]
        if "address" in doctor_data and "clinic_address" not in doctor_data:
            doctor_data["clinic_address"] = doctor_data["address"]
        
        return Doctor(**doctor_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving profile: {str(e)}"
        )

@router.put("/profile/me", response_model=Doctor)
async def update_doctor_profile(
    update_data: DoctorUpdate,
    current_doctor = Depends(get_current_doctor),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update current doctor's profile"""
    try:
        # Prepare update data
        update_dict = update_data.dict(exclude_unset=True)
        if update_dict:
            update_dict["updated_at"] = datetime.utcnow()
            
            # Update doctor in database
            result = await db.doctors.update_one(
                {"_id": ObjectId(current_doctor.id)},
                {"$set": update_dict}
            )
            
            if result.modified_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No changes were made"
                )
        
        # Return updated doctor
        updated_doctor = await db.doctors.find_one({"_id": ObjectId(current_doctor.id)})
        
        # Handle field mapping
        if "name" in updated_doctor and "full_name" not in updated_doctor:
            updated_doctor["full_name"] = updated_doctor["name"]
        if "specializations" in updated_doctor and "specialization" not in updated_doctor:
            specializations = updated_doctor.get("specializations", [])
            updated_doctor["specialization"] = specializations[0] if specializations else ""
        if "experience" in updated_doctor and "experience_years" not in updated_doctor:
            updated_doctor["experience_years"] = updated_doctor["experience"]
        if "qualifications" in updated_doctor and "qualification" not in updated_doctor:
            updated_doctor["qualification"] = updated_doctor["qualifications"]
        if "address" in updated_doctor and "clinic_address" not in updated_doctor:
            updated_doctor["clinic_address"] = updated_doctor["address"]
        
        return Doctor(**updated_doctor)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating profile: {str(e)}"
        )

@router.put("/my-availability")
async def set_doctor_availability(
    availability_data: dict,
    current_doctor = Depends(get_current_doctor),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Set doctor's availability schedule"""
    try:
        success = await availability_service.set_doctor_availability(
            db, str(current_doctor.id), availability_data
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update availability"
            )
        
        return {"message": "Availability updated successfully", "availability": availability_data}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error setting availability: {str(e)}"
        )

@router.get("/{doctor_id}/availability")
async def get_doctor_availability(
    doctor_id: str,
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get doctor's availability for a specific date or week"""
    try:
        if not ObjectId.is_valid(doctor_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid doctor ID format"
            )
        
        if date:
            # Get availability for specific date
            slots = await availability_service.get_doctor_available_slots(db, doctor_id, date)
            return {
                "doctor_id": doctor_id,
                "date": date,
                "available_slots": slots,
                "total_slots": len(slots)
            }
        else:
            # Get weekly availability
            start_date = datetime.now().strftime("%Y-%m-%d")
            weekly_availability = await availability_service.get_doctor_availability_for_week(
                db, doctor_id, start_date
            )
            return {
                "doctor_id": doctor_id,
                "weekly_availability": weekly_availability
            }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting availability: {str(e)}"
        )