from sqlalchemy import Column, Integer, String, DECIMAL, ForeignKey, DateTime, func, Text
from sqlalchemy.orm import relationship
from database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
    cost_price = Column(DECIMAL(10, 2), nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    low_stock_alert = Column(Integer, nullable=False, default=5)
    category = Column(String(100), nullable=False)
    unit = Column(String(50), nullable=True)
    tax_rate = Column(DECIMAL(5, 2), nullable=False, default=8.00)
    image = Column(Text, nullable=True)

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    subtotal = Column(DECIMAL(10, 2), nullable=False)
    discount = Column(DECIMAL(10, 2), nullable=False, default=0.00)
    tax = Column(DECIMAL(10, 2), nullable=False)
    total = Column(DECIMAL(10, 2), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    items = relationship("TransactionItem", back_populates="transaction", cascade="all, delete-orphan")

class TransactionItem(Base):
    __tablename__ = "transaction_items"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)

    transaction = relationship("Transaction", back_populates="items")
    product = relationship("Product")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    shop_name = Column(String(255), nullable=False)
    owner_name = Column(String(255), nullable=False)
    shop_category = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=False)
    email_or_username = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    gst_number = Column(String(100), nullable=True)
    business_address = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
