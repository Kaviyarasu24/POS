from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, date, time
from decimal import Decimal
import hashlib

import models
import schemas
from database import get_db, engine

# Create DB Tables if they don't exist yet (SQLAlchemy fallback)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SmartPOS API Backend", version="1.0.0")

# Enable CORS for all local environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@app.post("/api/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(models.User).filter(
        models.User.email_or_username == user.email_or_username.lower().strip()
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or Email already registered")
        
    db_user = models.User(
        shop_name=user.shop_name.strip(),
        owner_name=user.owner_name.strip(),
        shop_category=user.shop_category.strip(),
        phone=user.phone.strip(),
        email_or_username=user.email_or_username.lower().strip(),
        password=hash_password(user.password),
        gst_number=user.gst_number,
        business_address=user.business_address
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.put("/api/users/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: int, updated_fields: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if updated_fields.email_or_username:
        new_email = updated_fields.email_or_username.lower().strip()
        if new_email != db_user.email_or_username:
            existing = db.query(models.User).filter(models.User.email_or_username == new_email).first()
            if existing:
                raise HTTPException(status_code=400, detail="Username or Email already registered")
            db_user.email_or_username = new_email
            
    for key, value in updated_fields.model_dump(exclude_unset=True).items():
        if key == "email_or_username":
            continue
        setattr(db_user, key, value)
        
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/login", response_model=schemas.UserResponse)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        models.User.email_or_username == credentials.email_or_username.lower().strip()
    ).first()
    if not db_user or db_user.password != hash_password(credentials.password):
        raise HTTPException(status_code=401, detail="Invalid username/email or password")
    return db_user

# --- 1. Product Endpoints ---

@app.get("/api/products", response_model=List[schemas.ProductResponse])
def read_products(
    category: Optional[str] = Query(None),
    query: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(models.Product)
    
    if category and category != "All" and category != "All Items":
        q = q.filter(models.Product.category == category)
        
    if query:
        search = f"%{query}%"
        q = q.filter(
            (models.Product.name.like(search)) | 
            (models.Product.sku.like(search))
        )
        
    return q.order_by(models.Product.id.desc()).all()

@app.get("/api/products/{product_id}", response_model=schemas.ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/api/products", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    # Check uniqueness of SKU
    existing = db.query(models.Product).filter(models.Product.sku == product.sku.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product SKU already exists")
        
    db_product = models.Product(
        name=product.name,
        sku=product.sku.upper(),
        price=product.price,
        cost_price=product.cost_price,
        stock=product.stock,
        low_stock_alert=product.low_stock_alert,
        category=product.category,
        unit=product.unit,
        tax_rate=product.tax_rate,
        image=product.image
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.put("/api/products/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int, 
    updated_fields: schemas.ProductUpdate, 
    db: Session = Depends(get_db)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Check unique SKU if changing
    if updated_fields.sku and updated_fields.sku.upper() != db_product.sku:
        existing = db.query(models.Product).filter(models.Product.sku == updated_fields.sku.upper()).first()
        if existing:
            raise HTTPException(status_code=400, detail="SKU code already exists")
            
    for key, value in updated_fields.model_dump(exclude_unset=True).items():
        if key == "sku" and value:
            setattr(db_product, key, value.upper())
        else:
            setattr(db_product, key, value)
            
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/api/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return None

@app.post("/api/products/{product_id}/restock", response_model=schemas.ProductResponse)
def restock_product(product_id: int, qty: int = Query(..., gt=0), db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db_product.stock += qty
    db.commit()
    db.refresh(db_product)
    return db_product


# --- 2. Checkout Endpoints ---

@app.post("/api/checkout", status_code=status.HTTP_201_CREATED)
def checkout(order: schemas.CheckoutSchema, db: Session = Depends(get_db)):
    # 1. Create Transaction
    db_transaction = models.Transaction(
        subtotal=order.subtotal,
        discount=order.discount,
        tax=order.tax,
        total=order.total
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)

    # 2. Add Items & Deduct Stock
    for item in order.items:
        db_product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not db_product:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")
            
        if db_product.stock < item.quantity:
            db.rollback()
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock for {db_product.name}. Available: {db_product.stock}"
            )
            
        db_product.stock -= item.quantity
        
        db_item = models.TransactionItem(
            transaction_id=db_transaction.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price
        )
        db.add(db_item)
        
    db.commit()
    return {"status": "success", "transaction_id": db_transaction.id}


# --- 3. Dashboard Analytics Endpoints ---

@app.get("/api/dashboard", response_model=schemas.DashboardMetricsResponse)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    # Get today range bounds
    today = date.today()
    start_today = datetime.combine(today, time.min)
    end_today = datetime.combine(today, time.max)

    # 1. Today's Sales total sum
    today_sales_query = db.query(func.sum(models.Transaction.total)).filter(
        models.Transaction.created_at >= start_today,
        models.Transaction.created_at <= end_today
    ).scalar()
    today_sales = Decimal(str(today_sales_query)) if today_sales_query else Decimal("0.00")

    # 2. Orders Count today
    orders_count = db.query(models.Transaction).filter(
        models.Transaction.created_at >= start_today,
        models.Transaction.created_at <= end_today
    ).count()

    # 3. Calculate Today's Profit: sum(sales_price - cost_price * quantity)
    # We join transactions, items and products to get the exact cost prices
    profit_query = db.query(
        func.sum((models.TransactionItem.price - models.Product.cost_price) * models.TransactionItem.quantity)
    ).join(
        models.Transaction, models.Transaction.id == models.TransactionItem.transaction_id
    ).join(
        models.Product, models.Product.id == models.TransactionItem.product_id
    ).filter(
        models.Transaction.created_at >= start_today,
        models.Transaction.created_at <= end_today
    ).scalar()
    
    profit = Decimal(str(profit_query)) if profit_query else Decimal("0.00")

    # 4. Low Stock Alerts list (stock <= low_stock_alert)
    low_stock_items = db.query(models.Product).filter(
        models.Product.stock <= models.Product.low_stock_alert
    ).all()
    
    low_stock_alerts = [
        schemas.LowStockAlert(id=p.id, name=p.name, stock=p.stock)
        for p in low_stock_items
    ]

    # 5. 10 Recent Transactions
    recent_txs = db.query(models.Transaction).order_by(
        models.Transaction.id.desc()
    ).limit(10).all()

    recent_transactions = []
    for tx in recent_txs:
        # Get count of items in this transaction
        item_qty_sum = db.query(func.sum(models.TransactionItem.quantity)).filter(
            models.TransactionItem.transaction_id == tx.id
        ).scalar() or 0
        
        recent_transactions.append(
            schemas.RecentTransaction(
                id=tx.id,
                created_at=tx.created_at,
                items_count=int(item_qty_sum),
                total=tx.total
            )
        )

    return schemas.DashboardMetricsResponse(
        today_sales=today_sales,
        orders_count=orders_count,
        profit=profit,
        low_stock_alerts=low_stock_alerts,
        recent_transactions=recent_transactions
    )
