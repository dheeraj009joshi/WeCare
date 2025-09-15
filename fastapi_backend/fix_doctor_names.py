#!/usr/bin/env python3
"""Fix doctor names by removing duplicate 'Dr.' prefix"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

async def fix_doctor_names():
    # Connect to MongoDB
    mongo_uri = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_uri)
    db = client.wecare
    
    print('🔍 Fixing doctor names...')
    
    # Get all doctors
    doctors = await db.doctors.find({}).to_list(length=None)
    
    for doctor in doctors:
        current_name = doctor.get("full_name", "")
        print(f'Doctor {doctor["_id"]}: "{current_name}"')
        
        # Remove duplicate "Dr." prefix
        if current_name.startswith("Dr. Dr."):
            new_name = current_name.replace("Dr. Dr.", "Dr.", 1)
            print(f'  Updating to: "{new_name}"')
            
            await db.doctors.update_one(
                {"_id": doctor["_id"]},
                {"$set": {"full_name": new_name}}
            )
        else:
            print('  ✅ Name is correct')
    
    # Show updated doctors
    print('\n✅ Updated doctors:')
    updated_doctors = await db.doctors.find({}).to_list(length=None)
    for doctor in updated_doctors:
        print(f'  - {doctor.get("full_name", "Unknown")} ({doctor.get("specialization", "General")})')
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_doctor_names())