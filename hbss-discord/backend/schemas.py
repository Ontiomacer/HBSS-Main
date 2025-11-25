"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    google_id: str
    email: EmailStr
    name: str
    avatar: Optional[str] = None
    commitment_array: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    google_id: str
    email: str
    name: str
    avatar: Optional[str]
    commitment_array: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChannelCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ChannelResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_by: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    content: str
    signature: Optional[str] = None

class MessageResponse(BaseModel):
    id: int
    channel_id: int
    user_id: int
    content: str
    signature: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
