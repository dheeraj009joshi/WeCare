from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from models.user import User, UserCreate, UserResponse, UserLogin
from models.doctor import Doctor, DoctorCreate, DoctorResponse, DoctorLogin
from config import settings

router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# JWT token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

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
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
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
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except jwt.PyJWTError:
        raise credentials_exception
    
    # Try to find user in both User and Doctor collections
    user = await User.find_one(User.email == token_data.email)
    if user is None:
        user = await Doctor.find_one(Doctor.email == token_data.email)
    
    if user is None:
        raise credentials_exception
    return user

# Routes
@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    # Check if user already exists
    existing_user = await User.find_one(User.email == user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict["password"] = hashed_password
    user_dict.pop("password", None)  # Remove password from response
    
    new_user = User(**user_dict)
    await new_user.insert()
    
    return UserResponse(**new_user.dict())

@router.post("/register-doctor", response_model=DoctorResponse)
async def register_doctor(doctor: DoctorCreate):
    # Check if doctor already exists
    existing_doctor = await Doctor.find_one(Doctor.email == doctor.email)
    if existing_doctor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create doctor
    hashed_password = get_password_hash(doctor.password)
    doctor_dict = doctor.dict()
    doctor_dict["password"] = hashed_password
    doctor_dict.pop("password", None)  # Remove password from response
    
    new_doctor = Doctor(**doctor_dict)
    await new_doctor.insert()
    
    return DoctorResponse(**new_doctor.dict())

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
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

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
