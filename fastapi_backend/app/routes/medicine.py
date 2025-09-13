from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from ..core.database import get_database
from ..models.medicine import Medicine, MedicineCreate, MedicineUpdate, Cart, CartItemBase
from ..models.user import UserInDB
from ..utils.auth import get_current_active_user, get_current_admin_user
from ..services.azure_storage import azure_storage
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[Medicine])
async def get_medicines(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get list of medicines with optional filtering"""
    query = {"is_active": True}
    
    if category:
        query["category"] = category
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"brand": {"$regex": search, "$options": "i"}}
        ]
    
    cursor = db.medicines.find(query).skip(skip).limit(limit)
    medicines = []
    async for medicine in cursor:
        # Handle missing timestamp fields for backward compatibility
        if "created_at" not in medicine:
            medicine["created_at"] = datetime.utcnow()
        if "updated_at" not in medicine:
            medicine["updated_at"] = datetime.utcnow()
        medicines.append(Medicine(**medicine))
    
    return medicines

@router.get("/{medicine_id}", response_model=Medicine)
async def get_medicine(
    medicine_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific medicine by ID"""
    if not ObjectId.is_valid(medicine_id):
        raise HTTPException(status_code=400, detail="Invalid medicine ID")
    
    medicine = await db.medicines.find_one({"_id": ObjectId(medicine_id)})
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    return Medicine(**medicine)

@router.post("/", response_model=Medicine)
async def create_medicine(
    medicine_data: MedicineCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Create a new medicine (Admin only)"""
    medicine_dict = medicine_data.dict()
    medicine_dict["created_at"] = datetime.utcnow()
    medicine_dict["updated_at"] = datetime.utcnow()
    
    result = await db.medicines.insert_one(medicine_dict)
    created_medicine = await db.medicines.find_one({"_id": result.inserted_id})
    # Ensure the timestamps are included for the Pydantic model
    created_medicine["created_at"] = medicine_dict["created_at"]
    created_medicine["updated_at"] = medicine_dict["updated_at"]
    
    return Medicine(**created_medicine)

@router.put("/{medicine_id}", response_model=Medicine)
async def update_medicine(
    medicine_id: str,
    medicine_data: MedicineUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Update a medicine (Admin only)"""
    if not ObjectId.is_valid(medicine_id):
        raise HTTPException(status_code=400, detail="Invalid medicine ID")
    
    update_data = {k: v for k, v in medicine_data.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.medicines.update_one(
        {"_id": ObjectId(medicine_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    updated_medicine = await db.medicines.find_one({"_id": ObjectId(medicine_id)})
    return Medicine(**updated_medicine)

@router.delete("/{medicine_id}")
async def delete_medicine(
    medicine_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Delete a medicine (Admin only)"""
    if not ObjectId.is_valid(medicine_id):
        raise HTTPException(status_code=400, detail="Invalid medicine ID")
    
    result = await db.medicines.update_one(
        {"_id": ObjectId(medicine_id)},
        {"$set": {"is_active": False}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    return {"message": "Medicine deleted successfully"}

@router.post("/upload-image/{medicine_id}")
async def upload_medicine_image(
    medicine_id: str,
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Upload medicine image"""
    if not ObjectId.is_valid(medicine_id):
        raise HTTPException(status_code=400, detail="Invalid medicine ID")
    
    # Check if medicine exists
    medicine = await db.medicines.find_one({"_id": ObjectId(medicine_id)})
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Upload to Azure Storage
        file_content = await file.read()
        image_url = await azure_storage.upload_file(
            file_content=file_content,
            file_name=file.filename,
            content_type=file.content_type,
            folder="medicines"
        )
        
        # Update medicine with image URL
        await db.medicines.update_one(
            {"_id": ObjectId(medicine_id)},
            {"$set": {"image_url": image_url}}
        )
        
        return {"message": "Image uploaded successfully", "image_url": image_url}
        
    except Exception as e:
        logger.error(f"Error uploading image: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload image")

# Cart endpoints
@router.get("/cart/", response_model=Cart)
async def get_cart(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get user's cart"""
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        # Create empty cart
        cart_data = {
            "user_id": current_user.id,
            "items": [],
            "total_amount": 0.0
        }
        result = await db.carts.insert_one(cart_data)
        cart = await db.carts.find_one({"_id": result.inserted_id})
    
    return Cart(**cart)

@router.post("/cart/add")
async def add_to_cart(
    item: CartItemBase,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Add item to cart"""
    # Verify medicine exists and is in stock
    medicine = await db.medicines.find_one({"_id": item.medicine_id})
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    if not medicine.get("in_stock", False):
        raise HTTPException(status_code=400, detail="Medicine out of stock")
    
    # Get or create cart
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        cart = {
            "user_id": current_user.id,
            "items": [],
            "total_amount": 0.0
        }
        result = await db.carts.insert_one(cart)
        cart["_id"] = result.inserted_id
    
    # Check if item already in cart
    item_exists = False
    for cart_item in cart["items"]:
        if cart_item["medicine_id"] == item.medicine_id:
            cart_item["quantity"] += item.quantity
            item_exists = True
            break
    
    if not item_exists:
        cart["items"].append(item.dict())
    
    # Calculate total
    total_amount = 0.0
    for cart_item in cart["items"]:
        med = await db.medicines.find_one({"_id": cart_item["medicine_id"]})
        if med:
            total_amount += med["price"] * cart_item["quantity"]
    
    # Update cart
    await db.carts.update_one(
        {"_id": cart["_id"]},
        {"$set": {"items": cart["items"], "total_amount": total_amount}}
    )
    
    return {"message": "Item added to cart successfully"}

@router.delete("/cart/remove/{medicine_id}")
async def remove_from_cart(
    medicine_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Remove item from cart"""
    if not ObjectId.is_valid(medicine_id):
        raise HTTPException(status_code=400, detail="Invalid medicine ID")
    
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Remove item from cart
    cart["items"] = [item for item in cart["items"] if str(item["medicine_id"]) != medicine_id]
    
    # Recalculate total
    total_amount = 0.0
    for cart_item in cart["items"]:
        med = await db.medicines.find_one({"_id": cart_item["medicine_id"]})
        if med:
            total_amount += med["price"] * cart_item["quantity"]
    
    await db.carts.update_one(
        {"_id": cart["_id"]},
        {"$set": {"items": cart["items"], "total_amount": total_amount}}
    )
    
    return {"message": "Item removed from cart successfully"}

@router.delete("/cart/clear")
async def clear_cart(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Clear user's cart"""
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": {"items": [], "total_amount": 0.0}}
    )
    
    return {"message": "Cart cleared successfully"}