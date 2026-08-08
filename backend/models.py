from sqlalchemy import Column, Integer, String, DECIMAL, ForeignKey, DateTime, func, Text, UniqueConstraint, ForeignKeyConstraint
from sqlalchemy.orm import relationship
from database import Base

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=True)
    gst_number = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    users = relationship("User", back_populates="store", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="store", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="store", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    email_or_username = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="cashier")  # owner, manager, cashier
    phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    store = relationship("Store", back_populates="users")
    transactions = relationship("Transaction", back_populates="cashier")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), index=True, nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
    cost_price = Column(DECIMAL(10, 2), nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    low_stock_alert = Column(Integer, nullable=False, default=5)
    category = Column(String(100), nullable=False)
    unit = Column(String(50), nullable=True)
    tax_rate = Column(DECIMAL(5, 2), nullable=False, default=8.00)
    image = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (UniqueConstraint('store_id', 'sku', name='unique_store_sku'),)

    store = relationship("Store", back_populates="products")


class Transaction(Base):
    __tablename__ = "transactions"

    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), primary_key=True)
    invoice_number = Column(String(100), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    payment_method = Column(String(50), nullable=False, default="CASH")  # CASH, UPI, CARD
    payment_status = Column(String(50), nullable=False, default="PAID")
    subtotal = Column(DECIMAL(10, 2), nullable=False)
    discount = Column(DECIMAL(10, 2), nullable=False, default=0.00)
    tax = Column(DECIMAL(10, 2), nullable=False)
    total = Column(DECIMAL(10, 2), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    store = relationship("Store", back_populates="transactions")
    cashier = relationship("User", back_populates="transactions")
    items = relationship(
        "TransactionItem",
        back_populates="transaction",
        cascade="all, delete-orphan",
        primaryjoin="and_(Transaction.store_id==TransactionItem.store_id, Transaction.invoice_number==TransactionItem.invoice_number)"
    )


class TransactionItem(Base):
    __tablename__ = "transaction_items"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, nullable=False)
    invoice_number = Column(String(100), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    product_name = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)

    __table_args__ = (
        ForeignKeyConstraint(
            ['store_id', 'invoice_number'],
            ['transactions.store_id', 'transactions.invoice_number'],
            ondelete='CASCADE'
        ),
    )

    transaction = relationship(
        "Transaction",
        back_populates="items",
        primaryjoin="and_(Transaction.store_id==TransactionItem.store_id, Transaction.invoice_number==TransactionItem.invoice_number)"
    )
    product = relationship("Product")
