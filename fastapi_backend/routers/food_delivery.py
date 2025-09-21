from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from beanie import PydanticObjectId

from models.restaurant import Restaurant, RestaurantResponse, RestaurantCreate, RestaurantUpdate
from models.menu_item import MenuItem, MenuItemResponse, MenuItemCreate, MenuItemUpdate
from models.food_category import FoodCategory, FoodCategoryResponse, FoodCategoryCreate, FoodCategoryUpdate
from models.food_cart import FoodCart, FoodCartResponse, FoodCartCreate, FoodCartUpdate
from models.food_order import FoodOrder, FoodOrderResponse, FoodOrderCreate, FoodOrderUpdate
from routers.auth import get_current_user

router = APIRouter()

# Restaurant endpoints
@router.get("/restaurants", response_model=List[RestaurantResponse])
async def get_restaurants(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    cuisine: Optional[str] = None,
    is_active: Optional[bool] = None,
    is_open: Optional[bool] = None
):
    query = {}
    if category:
        query["category"] = category
    if cuisine:
        query["cuisine"] = cuisine
    if is_active is not None:
        query["is_active"] = is_active
    if is_open is not None:
        query["is_open"] = is_open
    
    restaurants = await Restaurant.find(query).skip(skip).limit(limit).to_list()
    return restaurants

@router.get("/restaurants/{restaurant_id}", response_model=RestaurantResponse)
async def get_restaurant(restaurant_id: PydanticObjectId):
    restaurant = await Restaurant.get(restaurant_id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    return restaurant

@router.post("/restaurants", response_model=RestaurantResponse)
async def create_restaurant(
    restaurant: RestaurantCreate,
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    new_restaurant = Restaurant(**restaurant.dict())
    await new_restaurant.insert()
    return new_restaurant

# Menu Item endpoints
@router.get("/menu-items", response_model=List[MenuItemResponse])
async def get_menu_items(
    skip: int = 0,
    limit: int = 100,
    restaurant_id: Optional[str] = None,
    category: Optional[str] = None,
    is_available: Optional[bool] = None
):
    query = {}
    if restaurant_id:
        query["restaurant_id"] = restaurant_id
    if category:
        query["category"] = category
    if is_available is not None:
        query["is_available"] = is_available
    
    menu_items = await MenuItem.find(query).skip(skip).limit(limit).to_list()
    return menu_items

@router.get("/menu-items/{menu_item_id}", response_model=MenuItemResponse)
async def get_menu_item(menu_item_id: PydanticObjectId):
    menu_item = await MenuItem.get(menu_item_id)
    if not menu_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found"
        )
    return menu_item

@router.post("/menu-items", response_model=MenuItemResponse)
async def create_menu_item(
    menu_item: MenuItemCreate,
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    new_menu_item = MenuItem(**menu_item.dict())
    await new_menu_item.insert()
    return new_menu_item

# Food Category endpoints
@router.get("/categories", response_model=List[FoodCategoryResponse])
async def get_food_categories(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None
):
    query = {}
    if is_active is not None:
        query["is_active"] = is_active
    
    categories = await FoodCategory.find(query).skip(skip).limit(limit).to_list()
    return categories

@router.get("/categories/{category_id}", response_model=FoodCategoryResponse)
async def get_food_category(category_id: PydanticObjectId):
    category = await FoodCategory.get(category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food category not found"
        )
    return category

@router.post("/categories", response_model=FoodCategoryResponse)
async def create_food_category(
    category: FoodCategoryCreate,
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    new_category = FoodCategory(**category.dict())
    await new_category.insert()
    return new_category

# Food Cart endpoints
@router.get("/cart", response_model=List[FoodCartResponse])
async def get_food_cart(
    current_user = Depends(get_current_user)
):
    cart_items = await FoodCart.find(FoodCart.user_id == str(current_user.id)).to_list()
    return cart_items

@router.post("/cart", response_model=FoodCartResponse)
async def add_to_food_cart(
    cart_item: FoodCartCreate,
    current_user = Depends(get_current_user)
):
    cart_item_dict = cart_item.dict()
    cart_item_dict["user_id"] = str(current_user.id)
    
    new_cart_item = FoodCart(**cart_item_dict)
    await new_cart_item.insert()
    return new_cart_item

@router.put("/cart/{cart_item_id}", response_model=FoodCartResponse)
async def update_food_cart_item(
    cart_item_id: PydanticObjectId,
    cart_update: FoodCartUpdate,
    current_user = Depends(get_current_user)
):
    cart_item = await FoodCart.get(cart_item_id)
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    if cart_item.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    update_data = cart_update.dict(exclude_unset=True)
    if update_data:
        await cart_item.update({"$set": update_data})
    
    return cart_item

@router.delete("/cart/{cart_item_id}")
async def remove_from_food_cart(
    cart_item_id: PydanticObjectId,
    current_user = Depends(get_current_user)
):
    cart_item = await FoodCart.get(cart_item_id)
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    if cart_item.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    await cart_item.delete()
    return {"message": "Cart item removed successfully"}

# Food Order endpoints
@router.get("/orders", response_model=List[FoodOrderResponse])
async def get_food_orders(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_user)
):
    query = {"user_id": str(current_user.id)}
    if current_user.role == "admin":
        query = {}
    
    orders = await FoodOrder.find(query).skip(skip).limit(limit).to_list()
    return orders

@router.get("/orders/{order_id}", response_model=FoodOrderResponse)
async def get_food_order(
    order_id: PydanticObjectId,
    current_user = Depends(get_current_user)
):
    order = await FoodOrder.get(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food order not found"
        )
    
    if order.user_id != str(current_user.id) and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return order

@router.post("/orders", response_model=FoodOrderResponse)
async def create_food_order(
    order: FoodOrderCreate,
    current_user = Depends(get_current_user)
):
    order_dict = order.dict()
    order_dict["user_id"] = str(current_user.id)
    
    new_order = FoodOrder(**order_dict)
    await new_order.insert()
    return new_order
