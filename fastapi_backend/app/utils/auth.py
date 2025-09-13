from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..core.database import get_database
from ..core.security import decode_token
from ..models.user import UserInDB
from ..models.doctor import DoctorInDB
from bson import ObjectId
from typing import Optional, Union

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> UserInDB:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        user_id = decode_token(token)
        if user_id is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
    
    user_data = await db.users.find_one({"_id": ObjectId(user_id)})
    if user_data is None:
        raise credentials_exception
    
    # Handle field mapping for backward compatibility
    if "name" in user_data and "full_name" not in user_data:
        user_data["full_name"] = user_data["name"]
    
    return UserInDB(**user_data)

async def get_current_doctor(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> DoctorInDB:
    """Get current authenticated doctor"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        doctor_id = decode_token(token)
        if doctor_id is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
    
    doctor_data = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
    if doctor_data is None:
        raise credentials_exception
    
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
    
    return DoctorInDB(**doctor_data)

async def get_current_active_user(
    current_user: UserInDB = Depends(get_current_user)
) -> UserInDB:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_admin_user(
    current_user: UserInDB = Depends(get_current_user)
) -> UserInDB:
    """Get current admin user"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

async def get_current_active_doctor(
    current_doctor: DoctorInDB = Depends(get_current_doctor)
) -> DoctorInDB:
    """Get current active doctor"""
    if not current_doctor.is_active:
        raise HTTPException(status_code=400, detail="Inactive doctor")
    return current_doctor

async def get_current_verified_doctor(
    current_doctor: DoctorInDB = Depends(get_current_doctor)
) -> DoctorInDB:
    """Get current verified doctor"""
    if not current_doctor.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doctor not verified"
        )
    if not current_doctor.is_active:
        raise HTTPException(status_code=400, detail="Inactive doctor")
    return current_doctor

async def authenticate_user(
    email: str, 
    password: str, 
    db: AsyncIOMotorDatabase
) -> Optional[UserInDB]:
    """Authenticate user with email and password"""
    from ..core.security import verify_password
    
    user_data = await db.users.find_one({"email": email})
    if not user_data:
        return None
    
    # Handle field mapping for backward compatibility
    if "name" in user_data and "full_name" not in user_data:
        user_data["full_name"] = user_data["name"]
    
    user = UserInDB(**user_data)
    if not verify_password(password, user.hashed_password):
        return None
    
    return user

async def authenticate_doctor(
    email: str, 
    password: str, 
    db: AsyncIOMotorDatabase
) -> Optional[DoctorInDB]:
    """Authenticate doctor with email and password"""
    from ..core.security import verify_password
    
    doctor_data = await db.doctors.find_one({"email": email})
    if not doctor_data:
        return None
    
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
    
    doctor = DoctorInDB(**doctor_data)
    if not verify_password(password, doctor.hashed_password):
        return None
    
    return doctor