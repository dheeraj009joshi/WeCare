from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from beanie import PydanticObjectId

from models.user import User, UserResponse, UserUpdate
from routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
async def get_users(skip: int = 0, limit: int = 100):
    users = await User.find_all().skip(skip).limit(limit).to_list()
    return users

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: PydanticObjectId):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: PydanticObjectId,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is updating their own profile or is admin
    if user.id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    update_data = user_update.dict(exclude_unset=True)
    if update_data:
        await user.update({"$set": update_data})
    
    return user

@router.delete("/{user_id}")
async def delete_user(
    user_id: PydanticObjectId,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = await User.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    await user.delete()
    return {"message": "User deleted successfully"}
