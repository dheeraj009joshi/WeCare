#!/usr/bin/env python3
"""
Script to verify doctors and set up their default availability
This fixes the "Doctor not found" issue in the workflow
"""

import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime

# Add the app directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

async def setup_doctors():
    """Set up existing doctors with verification and default availability"""
    print("🏥 Setting up doctors for WeCure platform...")
    
    # Connect to database
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    
    try:
        # 1. Find all unverified doctors
        doctors_cursor = db.doctors.find({"is_verified": {"$ne": True}})
        unverified_doctors = await doctors_cursor.to_list(None)
        
        print(f"📋 Found {len(unverified_doctors)} unverified doctors")
        
        # 2. Verify all doctors and activate them
        for doctor in unverified_doctors:
            doctor_id = doctor['_id']
            
            # Update doctor to be verified and active
            await db.doctors.update_one(
                {"_id": doctor_id},
                {"$set": {
                    "is_verified": True,
                    "is_active": True,
                    "verified_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }}
            )
            
            print(f"✅ Verified doctor: {doctor.get('name', 'Unknown')} (ID: {doctor_id})")
            
            # 3. Set up default availability (Monday to Friday, 9 AM to 5 PM)
            default_availability = {
                'monday': {
                    'is_available': True,
                    'start_time': '09:00',
                    'end_time': '17:00'
                },
                'tuesday': {
                    'is_available': True,
                    'start_time': '09:00',
                    'end_time': '17:00'
                },
                'wednesday': {
                    'is_available': True,
                    'start_time': '09:00',
                    'end_time': '17:00'
                },
                'thursday': {
                    'is_available': True,
                    'start_time': '09:00',
                    'end_time': '17:00'
                },
                'friday': {
                    'is_available': True,
                    'start_time': '09:00',
                    'end_time': '17:00'
                },
                'saturday': {
                    'is_available': False,
                    'start_time': '09:00',
                    'end_time': '17:00'
                },
                'sunday': {
                    'is_available': False,
                    'start_time': '09:00',
                    'end_time': '17:00'
                }
            }
            
            # Update doctor with availability
            await db.doctors.update_one(
                {"_id": doctor_id},
                {"$set": {
                    "availability": default_availability
                }}
            )
            
            print(f"📅 Set default availability for: {doctor.get('name', 'Unknown')}")
        
        # 4. Display summary of all verified doctors
        verified_doctors = await db.doctors.find({"is_verified": True}).to_list(None)
        
        print(f"\n🎉 Setup Complete!")
        print(f"📊 Total verified doctors: {len(verified_doctors)}")
        print(f"📋 Doctors ready for appointments:")
        
        for doctor in verified_doctors:
            print(f"   • {doctor.get('name', 'Unknown')} - ID: {doctor['_id']}")
            print(f"     Email: {doctor.get('email', 'N/A')}")
            print(f"     Specialization: {doctor.get('specialization', 'N/A')}")
            print(f"     Available: Monday-Friday 9:00 AM - 5:00 PM")
            print("")
            
        if verified_doctors:
            first_doctor = verified_doctors[0]
            print(f"🧪 For testing, use Doctor ID: {first_doctor['_id']}")
            print(f"📧 Doctor Email: {first_doctor.get('email', 'N/A')}")
            print(f"🔗 Test URL: http://localhost:4000/api/appointments/doctor/{first_doctor['_id']}/available-slots?date=2025-09-15")
        
    except Exception as e:
        print(f"❌ Error setting up doctors: {e}")
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(setup_doctors())