#!/usr/bin/env python3
"""Clean up invalid appointments with non-existent doctor IDs"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

async def cleanup_invalid_appointments():
    # Connect to MongoDB
    mongo_uri = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_uri)
    db = client.wecare
    
    print('🔍 Checking for invalid appointments...')
    
    # Get all appointments
    appointments = await db.appointments.find({}).to_list(length=None)
    print(f'Found {len(appointments)} total appointments')
    
    invalid_count = 0
    
    for appointment in appointments:
        doctor_id = appointment.get('doctor_id')
        
        # Check if doctor exists
        doctor = await db.doctors.find_one({"_id": doctor_id})
        
        if not doctor:
            print(f'❌ Invalid appointment {appointment["_id"]}: doctor {doctor_id} not found')
            # Delete the invalid appointment
            await db.appointments.delete_one({"_id": appointment["_id"]})
            invalid_count += 1
        else:
            print(f'✅ Valid appointment {appointment["_id"]}: doctor {doctor.get("full_name", "Unknown")}')
    
    print(f'🧹 Cleaned up {invalid_count} invalid appointments')
    
    # List remaining appointments with doctor info
    remaining = await db.appointments.find({}).to_list(length=None)
    print(f'📊 {len(remaining)} appointments remaining:')
    
    for appointment in remaining:
        doctor = await db.doctors.find_one({"_id": appointment["doctor_id"]})
        if doctor:
            print(f'  - {appointment["_id"]}: Dr. {doctor.get("full_name", "Unknown")} - {appointment.get("status", "unknown")}')
    
    client.close()

if __name__ == "__main__":
    asyncio.run(cleanup_invalid_appointments())