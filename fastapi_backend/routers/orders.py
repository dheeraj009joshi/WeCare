from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from beanie import PydanticObjectId

from models.order import Order, OrderResponse, OrderCreate, OrderUpdate
from models.order_item import OrderItem, OrderItemResponse, OrderItemCreate
from routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[OrderResponse])
async def get_orders(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    query = {}
    if user_id:
        query["user_id"] = user_id
    elif current_user.role != "admin":
        # Non-admin users can only see their own orders
        query["user_id"] = str(current_user.id)
    
    if status:
        query["status"] = status
    
    orders = await Order.find(query).skip(skip).limit(limit).to_list()
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: PydanticObjectId,
    current_user = Depends(get_current_user)
):
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check permissions
    if order.user_id != str(current_user.id) and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return order

@router.post("/", response_model=OrderResponse)
async def create_order(
    order: OrderCreate,
    current_user = Depends(get_current_user)
):
    # Ensure user_id matches current user unless admin
    if order.user_id != str(current_user.id) and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    new_order = Order(**order.dict())
    await new_order.insert()
    return new_order

@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: PydanticObjectId,
    order_update: OrderUpdate,
    current_user = Depends(get_current_user)
):
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check permissions
    if order.user_id != str(current_user.id) and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    update_data = order_update.dict(exclude_unset=True)
    if update_data:
        await order.update({"$set": update_data})
    
    return order

@router.delete("/{order_id}")
async def delete_order(
    order_id: PydanticObjectId,
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    await order.delete()
    return {"message": "Order deleted successfully"}

# Order Items endpoints
@router.get("/{order_id}/items", response_model=List[OrderItemResponse])
async def get_order_items(
    order_id: PydanticObjectId,
    current_user = Depends(get_current_user)
):
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check permissions
    if order.user_id != str(current_user.id) and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    order_items = await OrderItem.find(OrderItem.order_id == str(order_id)).to_list()
    return order_items

@router.post("/{order_id}/items", response_model=OrderItemResponse)
async def create_order_item(
    order_id: PydanticObjectId,
    order_item: OrderItemCreate,
    current_user = Depends(get_current_user)
):
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check permissions
    if order.user_id != str(current_user.id) and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    order_item_dict = order_item.dict()
    order_item_dict["order_id"] = str(order_id)
    
    new_order_item = OrderItem(**order_item_dict)
    await new_order_item.insert()
    return new_order_item
