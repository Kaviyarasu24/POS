from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

# --- Store Schemas ---
class StoreBase(BaseModel):
    name: str
    category: str
    phone: str
    email: Optional[str] = None
    gst_number: Optional[str] = None
    address: Optional[str] = None

class StoreCreate(StoreBase):
    pass

class StoreUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    gst_number: Optional[str] = None
    address: Optional[str] = None

class StoreResponse(StoreBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- User & Staff Schemas ---
class UserCreate(BaseModel):
    shop_name: str
    owner_name: str
    shop_category: str
    phone: str
    email_or_username: str
    password: str
    gst_number: Optional[str] = None
    business_address: Optional[str] = None

class StaffCreate(BaseModel):
    name: str
    email_or_username: str
    password: str
    role: str = "cashier"  # cashier, manager
    phone: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email_or_username: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email_or_username: str
    password: str

class UserResponse(BaseModel):
    id: int
    store_id: str
    name: str
    email_or_username: str
    role: str
    phone: Optional[str] = None
    # Store Details embedded for instant frontend store setup
    shop_name: Optional[str] = None
    shop_category: Optional[str] = None
    gst_number: Optional[str] = None
    business_address: Optional[str] = None
    store_phone: Optional[str] = None

    class Config:
        from_attributes = True

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
    store_id: str

    class Config:
        from_attributes = True

# --- Checkout & Bill Schemas ---
class CartItemSchema(BaseModel):
    product_id: int
    quantity: int
    price: Decimal

class CheckoutSchema(BaseModel):
    subtotal: Decimal
    discount: Decimal
    tax: Decimal
    total: Decimal
    payment_method: str = "CASH"  # CASH, UPI, CARD
    payment_status: str = "PAID"
    items: List[CartItemSchema]

class TransactionItemResponse(BaseModel):
    id: Optional[int] = None
    product_id: int
    product_name: str
    quantity: int
    price: Decimal

    class Config:
        from_attributes = True

class BillResponse(BaseModel):
    store_id: str
    invoice_number: str
    shop_name: str
    shop_address: Optional[str] = None
    shop_phone: Optional[str] = None
    gst_number: Optional[str] = None
    cashier_name: Optional[str] = None
    payment_method: str
    payment_status: str
    subtotal: Decimal
    discount: Decimal
    tax: Decimal
    total: Decimal
    created_at: datetime
    items: List[TransactionItemResponse]

    class Config:
        from_attributes = True

class TransactionResponse(BaseModel):
    store_id: str
    invoice_number: str
    payment_method: str
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
    store_id: str
    invoice_number: str
    created_at: datetime
    items_count: int
    total: Decimal
    payment_method: str

class DashboardMetricsResponse(BaseModel):
    today_sales: Decimal
    orders_count: int
    profit: Decimal
    low_stock_alerts: List[LowStockAlert]
    recent_transactions: List[RecentTransaction]
