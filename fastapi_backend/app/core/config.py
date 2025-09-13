from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # MongoDB Configuration
    mongodb_url: str
    database_name: str
    
    # Azure Storage Configuration
    azure_storage_connection_string: str
    container_name: str
    
    # JWT Configuration
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Email Configuration
    email_user: str
    email_password: str
    
    # AI Configuration
    gemini_api_key: str
    gemini_api_key_1: str
    gemini_api_key_2: str
    
    # Application Configuration
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()