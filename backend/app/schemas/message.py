from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserOut


class MessageCreate(BaseModel):
    receiver_id: int
    message: str


class MessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    message: str
    is_read: bool
    created_at: datetime
    sender: Optional[UserOut] = None
    receiver: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)


class GroupMessageCreate(BaseModel):
    group_id: int
    message: str


class GroupMessageOut(BaseModel):
    id: int
    group_id: int
    sender_id: int
    message: str
    created_at: datetime
    sender: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)
