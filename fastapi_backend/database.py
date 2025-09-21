from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

from models.user import User
from models.doctor import Doctor
from models.appointment import Appointment
from models.product import Product
from models.order import Order, OrderItem
from models.cart import Cart
from models.service import Service
from models.address import Address
from models.message import Message, ChatSession
from models.doctor_availability import DoctorAvailability
from models.doctor_message import DoctorMessage
from models.ambulance import Ambulance
from models.contact import Contact
from models.escalation import Escalation
from models.file_upload import FileUpload
from models.footer_content import FooterContent
from models.newsletter import Newsletter
from models.food_cart import FoodCart
from models.food_category import FoodCategory
from models.food_order import FoodOrder, FoodOrderItem
from models.menu_item import MenuItem
from models.restaurant import Restaurant

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "wecure_db")

# List of all document models
document_models = [
    User,
    Doctor,
    Appointment,
    Product,
    Order,
    OrderItem,
    Cart,
    Service,
    Address,
    Message,
    ChatSession,
    DoctorAvailability,
    DoctorMessage,
    Ambulance,
    Contact,
    Escalation,
    FileUpload,
    FooterContent,
    Newsletter,
    FoodCart,
    FoodCategory,
    FoodOrder,
    FoodOrderItem,
    MenuItem,
    Restaurant,
]

async def init_db():
    """Initialize database connection and create indexes"""
    # Create motor client
    client = AsyncIOMotorClient(MONGODB_URL)
    
    # Initialize beanie with the client and database
    await init_beanie(
        database=client[DATABASE_NAME],
        document_models=document_models
    )
    
    print(f"Connected to MongoDB database: {DATABASE_NAME}")

async def get_database():
    """Get database instance"""
    client = AsyncIOMotorClient(MONGODB_URL)
    return client[DATABASE_NAME]
