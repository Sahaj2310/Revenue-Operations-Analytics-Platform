from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class RevenueData(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: datetime
    amount: float
    customer_name: str
    category: str

class UserBase(SQLModel):
    username: str = Field(index=True, unique=True)
    email: str = Field(unique=True)

class UserCreate(UserBase):
    password: str

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
