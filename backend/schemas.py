from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

# --- Product Schemas ---
class ProductBase(BaseModel):
    name: str
    sku: str
    price: Decimal
    cost_price: Decimal
    stock: int
    low_stock_alert: int
    category: str
    unit: Optional[str] = None
    tax_rate: Decimal = Decimal("8.00")
    image: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    stock: Optional[int] = None
    low_stock_alert: Optional[int] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    tax_rate: Optional[Decimal] = None
    image: Optional[str] = None

class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True

# --- Checkout Schemas ---
class CartItemSchema(BaseModel):
    product_id: int
    quantity: int
    price: Decimal

class CheckoutSchema(BaseModel):
    subtotal: Decimal
    discount: Decimal
    tax: Decimal
    total: Decimal
    items: List[CartItemSchema]

# --- Transaction History Schemas ---
class TransactionItemResponse(BaseModel):
    product_id: int
    quantity: int
    price: Decimal
    product_name: Optional[str] = None

    class Config:
        from_attributes = True

class TransactionResponse(BaseModel):
    id: int
    subtotal: Decimal
    discount: Decimal
    tax: Decimal
    total: Decimal
    created_at: datetime
    items: List[TransactionItemResponse] = []

    class Config:
        from_attributes = True

# --- Dashboard Metrics Schemas ---
class LowStockAlert(BaseModel):
    id: int
    name: str
    stock: int

class RecentTransaction(BaseModel):
    id: int
    created_at: datetime
    items_count: int
    total: Decimal

class DashboardMetricsResponse(BaseModel):
    today_sales: Decimal
    orders_count: int
    profit: Decimal
    low_stock_alerts: List[LowStockAlert]
    recent_transactions: List[RecentTransaction]

# --- User Authentication Schemas ---
class UserCreate(BaseModel):
    shop_name: str
    owner_name: str
    shop_category: str
    phone: str
    email_or_username: str
    password: str
    gst_number: Optional[str] = None
    business_address: Optional[str] = None

class UserUpdate(BaseModel):
    shop_name: Optional[str] = None
    owner_name: Optional[str] = None
    shop_category: Optional[str] = None
    phone: Optional[str] = None
    email_or_username: Optional[str] = None
    gst_number: Optional[str] = None
    business_address: Optional[str] = None

class UserLogin(BaseModel):
    email_or_username: str
    password: str

class UserResponse(BaseModel):
    id: int
    shop_name: str
    owner_name: str
    shop_category: str
    phone: str
    email_or_username: str
    gst_number: Optional[str] = None
    business_address: Optional[str] = None

    class Config:
        from_attributes = True
