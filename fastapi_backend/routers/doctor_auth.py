from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from models.doctor import Doctor, DoctorCreate, DoctorResponse
from config import settings

router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Response schemas to match Node.js doctor auth exactly
class DoctorAuthResponse(BaseModel):
    message: str
    token: str
    doctorResponse: dict

class ErrorResponse(BaseModel):
    message: str
    errorType: Optional[str] = None
    suggestion: Optional[str] = None

# Password utilities
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# JWT utilities
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7)  # Match Node.js 7d expiry
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

async def get_current_doctor(token: str = Depends(lambda: None)):
    """Get current doctor from JWT token"""
    # This would be implemented with proper JWT validation
    # For now, returning a placeholder
    pass

# Routes - exactly matching Node.js doctor auth structure

@router.post("/register", response_model=DoctorAuthResponse)
async def register_doctor(req_body: dict):
    """Register a new doctor - matches Node.js doctorAuthController.registerDoctor exactly"""
    try:
        # Extract all fields exactly like Node.js
        name = req_body.get("name")
        email = req_body.get("email")
        password = req_body.get("password")
        phone = req_body.get("phone")
        dob = req_body.get("dob")
        gender = req_body.get("gender")
        profile_picture = req_body.get("profilePicture")
        license_number = req_body.get("licenseNumber")
        experience = req_body.get("experience")
        specializations = req_body.get("specializations", [])
        qualifications = req_body.get("qualifications")
        bio = req_body.get("bio")
        certificates = req_body.get("certificates", [])
        practice_name = req_body.get("practiceName")
        address = req_body.get("address")
        city = req_body.get("city")
        state = req_body.get("state")
        zip_code = req_body.get("zipCode")
        country = req_body.get("country")
        consultation_fee = req_body.get("consultationFee")
        
        # Validate required fields exactly like Node.js
        required_fields = [
            'name', 'email', 'password', 'phone', 'dob', 'gender',
            'licenseNumber', 'experience', 'specializations', 'qualifications', 'bio',
            'practiceName', 'address', 'city', 'state', 'zipCode', 'country', 'consultationFee'
        ]
        
        missing_fields = [field for field in required_fields if not req_body.get(field)]
        if missing_fields:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "The following required fields are missing:",
                    "missingFields": [{"field": field, "message": f"{field[0].upper() + field[1:]} is required"} for field in missing_fields],
                    "suggestion": "Please fill in all required fields and try again. All fields marked with * are required. You can save your progress and complete the form later."
                }
            )
        
        # Validate specializations array exactly like Node.js
        if not specializations or len(specializations) == 0:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "At least one specialization is required",
                    "field": "specializations",
                    "suggestion": "Please add at least one medical specialization from the form (e.g., Cardiology, Neurology, Pediatrics). You can add multiple specializations."
                }
            )
        
        if not isinstance(specializations, list):
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Specializations must be provided as a list",
                    "field": "specializations",
                    "suggestion": "Please use the form to add specializations one by one. Click the 'Add' button after typing each specialization. You can remove specializations by clicking the 'x' button."
                }
            )
        
        # Validate each specialization exactly like Node.js
        for i, spec in enumerate(specializations):
            if not isinstance(spec, str) or len(spec.strip()) < 2 or len(spec.strip()) > 50:
                raise HTTPException(
                    status_code=400,
                    detail={
                        "message": "Invalid specialization format",
                        "field": f"specializations[{i}]",
                        "value": spec,
                        "suggestion": "Each specialization must be 2-50 characters long and contain only letters and spaces (e.g., Cardiology, Neurology, Internal Medicine)"
                    }
                )
        
        # Check if doctor already exists
        existing_doctor = await Doctor.find_one(Doctor.email == email)
        if existing_doctor:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Doctor with this email already exists",
                    "field": "email",
                    "suggestion": "This email is already registered. Please use a different email or try logging in if you already have an account."
                }
            )
        
        # Check if license number already exists
        existing_license = await Doctor.find_one(Doctor.license_number == license_number)
        if existing_license:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Doctor with this license number already exists",
                    "field": "licenseNumber",
                    "suggestion": "This license number is already registered. Please check your license number or contact support if you believe this is an error."
                }
            )
        
        # Hash password
        hashed_password = get_password_hash(password)
        
        # Create doctor
        doctor = Doctor(
            name=name,
            email=email,
            password=hashed_password,
            phone=phone,
            date_of_birth=dob,
            gender=gender,
            profile_image=profile_picture,
            license_number=license_number,
            experience=experience,
            specializations=specializations,
            qualifications=qualifications,
            bio=bio,
            address=address,
            city=city,
            state=state,
            country=country,
            pincode=zip_code,
            consultation_fee=consultation_fee,
            hospital=practice_name,
            is_available=True,
            rating=0.0,
            total_ratings=0
        )
        await doctor.insert()
        
        # Create JWT token exactly like Node.js
        payload = {
            "id": str(doctor.id),
            "email": doctor.email,
            "role": "doctor"
        }
        token = create_access_token(payload)
        
        # Remove password from response exactly like Node.js
        doctor_response = doctor.dict()
        doctor_response.pop("password", None)
        doctor_response["id"] = str(doctor_response["id"])
        
        return DoctorAuthResponse(
            message="Doctor registration successful",
            token=token,
            doctorResponse=doctor_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "An unexpected error occurred during registration. Please try again later.",
                "error": str(e)
            }
        )

@router.post("/login", response_model=DoctorAuthResponse)
async def login_doctor(req_body: dict):
    """Login doctor - matches Node.js doctorAuthController.loginDoctor exactly"""
    try:
        professional_id = req_body.get("professionalId")
        password = req_body.get("password")
        
        # Validate input exactly like Node.js
        if not professional_id or not password:
            raise HTTPException(
                status_code=400,
                detail={"message": "Professional ID/Email and password are required"}
            )
        
        # Find doctor by email or license number exactly like Node.js
        doctor = await Doctor.find_one({
            "$or": [
                {"email": professional_id},
                {"license_number": professional_id}
            ]
        })
        
        if not doctor:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Professional ID/Email not registered",
                    "errorType": "professional_id_not_found",
                    "suggestion": "This Professional ID or Email is not registered. Please check your details or contact support to register."
                }
            )
        
        # Check if doctor is verified exactly like Node.js
        if not getattr(doctor, 'is_verified', True):  # Default to True if field doesn't exist
            raise HTTPException(
                status_code=403,
                detail={"message": "Account not verified. Please contact support."}
            )
        
        # Check password
        if not verify_password(password, doctor.password):
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Incorrect password",
                    "errorType": "wrong_password",
                    "suggestion": "The password you entered is incorrect. Please try again or contact support to reset your password."
                }
            )
        
        # Create JWT token exactly like Node.js
        payload = {
            "id": str(doctor.id),
            "email": doctor.email,
            "role": "doctor"
        }
        token = create_access_token(payload)
        
        # Remove password from response exactly like Node.js
        doctor_response = doctor.dict()
        doctor_response.pop("password", None)
        doctor_response["id"] = str(doctor_response["id"])
        
        return DoctorAuthResponse(
            message="Login successful",
            token=token,
            doctorResponse=doctor_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "An unexpected error occurred during login. Please try again later.",
                "error": str(e)
            }
        )

# Add other doctor routes as needed...
