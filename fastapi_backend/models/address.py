from beanie import Document
from pydantic import BaseModel, Field
from datetime import datetime

# Pydantic schemas
class AddressBase(BaseModel):
    user_id: str
    name: str
    address: str
    phone: str
    is_default: bool = False
    city: str
    state: str
    pincode: str

class AddressCreate(AddressBase):
    pass

class AddressUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    is_default: Optional[bool] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

class AddressResponse(AddressBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Beanie Document
class Address(Document, AddressBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "addresses"
        indexes = [
            "user_id",
            "is_default",
            "city",
            "state",
            "created_at"
        ]

    def __str__(self):
        return f"Address(id={self.id}, user_id={self.user_id}, name={self.name})"
