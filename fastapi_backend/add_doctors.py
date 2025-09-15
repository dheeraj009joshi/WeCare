#!/usr/bin/env python3
"""
Script to add real doctors to the database and update existing ones with proper specializations
"""
import asyncio
import sys
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.security import get_password_hash

async def update_existing_doctors():
    """Update existing doctors with proper specializations"""
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    
    try:
        # Update Dr. Jane Smith
        await db.doctors.update_one(
            {"email": "doctor@example.com"},
            {"$set": {
                "specialization": "General Medicine",
                "qualification": ["MBBS", "MD General Medicine"],
                "bio": "Experienced general practitioner with 10+ years in family medicine and preventive care",
                "updated_at": datetime.utcnow()
            }}
        )
        
        # Update Dr. Sarah Wilson  
        await db.doctors.update_one(
            {"email": "dr.sarah2@example.com"},
            {"$set": {
                "specialization": "Dermatology",
                "qualification": ["MBBS", "MD Dermatology", "Fellowship in Cosmetic Dermatology"],
                "bio": "Specialist in dermatology with expertise in skin conditions, cosmetic procedures, and dermatological surgery",
                "updated_at": datetime.utcnow()
            }}
        )
        
        print("✅ Updated existing doctors with specializations")
        
    except Exception as e:
        print(f"❌ Error updating existing doctors: {e}")
    finally:
        client.close()

async def add_new_doctors():
    """Add new doctors with diverse specializations"""
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    
    new_doctors = [
        {
            "full_name": "Dr. Rajesh Kumar",
            "email": "dr.rajesh@wecure.com", 
            "phone": "+91-9876543210",
            "specialization": "Cardiology",
            "experience_years": 15,
            "license_number": "CARD2024001",
            "clinic_address": "Heart Care Center, Mumbai, Maharashtra",
            "consultation_fee": 800.0,
            "qualification": ["MBBS", "MD Cardiology", "Fellowship in Interventional Cardiology"],
            "bio": "Leading cardiologist specializing in heart disease prevention, diagnosis and treatment. Expert in interventional procedures.",
            "availability": {
                "monday": {"is_available": True, "start_time": "09:00", "end_time": "17:00"},
                "tuesday": {"is_available": True, "start_time": "09:00", "end_time": "17:00"},
                "wednesday": {"is_available": True, "start_time": "09:00", "end_time": "17:00"},
                "thursday": {"is_available": True, "start_time": "09:00", "end_time": "17:00"},
                "friday": {"is_available": True, "start_time": "09:00", "end_time": "17:00"},
                "saturday": {"is_available": True, "start_time": "09:00", "end_time": "13:00"},
                "sunday": {"is_available": False}
            },
            "hashed_password": get_password_hash("doctor123"),
            "is_verified": True,
            "is_active": True,
            "is_google_user": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "full_name": "Dr. Priya Sharma",
            "email": "dr.priya@wecure.com",
            "phone": "+91-9876543211", 
            "specialization": "Pediatrics",
            "experience_years": 12,
            "license_number": "PED2024002",
            "clinic_address": "Child Care Clinic, Delhi, India",
            "consultation_fee": 600.0,
            "qualification": ["MBBS", "MD Pediatrics", "Fellowship in Neonatology"],
            "bio": "Dedicated pediatrician with extensive experience in child healthcare, vaccinations, and developmental disorders.",
            "availability": {
                "monday": {"is_available": True, "start_time": "10:00", "end_time": "18:00"},
                "tuesday": {"is_available": True, "start_time": "10:00", "end_time": "18:00"},
                "wednesday": {"is_available": True, "start_time": "10:00", "end_time": "18:00"},
                "thursday": {"is_available": True, "start_time": "10:00", "end_time": "18:00"},
                "friday": {"is_available": True, "start_time": "10:00", "end_time": "18:00"},
                "saturday": {"is_available": True, "start_time": "10:00", "end_time": "14:00"},
                "sunday": {"is_available": False}
            },
            "hashed_password": get_password_hash("doctor123"),
            "is_verified": True,
            "is_active": True,
            "is_google_user": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "full_name": "Dr. Anil Gupta",
            "email": "dr.anil@wecure.com",
            "phone": "+91-9876543212",
            "specialization": "Orthopedics", 
            "experience_years": 18,
            "license_number": "ORTHO2024003",
            "clinic_address": "Bone & Joint Hospital, Bangalore, Karnataka",
            "consultation_fee": 700.0,
            "qualification": ["MBBS", "MS Orthopedics", "Fellowship in Joint Replacement"],
            "bio": "Senior orthopedic surgeon specializing in joint replacement, sports injuries, and fracture management.",
            "availability": {
                "monday": {"is_available": True, "start_time": "08:00", "end_time": "16:00"},
                "tuesday": {"is_available": True, "start_time": "08:00", "end_time": "16:00"},
                "wednesday": {"is_available": True, "start_time": "08:00", "end_time": "16:00"},
                "thursday": {"is_available": True, "start_time": "08:00", "end_time": "16:00"},
                "friday": {"is_available": True, "start_time": "08:00", "end_time": "16:00"},
                "saturday": {"is_available": True, "start_time": "08:00", "end_time": "12:00"},
                "sunday": {"is_available": False}
            },
            "hashed_password": get_password_hash("doctor123"),
            "is_verified": True,
            "is_active": True,
            "is_google_user": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "full_name": "Dr. Meera Reddy",
            "email": "dr.meera@wecure.com",
            "phone": "+91-9876543213",
            "specialization": "Gynecology",
            "experience_years": 14,
            "license_number": "GYNO2024004", 
            "clinic_address": "Women's Health Center, Hyderabad, Telangana",
            "consultation_fee": 650.0,
            "qualification": ["MBBS", "MD Obstetrics & Gynecology", "Fellowship in Laparoscopic Surgery"],
            "bio": "Experienced gynecologist providing comprehensive women's healthcare including pregnancy care and minimally invasive surgeries.",
            "availability": {
                "monday": {"is_available": True, "start_time": "09:00", "end_time": "17:00"},
                "tuesday": {"is_available": True, "start_time": "09:00", "end_time": "17:00"},
                "wednesday": {"is_available": True, "start_time": "09:00", "end_time": "17:00"},
                "thursday": {"is_available": True, "start_time": "09:00", "end_time": "17:00"},
                "friday": {"is_available": True, "start_time": "09:00", "end_time": "17:00"},
                "saturday": {"is_available": True, "start_time": "09:00", "end_time": "13:00"},
                "sunday": {"is_available": False}
            },
            "hashed_password": get_password_hash("doctor123"),
            "is_verified": True,
            "is_active": True,
            "is_google_user": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "full_name": "Dr. Vikram Singh",
            "email": "dr.vikram@wecure.com",
            "phone": "+91-9876543214",
            "specialization": "Neurology",
            "experience_years": 20,
            "license_number": "NEURO2024005",
            "clinic_address": "Brain & Spine Institute, Chennai, Tamil Nadu", 
            "consultation_fee": 900.0,
            "qualification": ["MBBS", "MD Neurology", "Fellowship in Stroke Medicine"],
            "bio": "Senior neurologist with expertise in stroke management, epilepsy, and neurodegenerative disorders.",
            "availability": {
                "monday": {"is_available": True, "start_time": "10:00", "end_time": "18:00"},
                "tuesday": {"is_available": True, "start_time": "10:00", "end_time": "18:00"},
                "wednesday": {"is_available": False},
                "thursday": {"is_available": True, "start_time": "10:00", "end_time": "18:00"},
                "friday": {"is_available": True, "start_time": "10:00", "end_time": "18:00"},
                "saturday": {"is_available": True, "start_time": "10:00", "end_time": "14:00"},
                "sunday": {"is_available": False}
            },
            "hashed_password": get_password_hash("doctor123"),
            "is_verified": True,
            "is_active": True,
            "is_google_user": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    try:
        # Check if doctors already exist
        existing_doctors = []
        for doctor in new_doctors:
            existing = await db.doctors.find_one({"email": doctor["email"]})
            if existing:
                existing_doctors.append(doctor["email"])
        
        if existing_doctors:
            print(f"⚠️  Skipping existing doctors: {', '.join(existing_doctors)}")
            new_doctors = [d for d in new_doctors if d["email"] not in existing_doctors]
        
        if new_doctors:
            result = await db.doctors.insert_many(new_doctors)
            print(f"✅ Added {len(result.inserted_ids)} new doctors to the database")
            
            for doctor in new_doctors:
                print(f"   - {doctor['full_name']} ({doctor['specialization']})")
        else:
            print("ℹ️  All doctors already exist in the database")
            
    except Exception as e:
        print(f"❌ Error adding doctors: {e}")
    finally:
        client.close()

async def main():
    print("🏥 Adding real doctors to WeCure database...")
    print("=" * 50)
    
    await update_existing_doctors()
    await add_new_doctors()
    
    print("\n✅ Doctor setup completed!")
    print("\nAll doctors have login credentials:")
    print("   Email: [doctor email]")
    print("   Password: doctor123")

if __name__ == "__main__":
    asyncio.run(main())