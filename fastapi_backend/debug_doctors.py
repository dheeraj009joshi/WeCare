#!/usr/bin/env python3
"""Debug doctor data and appointment doctor relationships"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

async def debug_doctors_and_appointments():
    # Connect to MongoDB
    mongo_uri = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_uri)
    db = client.wecare
    
    print('🔍 Debugging doctors and appointments...')
    
    # Get all doctors
    doctors = await db.doctors.find({}).to_list(length=None)
    print(f'📊 Found {len(doctors)} doctors:')
    for doctor in doctors:
        print(f'  - {doctor["_id"]}: {doctor.get("full_name", "NO NAME")} ({doctor.get("specialization", "NO SPECIALIZATION")})')
    
    print('\n' + '='*50 + '\n')
    
    # Get sample appointments and check doctor lookups
    appointments = await db.appointments.find({}).limit(5).to_list(length=None)
    print(f'🔍 Checking doctor lookups for {len(appointments)} sample appointments:')
    
    for appointment in appointments:
        doctor_id = appointment.get('doctor_id')
        print(f'\nAppointment {appointment["_id"]}:')
        print(f'  doctor_id: {doctor_id} (type: {type(doctor_id)})')
        
        # Try to find the doctor
        doctor = await db.doctors.find_one({"_id": doctor_id})
        if doctor:
            print(f'  ✅ Doctor found: {doctor.get("full_name", "NO NAME")}')
        else:
            print(f'  ❌ Doctor NOT found')
            
            # Try to find doctor with string conversion
            if isinstance(doctor_id, ObjectId):
                doctor_str = await db.doctors.find_one({"_id": str(doctor_id)})
                print(f'  String lookup result: {"Found" if doctor_str else "Not found"}')
            elif isinstance(doctor_id, str):
                try:
                    doctor_obj = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
                    print(f'  ObjectId lookup result: {"Found" if doctor_obj else "Not found"}')
                except Exception as e:
                    print(f'  ObjectId conversion failed: {e}')
    
    client.close()

if __name__ == "__main__":
    asyncio.run(debug_doctors_and_appointments())