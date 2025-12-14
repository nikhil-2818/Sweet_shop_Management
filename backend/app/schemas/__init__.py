from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional

# User Schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserResponse(UserBase):
    id: int
    is_admin: bool
    model_config = ConfigDict(from_attributes=True)

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# Sweet Schemas
# Add image_url to schemas
class SweetBase(BaseModel):
    name: str
    category: str
    price: float
    quantity: int
    description: Optional[str] = None
    image_url: Optional[str] = None  # Add this line

class SweetCreate(SweetBase):
    pass

class SweetUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    description: Optional[str] = None
    image_url: Optional[str] = None  # Add this line

class SweetResponse(SweetBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class PurchaseRequest(BaseModel):
    quantity: int = Field(..., gt=0)

class RestockRequest(BaseModel):
    quantity: int = Field(..., gt=0)
