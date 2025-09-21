from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta, date
from typing import Optional
import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from beanie import PydanticObjectId

from models.user import User, UserCreate, UserResponse, UserLogin
from models.doctor import Doctor, DoctorCreate, DoctorResponse, DoctorLogin
from config import settings

router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login-form")

# JWT token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Response schemas to match Node.js backend exactly
class AuthResponse(BaseModel):
    token: str
    user: dict

class DoctorAuthResponse(BaseModel):
    message: str
    token: str
    doctorResponse: dict

class MessageResponse(BaseModel):
    message: str
    success: Optional[bool] = None

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

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: str = payload.get("id")
        role: str = payload.get("role")
        if user_id is None or role is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    # Find user based on role
    if role == "doctor":
        user = await Doctor.find_one({"_id": PydanticObjectId(user_id)})
    else:
        user = await User.find_one({"_id": PydanticObjectId(user_id)})
    
    if user is None:
        raise credentials_exception
    return user

# Routes - exactly matching Node.js structure

@router.post("/register", response_model=AuthResponse)
async def register(req_body: dict):
    """Register a new user - matches Node.js authController.register exactly"""
    try:
        # Extract fields exactly like Node.js
        name = req_body.get("name")
        email = req_body.get("email")
        password = req_body.get("password")
        role = req_body.get("role", "user")
        phone = req_body.get("phone")
        address = req_body.get("address")
        gender = req_body.get("gender")
        
        # Validate required fields exactly like Node.js
        if not name or not email or not password:
            raise HTTPException(
                status_code=400,
                detail={"message": "All fields are required"}
            )
        
        # Check if user already exists
        existing_user = await User.find_one(User.email == email)
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail={"message": "User already exists"}
            )
        
        # Hash password
        hashed_password = get_password_hash(password)
        
        # Create user
        user = User(
            name=name,
            email=email,
            password=hashed_password,
            role=role,
            phone=phone,
            address=address,
            gender=gender
        )
        await user.insert()
        
        # Create JWT token exactly like Node.js
        payload = {
            "id": str(user.id),
            "role": user.role,
        }
        token = create_access_token(payload)
        
        # Return response exactly like Node.js
        return AuthResponse(
            token=token,
            user={
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "phone": user.phone,
                "address": user.address,
                "gender": user.gender,
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"message": "Server error", "error": str(e)}
        )

@router.post("/login", response_model=AuthResponse)
async def login(req_body: dict):
    """Login user - matches Node.js authController.login exactly"""
    try:
        email = req_body.get("email")
        password = req_body.get("password")
        
        # Validate input exactly like Node.js
        if not email or not password:
            raise HTTPException(
                status_code=400,
                detail={"message": "All fields are required"}
            )
        
        # Check if user exists
        user = await User.find_one(User.email == email)
        if not user:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Email not registered",
                    "errorType": "email_not_found",
                    "suggestion": "This email address is not registered. Please check your email or sign up for a new account."
                }
            )
        
        # Check password
        if not verify_password(password, user.password):
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Incorrect password",
                    "errorType": "wrong_password",
                    "suggestion": "The password you entered is incorrect. Please try again or use 'Forgot Password' to reset."
                }
            )
        
        # Create JWT token exactly like Node.js
        payload = {
            "id": str(user.id),
            "role": user.role,
        }
        token = create_access_token(payload)
        
        # Return response exactly like Node.js
        return AuthResponse(
            token=token,
            user={
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": user.role,
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"message": "Server error", "error": str(e)}
        )

@router.post("/logout")
async def logout(current_user = Depends(get_current_user)):
    """Logout user - matches Node.js authController.logout exactly"""
    try:
        # Log logout action (optional - for audit purposes)
        print(f"User {current_user.id} logged out at {datetime.utcnow().isoformat()}")
        
        return {
            "message": "Logged out successfully",
            "success": True,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"message": "Server error", "error": str(e)}
        )

@router.get("/profile")
async def get_profile(current_user = Depends(get_current_user)):
    """Get current user's profile - matches Node.js authController.getProfile exactly"""
    try:
        # Remove password from response exactly like Node.js
        user_dict = current_user.dict()
        user_dict.pop("password", None)
        user_dict["id"] = str(user_dict["id"])
        
        return {"user": user_dict}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"message": "Server error", "error": str(e)}
        )

@router.put("/profile")
async def update_profile(req_body: dict, current_user = Depends(get_current_user)):
    """Update current user's profile - matches Node.js authController.updateProfile exactly"""
    try:
        # Extract fields exactly like Node.js
        name = req_body.get("name")
        phone = req_body.get("phone")
        address = req_body.get("address")
        gender = req_body.get("gender")
        age = req_body.get("age")
        weight = req_body.get("weight")
        height = req_body.get("height")
        blood_group = req_body.get("bloodGroup")
        allergies = req_body.get("allergies")
        lifestyle = req_body.get("lifestyle")
        profile_picture = req_body.get("profilePicture")
        
        # Build update fields exactly like Node.js
        update_fields = {}
        if name: update_fields["name"] = name
        if phone: update_fields["phone"] = phone
        if address: update_fields["address"] = address
        if gender: update_fields["gender"] = gender
        if age is not None: update_fields["age"] = age
        if weight: update_fields["weight"] = weight
        if height: update_fields["height"] = height
        if blood_group: update_fields["blood_group"] = blood_group
        if allergies: update_fields["allergies"] = allergies
        if lifestyle: update_fields["lifestyle"] = lifestyle
        if profile_picture: update_fields["profile_picture"] = profile_picture
        
        # Update user
        if update_fields:
            await current_user.update({"$set": update_fields})
        
        # Get updated user and remove password
        updated_user = await User.find_one(User.id == current_user.id)
        user_dict = updated_user.dict()
        user_dict.pop("password", None)
        user_dict["id"] = str(user_dict["id"])
        
        return {"user": user_dict}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"message": "Server error", "error": str(e)}
        )

@router.post("/create-admin")
async def create_admin(req_body: dict, current_user = Depends(get_current_user)):
    """Create admin user - matches Node.js authController.createAdmin exactly"""
    try:
        # Check if current user is admin
        if current_user.role != "admin":
            raise HTTPException(
                status_code=403,
                detail={"message": "Access denied. Admin privileges required."}
            )
        
        name = req_body.get("name")
        email = req_body.get("email")
        password = req_body.get("password")
        phone = req_body.get("phone")
        
        if not name or not email or not password:
            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "message": "Name, email, and password are required"
                }
            )
        
        # Check if user already exists
        existing_user = await User.find_one(User.email == email)
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "message": "User with this email already exists"
                }
            )
        
        # Hash password
        hashed_password = get_password_hash(password)
        
        # Create admin user
        admin_user = User(
            name=name,
            email=email,
            password=hashed_password,
            phone=phone,
            role="admin"
        )
        await admin_user.insert()
        
        return {
            "success": True,
            "message": "Admin user created successfully",
            "data": {
                "id": str(admin_user.id),
                "name": admin_user.name,
                "email": admin_user.email,
                "role": admin_user.role,
                "phone": admin_user.phone
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "message": "Server error",
                "error": str(e)
            }
        )

# Doctor routes - exactly matching frontend expectations
@router.post("/doctor/register")
async def register_doctor(req_body: dict):
    """Register a new doctor - matches frontend expectations at /api/auth/doctor/register"""
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
        existing_doctor = await Doctor.find_one({"email": email})
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
        existing_license = await Doctor.find_one({"license_number": license_number})
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
            date_of_birth=dob,  # Store as string
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
            consultation_fee=float(consultation_fee),
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
        
        return {
            "message": "Doctor registered successfully",
            "token": token,
            "doctor": doctor_response
        }
        
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

@router.post("/doctor/login")
async def login_doctor(req_body: dict):
    """Login doctor - matches frontend expectations at /api/auth/doctor/login"""
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
        
        return {
            "message": "Login successful",
            "token": token,
            "doctor": doctor_response
        }
        
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

@router.get("/doctor/profile")
async def get_doctor_profile(current_user = Depends(get_current_user)):
    """Get doctor profile - matches frontend expectations at /api/auth/doctor/profile"""
    try:
        # Ensure this is a doctor
        if not hasattr(current_user, 'license_number'):
            raise HTTPException(
                status_code=403,
                detail={"message": "Access denied. Doctor privileges required."}
            )
        
        # Remove password from response exactly like Node.js
        doctor_dict = current_user.dict()
        doctor_dict.pop("password", None)
        doctor_dict["id"] = str(doctor_dict["id"])
        
        return {"doctor": doctor_dict}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"message": "Server error", "error": str(e)}
        )

@router.put("/doctor/profile")
async def update_doctor_profile(req_body: dict, current_user = Depends(get_current_user)):
    """Update doctor profile - matches frontend expectations at /api/auth/doctor/profile"""
    try:
        # Ensure this is a doctor
        if not hasattr(current_user, 'license_number'):
            raise HTTPException(
                status_code=403,
                detail={"message": "Access denied. Doctor privileges required."}
            )
        
        # Extract fields exactly like Node.js
        name = req_body.get("name")
        phone = req_body.get("phone")
        address = req_body.get("address")
        city = req_body.get("city")
        state = req_body.get("state")
        country = req_body.get("country")
        pincode = req_body.get("pincode")
        bio = req_body.get("bio")
        consultation_fee = req_body.get("consultationFee")
        hospital = req_body.get("hospital")
        specializations = req_body.get("specializations")
        qualifications = req_body.get("qualifications")
        experience = req_body.get("experience")
        profile_image = req_body.get("profileImage")
        
        # Build update fields exactly like Node.js
        update_fields = {}
        if name: update_fields["name"] = name
        if phone: update_fields["phone"] = phone
        if address: update_fields["address"] = address
        if city: update_fields["city"] = city
        if state: update_fields["state"] = state
        if country: update_fields["country"] = country
        if pincode: update_fields["pincode"] = pincode
        if bio: update_fields["bio"] = bio
        if consultation_fee: update_fields["consultation_fee"] = consultation_fee
        if hospital: update_fields["hospital"] = hospital
        if specializations: update_fields["specializations"] = specializations
        if qualifications: update_fields["qualifications"] = qualifications
        if experience: update_fields["experience"] = experience
        if profile_image: update_fields["profile_image"] = profile_image
        
        # Update doctor
        if update_fields:
            await current_user.update({"$set": update_fields})
        
        # Get updated doctor and remove password
        updated_doctor = await Doctor.find_one(Doctor.id == current_user.id)
        doctor_dict = updated_doctor.dict()
        doctor_dict.pop("password", None)
        doctor_dict["id"] = str(doctor_dict["id"])
        
        return {"doctor": doctor_dict}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"message": "Server error", "error": str(e)}
        )

# OAuth2 form-based login endpoint (for compatibility)
@router.post("/login-form", response_model=Token)
async def login_form(form_data: OAuth2PasswordRequestForm = Depends()):
    """OAuth2 form-based login for compatibility"""
    # Try to find user in both collections
    user = await User.find_one(User.email == form_data.username)
    if user is None:
        user = await Doctor.find_one(Doctor.email == form_data.username)
    
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}