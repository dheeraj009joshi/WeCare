from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
from datetime import timedelta, datetime
from ..core.database import get_database
from ..core.security import create_access_token, get_password_hash, create_token_pair, verify_refresh_token
from ..models.user import UserCreate, User
from ..models.doctor import DoctorCreate, Doctor
from ..utils.auth import authenticate_user, authenticate_doctor
from ..core.config import settings
from ..services.google_oauth_service import google_oauth_service
from bson import ObjectId
import logging
import secrets
import urllib.parse

logger = logging.getLogger(__name__)
router = APIRouter()

class Token(BaseModel):
    access_token: str
    token_type: str
    user_type: str
    refresh_token: str = None
    expires_in: int = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserResponse(BaseModel):
    user: User
    token: Token

class DoctorResponse(BaseModel):
    doctor: Doctor
    token: Token

class GoogleAuthRequest(BaseModel):
    user_type: str  # "user" or "doctor"

class GoogleUserInfo(BaseModel):
    email: str
    name: str
    given_name: str
    family_name: str
    picture: str
    verified_email: bool

@router.post("/register", response_model=UserResponse)
async def register_user(
    user_data: UserCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.dict()
    user_dict.pop("password")
    user_dict["hashed_password"] = hashed_password
    user_dict["medical_history"] = []
    user_dict["is_google_user"] = False
    user_dict["created_at"] = datetime.utcnow()
    user_dict["updated_at"] = datetime.utcnow()
    
    # Insert user into database
    result = await db.users.insert_one(user_dict)
    
    # Get created user and add the timestamp fields we just inserted
    created_user = await db.users.find_one({"_id": result.inserted_id})
    # Ensure the timestamps are included for the Pydantic model
    created_user["created_at"] = user_dict["created_at"]
    created_user["updated_at"] = user_dict["updated_at"]
    user = User(**created_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        subject=str(user.id), expires_delta=access_token_expires
    )
    
    token = Token(
        access_token=access_token,
        token_type="bearer",
        user_type="user"
    )
    
    return UserResponse(user=user, token=token)

@router.post("/login", response_model=UserResponse)
async def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user = await authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        subject=str(user.id), expires_delta=access_token_expires
    )
    
    # Convert to User model (without hashed_password)
    user_dict = user.dict()
    user_dict.pop("hashed_password")
    user_response = User(**user_dict)
    
    token = Token(
        access_token=access_token,
        token_type="bearer",
        user_type="user"
    )
    
    return UserResponse(user=user_response, token=token)

@router.post("/doctor/register", response_model=DoctorResponse)
async def register_doctor(
    doctor_data: DoctorCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Check if doctor already exists
    existing_doctor = await db.doctors.find_one({"email": doctor_data.email})
    if existing_doctor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if license number already exists
    existing_license = await db.doctors.find_one({"license_number": doctor_data.license_number})
    if existing_license:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="License number already registered"
        )
    
    # Hash password and create doctor
    hashed_password = get_password_hash(doctor_data.password)
    doctor_dict = doctor_data.dict()
    doctor_dict.pop("password")
    doctor_dict["hashed_password"] = hashed_password
    doctor_dict["availability"] = {}
    doctor_dict["is_google_user"] = False
    doctor_dict["created_at"] = datetime.utcnow()
    doctor_dict["updated_at"] = datetime.utcnow()
    
    # Insert doctor into database
    result = await db.doctors.insert_one(doctor_dict)
    
    # Get created doctor and add the timestamp fields we just inserted
    created_doctor = await db.doctors.find_one({"_id": result.inserted_id})
    # Ensure the timestamps are included for the Pydantic model
    created_doctor["created_at"] = doctor_dict["created_at"]
    created_doctor["updated_at"] = doctor_dict["updated_at"]
    doctor = Doctor(**created_doctor)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        subject=str(doctor.id), expires_delta=access_token_expires
    )
    
    token = Token(
        access_token=access_token,
        token_type="bearer",
        user_type="doctor"
    )
    
    return DoctorResponse(doctor=doctor, token=token)

@router.post("/doctor/login", response_model=DoctorResponse)
async def login_doctor(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    doctor = await authenticate_doctor(form_data.username, form_data.password, db)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        subject=str(doctor.id), expires_delta=access_token_expires
    )
    
    # Convert to Doctor model (without hashed_password)
    doctor_dict = doctor.dict()
    doctor_dict.pop("hashed_password")
    doctor_response = Doctor(**doctor_dict)
    
    token = Token(
        access_token=access_token,
        token_type="bearer",
        user_type="doctor"
    )
    
    return DoctorResponse(doctor=doctor_response, token=token)

# Google OAuth endpoints
@router.get("/google/login")
async def google_login(
    user_type: str = "user",
    request: Request = None
):
    """Initiate Google OAuth login for users or doctors"""
    if not google_oauth_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured. Please set up Google Calendar credentials."
        )
    
    if user_type not in ["user", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_type must be 'user' or 'doctor'"
        )
    
    # Generate state parameter for security
    state = f"{user_type}_{secrets.token_urlsafe(32)}"
    
    # Get redirect URI from request
    redirect_uri = f"{request.base_url}auth/google/callback"
    
    # Get authorization URL
    auth_url = google_oauth_service.get_authorization_url(
        redirect_uri=str(redirect_uri),
        state=state
    )
    
    if not auth_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate Google authorization URL"
        )
    
    return {"auth_url": auth_url, "state": state}

@router.get("/google/callback")
async def google_callback(
    code: str,
    state: str,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Handle Google OAuth callback"""
    if not google_oauth_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured"
        )
    
    # Extract user_type from state
    try:
        user_type = state.split('_')[0]
        if user_type not in ["user", "doctor"]:
            raise ValueError("Invalid user type")
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid state parameter"
        )
    
    # Exchange code for tokens
    redirect_uri = str(request.base_url) + "auth/google/callback"
    token_data = await google_oauth_service.exchange_code_for_tokens(code, redirect_uri)
    
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to exchange code for tokens"
        )
    
    user_info = token_data['user_info']
    
    # Handle user registration/login
    if user_type == "user":
        return await _handle_google_user_auth(user_info, db)
    else:
        return await _handle_google_doctor_auth(user_info, db)

async def _handle_google_user_auth(user_info: dict, db: AsyncIOMotorDatabase):
    """Handle Google authentication for users"""
    email = user_info.get('email')
    name = user_info.get('name', '')
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email})
    
    if existing_user:
        # User exists, log them in
        user = User(**existing_user)
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            subject=str(user.id), expires_delta=access_token_expires
        )
        
        token = Token(
            access_token=access_token,
            token_type="bearer",
            user_type="user"
        )
        
        return UserResponse(user=user, token=token)
    
    else:
        # Create new user
        user_dict = {
            "email": email,
            "full_name": name,
            "phone": "",  # Will need to be updated by user later
            "date_of_birth": None,
            "gender": None,
            "address": "",
            "emergency_contact": "",
            "medical_history": [],
            "google_id": user_info.get('id'),
            "profile_picture": user_info.get('picture'),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_google_user": True
        }
        
        # Insert user into database
        result = await db.users.insert_one(user_dict)
        
        # Get created user
        created_user = await db.users.find_one({"_id": result.inserted_id})
        user = User(**created_user)
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            subject=str(user.id), expires_delta=access_token_expires
        )
        
        token = Token(
            access_token=access_token,
            token_type="bearer",
            user_type="user"
        )
        
        return UserResponse(user=user, token=token)

async def _handle_google_doctor_auth(user_info: dict, db: AsyncIOMotorDatabase):
    """Handle Google authentication for doctors"""
    email = user_info.get('email')
    name = user_info.get('name', '')
    
    # Check if doctor exists
    existing_doctor = await db.doctors.find_one({"email": email})
    
    if existing_doctor:
        # Doctor exists, log them in
        doctor = Doctor(**existing_doctor)
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            subject=str(doctor.id), expires_delta=access_token_expires
        )
        
        token = Token(
            access_token=access_token,
            token_type="bearer",
            user_type="doctor"
        )
        
        return DoctorResponse(doctor=doctor, token=token)
    
    else:
        # For doctors, we require additional verification
        # Create a pending doctor account that needs to be verified
        doctor_dict = {
            "email": email,
            "full_name": name,
            "specialization": "",  # Will need to be updated
            "experience_years": 0,
            "license_number": "",  # Will need to be provided
            "phone": "",
            "clinic_address": "",
            "consultation_fee": 0.0,
            "qualification": [],
            "bio": "",
            "availability": {},
            "google_id": user_info.get('id'),
            "profile_picture": user_info.get('picture'),
            "is_verified": False,  # Requires manual verification
            "is_google_user": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert doctor into database
        result = await db.doctors.insert_one(doctor_dict)
        
        # Get created doctor
        created_doctor = await db.doctors.find_one({"_id": result.inserted_id})
        doctor = Doctor(**created_doctor)
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            subject=str(doctor.id), expires_delta=access_token_expires
        )
        
        token = Token(
            access_token=access_token,
            token_type="bearer",
            user_type="doctor"
        )
        
        return DoctorResponse(doctor=doctor, token=token)

@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_request: RefreshTokenRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Refresh access token using refresh token"""
    user_id = verify_refresh_token(refresh_request.refresh_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user or doctor exists
    user_data = await db.users.find_one({"_id": ObjectId(user_id)})
    doctor_data = await db.doctors.find_one({"_id": ObjectId(user_id)})
    
    if not user_data and not doctor_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create new access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        subject=user_id, expires_delta=access_token_expires
    )
    
    # Determine user type
    user_type = "doctor" if doctor_data else "user"
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_type=user_type,
        expires_in=settings.access_token_expire_minutes * 60
    )
