#!/usr/bin/env python3
"""Fix doctor data by removing incomplete doctors and their appointments"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

async def fix_doctor_data():
    # Connect to MongoDB
    mongo_uri = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_uri)
    db = client.wecare
    
    print('🔍 Fixing doctor data and related appointments...')
    
    # Find doctors with no proper name
    invalid_doctors = await db.doctors.find({
        "$or": [
            {"full_name": {"$exists": False}},
            {"full_name": "NO NAME"},
            {"full_name": ""},
            {"full_name": None}
        ]
    }).to_list(length=None)
    
    print(f'Found {len(invalid_doctors)} invalid doctors:')
    invalid_doctor_ids = []
    
    for doctor in invalid_doctors:
        print(f'  - {doctor["_id"]}: {doctor.get("full_name", "NO NAME")} ({doctor.get("specialization", "NO SPECIALIZATION")})')
        invalid_doctor_ids.append(doctor["_id"])
    
    if not invalid_doctor_ids:
        print('✅ No invalid doctors found!')
        client.close()
        return
    
    # Find appointments linked to these invalid doctors
    invalid_appointments = await db.appointments.find({
        "doctor_id": {"$in": invalid_doctor_ids}
    }).to_list(length=None)
    
    print(f'\n📋 Found {len(invalid_appointments)} appointments linked to invalid doctors')
    
    # Delete appointments linked to invalid doctors
    if invalid_appointments:
        deleted_appointments = await db.appointments.delete_many({
            "doctor_id": {"$in": invalid_doctor_ids}
        })
        print(f'🗑️ Deleted {deleted_appointments.deleted_count} appointments')
    
    # Delete invalid doctors
    if invalid_doctor_ids:
        deleted_doctors = await db.doctors.delete_many({
            "_id": {"$in": invalid_doctor_ids}
        })
        print(f'🗑️ Deleted {deleted_doctors.deleted_count} invalid doctors')
    
    # Show remaining valid doctors
    remaining_doctors = await db.doctors.find({}).to_list(length=None)
    print(f'\n✅ {len(remaining_doctors)} valid doctors remaining:')
    for doctor in remaining_doctors:
        print(f'  - Dr. {doctor.get("full_name", "Unknown")} ({doctor.get("specialization", "General")})')
    
    # Show remaining appointments
    remaining_appointments = await db.appointments.find({}).to_list(length=None)
    print(f'\n📊 {len(remaining_appointments)} appointments remaining with valid doctors')
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_doctor_data())