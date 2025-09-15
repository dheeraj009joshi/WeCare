from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
from .core.config import settings
from .core.database import connect_to_mongo, close_mongo_connection
from .routes import auth, medicine, food_delivery, appointments, chat, emergency, admin, services, contact, doctors
from .middleware.logging import LoggingMiddleware
from .middleware.rate_limiting import RateLimitMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    logger.info("🚀 FastAPI WeCure server started successfully")
    yield
    # Shutdown
    await close_mongo_connection()
    logger.info("📡 Database connection closed")

app = FastAPI(
    title="WeCure API",
    description="Comprehensive healthcare platform API with medicine store, food delivery, doctor consultations, emergency services, and AI-powered health assistance",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware, calls=100, period=60)  # 100 requests per minute

# Include routers with proper prefixes and tags
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(doctors.router, prefix="/api/doctors", tags=["Doctors"])
app.include_router(medicine.router, prefix="/api/medicine-store", tags=["Medicine Store"])
app.include_router(food_delivery.router, prefix="/api/food-delivery", tags=["Food Delivery"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Appointments"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat & AI"])
app.include_router(emergency.router, prefix="/api/emergency", tags=["Emergency Services"])
app.include_router(admin.router, prefix="/api/admin", tags=["Administration"])
app.include_router(services.router, prefix="/api/services", tags=["Services"])
app.include_router(contact.router, prefix="/api/contact", tags=["Contact & Support"])

@app.get("/")
async def root():
    return {
        "message": "WeCure FastAPI Backend is running!",
        "version": "2.0.0",
        "status": "healthy",
        "features": [
            "User Authentication & Management",
            "Doctor Registration & Verification",
            "Appointment Booking System",
            "Medicine Store with Cart & Orders",
            "Food Delivery with Restaurant Management",
            "AI-Powered Health Chat Assistant",
            "Emergency Services & Ambulance Tracking",
            "Admin Dashboard & Analytics",
            "File Upload with Azure Storage",
            "Email Notifications",
            "Real-time Chat with WebSocket"
        ],
        "endpoints": {
            "docs": "/docs",
            "redoc": "/redoc",
            "health": "/api/health"
        }
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "WeCure FastAPI Backend is running!",
        "version": "2.0.0",
        "services": {
            "database": "MongoDB Atlas",
            "storage": "Azure Blob Storage",
            "ai": "Google Gemini",
            "email": "Gmail SMTP"
        }
    }

@app.get("/api/features")
async def get_features():
    """Get list of available features and their status"""
    return {
        "authentication": {
            "status": "active",
            "features": ["user_login", "doctor_login", "jwt_tokens", "password_reset"]
        },
        "healthcare": {
            "status": "active", 
            "features": ["doctor_booking", "appointments", "prescriptions", "medical_records"]
        },
        "commerce": {
            "status": "active",
            "features": ["medicine_store", "food_delivery", "cart_management", "order_tracking"]
        },
        "ai_services": {
            "status": "active",
            "features": ["health_chat", "symptom_analysis", "health_tips", "medical_guidance"]
        },
        "emergency": {
            "status": "active",
            "features": ["ambulance_booking", "emergency_contacts", "real_time_tracking"]
        },
        "admin": {
            "status": "active",
            "features": ["user_management", "doctor_verification", "order_management", "analytics"]
        }
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": "Something went wrong on our end. Please try again later."
        }
    )

# Custom 404 handler - DISABLED to allow proper route resolution
# @app.exception_handler(404)
# async def not_found_handler(request, exc):
#     return JSONResponse(
#         status_code=404,
#         content={
#             "detail": "Not found",
#             "message": f"The requested endpoint {request.url.path} was not found.",
#             "available_endpoints": [
#                 "/api/auth",
#                 "/api/medicine-store", 
#                 "/api/food-delivery",
#                 "/api/appointments",
#                 "/api/chat",
#                 "/api/emergency",
#                 "/api/admin",
#                 "/api/services",
#                 "/api/contact"
#             ]
#         }
#     )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )