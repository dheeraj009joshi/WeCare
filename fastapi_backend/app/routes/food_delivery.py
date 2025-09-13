from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
import uuid
from ..core.database import get_database
from ..models.food_delivery import (
    Restaurant, RestaurantCreate, RestaurantUpdate,
    FoodCategory, MenuItem, MenuItemCreate, MenuItemUpdate,
    FoodCart, FoodCartItemBase, FoodOrder, FoodOrderCreate, FoodOrderStatus
)
from ..models.user import UserInDB
from ..utils.auth import get_current_active_user, get_current_admin_user
from ..services.azure_storage import azure_storage
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Restaurant endpoints
@router.get("/restaurants", response_model=List[Restaurant])
async def get_restaurants(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    cuisine_type: Optional[str] = None,
    city: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get list of restaurants"""
    query = {"is_active": True}
    
    if cuisine_type:
        query["cuisine_type"] = {"$in": [cuisine_type]}
    
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    
    cursor = db.restaurants.find(query).skip(skip).limit(limit)
    restaurants = []
    async for restaurant in cursor:
        restaurants.append(Restaurant(**restaurant))
    
    return restaurants

@router.get("/restaurants/{restaurant_id}", response_model=Restaurant)
async def get_restaurant(
    restaurant_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific restaurant by ID"""
    if not ObjectId.is_valid(restaurant_id):
        raise HTTPException(status_code=400, detail="Invalid restaurant ID")
    
    restaurant = await db.restaurants.find_one({"_id": ObjectId(restaurant_id)})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    return Restaurant(**restaurant)

@router.post("/restaurants", response_model=Restaurant)
async def create_restaurant(
    restaurant_data: RestaurantCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Create a new restaurant (Admin only)"""
    restaurant_dict = restaurant_data.dict()
    
    result = await db.restaurants.insert_one(restaurant_dict)
    created_restaurant = await db.restaurants.find_one({"_id": result.inserted_id})
    
    return Restaurant(**created_restaurant)

@router.put("/restaurants/{restaurant_id}", response_model=Restaurant)
async def update_restaurant(
    restaurant_id: str,
    restaurant_data: RestaurantUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Update a restaurant (Admin only)"""
    if not ObjectId.is_valid(restaurant_id):
        raise HTTPException(status_code=400, detail="Invalid restaurant ID")
    
    update_data = {k: v for k, v in restaurant_data.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.restaurants.update_one(
        {"_id": ObjectId(restaurant_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    updated_restaurant = await db.restaurants.find_one({"_id": ObjectId(restaurant_id)})
    return Restaurant(**updated_restaurant)

# Menu Item endpoints
@router.get("/restaurants/{restaurant_id}/menu", response_model=List[MenuItem])
async def get_menu_items(
    restaurant_id: str,
    category: Optional[str] = None,
    is_vegetarian: Optional[bool] = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get menu items for a restaurant"""
    if not ObjectId.is_valid(restaurant_id):
        raise HTTPException(status_code=400, detail="Invalid restaurant ID")
    
    query = {"restaurant_id": ObjectId(restaurant_id), "is_available": True}
    
    if category:
        query["category"] = category
    
    if is_vegetarian is not None:
        query["is_vegetarian"] = is_vegetarian
    
    cursor = db.menu_items.find(query)
    menu_items = []
    async for item in cursor:
        menu_items.append(MenuItem(**item))
    
    return menu_items

@router.post("/restaurants/{restaurant_id}/menu", response_model=MenuItem)
async def create_menu_item(
    restaurant_id: str,
    menu_item_data: MenuItemCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Create a new menu item (Admin only)"""
    if not ObjectId.is_valid(restaurant_id):
        raise HTTPException(status_code=400, detail="Invalid restaurant ID")
    
    # Verify restaurant exists
    restaurant = await db.restaurants.find_one({"_id": ObjectId(restaurant_id)})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    menu_item_dict = menu_item_data.dict()
    menu_item_dict["restaurant_id"] = ObjectId(restaurant_id)
    
    result = await db.menu_items.insert_one(menu_item_dict)
    created_item = await db.menu_items.find_one({"_id": result.inserted_id})
    
    return MenuItem(**created_item)

# Food Categories
@router.get("/categories", response_model=List[FoodCategory])
async def get_food_categories(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all food categories"""
    cursor = db.food_categories.find({"is_active": True})
    categories = []
    async for category in cursor:
        categories.append(FoodCategory(**category))
    
    return categories

# Cart endpoints
@router.get("/cart", response_model=FoodCart)
async def get_food_cart(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get user's food cart"""
    cart = await db.food_carts.find_one({"user_id": current_user.id})
    if not cart:
        # Create empty cart
        cart_data = {
            "user_id": current_user.id,
            "restaurant_id": None,
            "items": [],
            "total_amount": 0.0
        }
        result = await db.food_carts.insert_one(cart_data)
        cart = await db.food_carts.find_one({"_id": result.inserted_id})
    
    return FoodCart(**cart)

@router.post("/cart/add")
async def add_to_food_cart(
    item: FoodCartItemBase,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Add item to food cart"""
    # Verify menu item exists
    menu_item = await db.menu_items.find_one({"_id": item.menu_item_id})
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    if not menu_item.get("is_available", False):
        raise HTTPException(status_code=400, detail="Menu item not available")
    
    restaurant_id = menu_item["restaurant_id"]
    
    # Get or create cart
    cart = await db.food_carts.find_one({"user_id": current_user.id})
    if not cart:
        cart = {
            "user_id": current_user.id,
            "restaurant_id": restaurant_id,
            "items": [],
            "total_amount": 0.0
        }
        result = await db.food_carts.insert_one(cart)
        cart["_id"] = result.inserted_id
    else:
        # Check if adding from different restaurant
        if cart["restaurant_id"] and cart["restaurant_id"] != restaurant_id:
            raise HTTPException(
                status_code=400, 
                detail="Cannot add items from different restaurants. Clear cart first."
            )
        cart["restaurant_id"] = restaurant_id
    
    # Check if item already in cart
    item_exists = False
    for cart_item in cart["items"]:
        if cart_item["menu_item_id"] == item.menu_item_id:
            cart_item["quantity"] += item.quantity
            if item.special_instructions:
                cart_item["special_instructions"] = item.special_instructions
            item_exists = True
            break
    
    if not item_exists:
        cart["items"].append(item.dict())
    
    # Calculate total
    total_amount = 0.0
    for cart_item in cart["items"]:
        menu_item = await db.menu_items.find_one({"_id": cart_item["menu_item_id"]})
        if menu_item:
            total_amount += menu_item["price"] * cart_item["quantity"]
    
    # Update cart
    await db.food_carts.update_one(
        {"_id": cart["_id"]},
        {"$set": {
            "restaurant_id": restaurant_id,
            "items": cart["items"], 
            "total_amount": total_amount
        }}
    )
    
    return {"message": "Item added to cart successfully"}

@router.delete("/cart/remove/{menu_item_id}")
async def remove_from_food_cart(
    menu_item_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Remove item from food cart"""
    if not ObjectId.is_valid(menu_item_id):
        raise HTTPException(status_code=400, detail="Invalid menu item ID")
    
    cart = await db.food_carts.find_one({"user_id": current_user.id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Remove item from cart
    cart["items"] = [item for item in cart["items"] if str(item["menu_item_id"]) != menu_item_id]
    
    # Recalculate total
    total_amount = 0.0
    for cart_item in cart["items"]:
        menu_item = await db.menu_items.find_one({"_id": cart_item["menu_item_id"]})
        if menu_item:
            total_amount += menu_item["price"] * cart_item["quantity"]
    
    # Clear restaurant_id if cart is empty
    restaurant_id = cart["restaurant_id"] if cart["items"] else None
    
    await db.food_carts.update_one(
        {"_id": cart["_id"]},
        {"$set": {
            "restaurant_id": restaurant_id,
            "items": cart["items"], 
            "total_amount": total_amount
        }}
    )
    
    return {"message": "Item removed from cart successfully"}

@router.delete("/cart/clear")
async def clear_food_cart(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Clear user's food cart"""
    await db.food_carts.update_one(
        {"user_id": current_user.id},
        {"$set": {
            "restaurant_id": None,
            "items": [], 
            "total_amount": 0.0
        }}
    )
    
    return {"message": "Cart cleared successfully"}

# Order endpoints
@router.post("/orders", response_model=FoodOrder)
async def create_food_order(
    order_data: FoodOrderCreate,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new food order"""
    # Verify cart has items
    cart = await db.food_carts.find_one({"user_id": current_user.id})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Generate order number
    order_number = f"FO{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:8].upper()}"
    
    # Create order
    order_dict = order_data.dict()
    order_dict["order_number"] = order_number
    order_dict["user_id"] = current_user.id
    
    # Set estimated delivery time (30-45 minutes from now)
    estimated_time = datetime.utcnow()
    estimated_time = estimated_time.replace(minute=estimated_time.minute + 35)
    order_dict["estimated_delivery_time"] = estimated_time
    
    result = await db.food_orders.insert_one(order_dict)
    
    # Clear cart after order
    await db.food_carts.update_one(
        {"user_id": current_user.id},
        {"$set": {
            "restaurant_id": None,
            "items": [], 
            "total_amount": 0.0
        }}
    )
    
    created_order = await db.food_orders.find_one({"_id": result.inserted_id})
    return FoodOrder(**created_order)

@router.get("/orders", response_model=List[FoodOrder])
async def get_user_food_orders(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get user's food orders"""
    cursor = db.food_orders.find({"user_id": current_user.id}).sort("created_at", -1)
    orders = []
    async for order in cursor:
        orders.append(FoodOrder(**order))
    
    return orders

@router.get("/orders/{order_id}", response_model=FoodOrder)
async def get_food_order(
    order_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific food order"""
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
    
    order = await db.food_orders.find_one({
        "_id": ObjectId(order_id),
        "user_id": current_user.id
    })
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return FoodOrder(**order)