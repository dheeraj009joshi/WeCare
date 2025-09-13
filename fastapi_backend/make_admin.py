import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

async def make_admin():
    client = AsyncIOMotorClient("mongodb+srv://dlovej009:Dheeraj2006@cluster0.dnu8vna.mongodb.net/wecare")
    db = client.wecare
    
    # Update the user to be admin
    result = await db.users.update_one(
        {"_id": ObjectId("68c24e43d49ff566476951f2")},
        {"$set": {"is_admin": True}}
    )
    
    print(f"Updated {result.modified_count} user(s) to admin")
    client.close()

asyncio.run(make_admin())
