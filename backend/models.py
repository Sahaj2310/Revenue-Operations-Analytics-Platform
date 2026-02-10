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

class AlertRule(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    metric: str # "mrr", "churn_risk", "active_customers"
    condition: str # ">", "<"
    threshold: float
    is_active: bool = True

class AlertEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    rule_id: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    message: str
    severity: str # "info", "warning", "critical"
    is_read: bool = False
