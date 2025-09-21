from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from beanie import PydanticObjectId

from models.product import Product, ProductResponse, ProductCreate, ProductUpdate
from routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ProductResponse])
async def get_products(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
    prescription: Optional[bool] = None
):
    query = {}
    if category:
        query["category"] = category
    if is_active is not None:
        query["is_active"] = is_active
    if prescription is not None:
        query["prescription"] = prescription
    
    products = await Product.find(query).skip(skip).limit(limit).to_list()
    return products

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: PydanticObjectId):
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@router.post("/", response_model=ProductResponse)
async def create_product(
    product: ProductCreate,
    current_user = Depends(get_current_user)
):
    if current_user.role not in ["admin", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    new_product = Product(**product.dict())
    await new_product.insert()
    return new_product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: PydanticObjectId,
    product_update: ProductUpdate,
    current_user = Depends(get_current_user)
):
    if current_user.role not in ["admin", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    update_data = product_update.dict(exclude_unset=True)
    if update_data:
        await product.update({"$set": update_data})
    
    return product

@router.delete("/{product_id}")
async def delete_product(
    product_id: PydanticObjectId,
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    await product.delete()
    return {"message": "Product deleted successfully"}
