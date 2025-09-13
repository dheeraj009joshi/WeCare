import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

async def verify_doctor():
    client = AsyncIOMotorClient("mongodb+srv://dlovej009:Dheeraj2006@cluster0.dnu8vna.mongodb.net/wecare")
    db = client.wecare
    
    # Update the doctor to be verified
    result = await db.doctors.update_one(
        {"_id": ObjectId("68c24e68d49ff566476951f3")},
        {"$set": {"is_verified": True}}
    )
    
    print(f"Updated {result.modified_count} doctor(s)")
    
    # Also add doctor availability
    availability_data = {
        "doctor_id": ObjectId("68c24e68d49ff566476951f3"),
        "day_of_week": 0,  # Monday
        "start_time": "09:00",
        "end_time": "17:00",
        "is_available": True,
        "max_appointments": 10
    }
    
    await db.doctor_availability.insert_one(availability_data)
    print("Added doctor availability")
    
    # Also add for Tuesday (day 1)
    availability_data["day_of_week"] = 1
    await db.doctor_availability.insert_one(availability_data)
    print("Added Tuesday availability")
    
    client.close()

asyncio.run(verify_doctor())
