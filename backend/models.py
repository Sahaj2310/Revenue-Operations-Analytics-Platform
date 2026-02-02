from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class RevenueData(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: datetime
    amount: float
    customer_name: str
    category: str

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(unique=True)
    hashed_password: str
