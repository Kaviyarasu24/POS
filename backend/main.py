from fastapi import FastAPI, Depends, HTTPException, Query, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, date, time, timedelta
from decimal import Decimal
import hashlib
import re
import random
import string

import models
import schemas
from database import get_db, engine

# Create DB Tables if they don't exist yet (SQLAlchemy fallback)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SmartPOS API Backend", version="2.0.0")

# Enable CORS for all environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_store_id(store_name: str, db: Session) -> str:
    """Generate a clean full-character store identifier e.g. TGMPOS, TGMAEX, MARTABC (3-4 letters from shop name + 3 random uppercase letters)"""
    clean_prefix = re.sub(r'[^A-Z]', '', store_name.upper())[:4]
    if len(clean_prefix) < 3:
        clean_prefix = (clean_prefix + "STR")[:3]
    
    random_suffix = ''.join(random.choices(string.ascii_uppercase, k=3))
    candidate_id = f"{clean_prefix}{random_suffix}"
    while db.query(models.Store).filter(models.Store.id == candidate_id).first():
        random_suffix = ''.join(random.choices(string.ascii_uppercase, k=3))
        candidate_id = f"{clean_prefix}{random_suffix}"
    return candidate_id

def get_store_id(x_store_id: Optional[str] = Header(None)) -> str:
    if not x_store_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Store ID header missing (X-Store-ID)"
        )
    return str(x_store_id).strip()

def get_user_id(x_user_id: Optional[int] = Header(None)) -> Optional[int]:
    return x_user_id

# --- Auth & Store Management Endpoints ---

@app.get("/api/stores/verify/{store_id}")
def verify_store_join_code(store_id: str, db: Session = Depends(get_db)):
    clean_id = store_id.strip().upper()
    db_store = db.query(models.Store).filter(
        (models.Store.id == clean_id) | (models.Store.id == store_id.strip())
    ).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="No store found with this Join Code / Store ID")
    return {
        "id": db_store.id,
        "name": db_store.name,
        "category": db_store.category,
        "phone": db_store.phone
    }

@app.post("/api/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if username or email already exists across users
    existing_user = db.query(models.User).filter(
        models.User.email_or_username == payload.email_or_username.lower().strip()
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or Email already registered")

    # Case A: User is joining an existing store using Store ID / Join Code
    if payload.store_id and payload.store_id.strip():
        join_code = payload.store_id.strip()
        db_store = db.query(models.Store).filter(
            (models.Store.id == join_code.upper()) | (models.Store.id == join_code)
        ).first()
        if not db_store:
            raise HTTPException(
                status_code=404, 
                detail=f"Store not found with Join Code '{join_code}'. Please check with your store owner/manager."
            )

        assigned_role = (payload.role.lower().strip() if payload.role else "cashier")

        db_user = models.User(
            store_id=db_store.id,
            name=payload.owner_name.strip(),
            email_or_username=payload.email_or_username.lower().strip(),
            password=hash_password(payload.password),
            role=assigned_role,
            phone=payload.phone.strip() if payload.phone else None
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        return schemas.UserResponse(
            id=db_user.id,
            store_id=db_store.id,
            name=db_user.name,
            email_or_username=db_user.email_or_username,
            role=db_user.role,
            phone=db_user.phone,
            image=db_user.image,
            shop_name=db_store.name,
            shop_category=db_store.category,
            gst_number=db_store.gst_number,
            business_address=db_store.address,
            store_phone=db_store.phone
        )

    # Case B: User is registering a new Store
    if not payload.shop_name or not payload.shop_name.strip():
        raise HTTPException(status_code=400, detail="Shop Name is required to register a new store")
    if not payload.shop_category or not payload.shop_category.strip():
        raise HTTPException(status_code=400, detail="Shop Category is required to register a new store")

    # 1. Generate Alphanumeric Store ID & Create Store
    new_store_id = generate_store_id(payload.shop_name, db)
    db_store = models.Store(
        id=new_store_id,
        name=payload.shop_name.strip(),
        category=payload.shop_category.strip(),
        phone=payload.phone.strip(),
        email=payload.email_or_username.lower().strip(),
        gst_number=payload.gst_number.strip() if payload.gst_number else None,
        address=payload.business_address.strip() if payload.business_address else None
    )
    db.add(db_store)
    db.commit()
    db.refresh(db_store)

    # 2. Create Owner User linked to this Store
    db_user = models.User(
        store_id=db_store.id,
        name=payload.owner_name.strip(),
        email_or_username=payload.email_or_username.lower().strip(),
        password=hash_password(payload.password),
        role="owner",
        phone=payload.phone.strip()
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return schemas.UserResponse(
        id=db_user.id,
        store_id=db_store.id,
        name=db_user.name,
        email_or_username=db_user.email_or_username,
        role=db_user.role,
        phone=db_user.phone,
        image=db_user.image,
        shop_name=db_store.name,
        shop_category=db_store.category,
        gst_number=db_store.gst_number,
        business_address=db_store.address,
        store_phone=db_store.phone
    )

@app.post("/api/login", response_model=schemas.UserResponse)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        models.User.email_or_username == credentials.email_or_username.lower().strip()
    ).first()
    if not db_user or db_user.password != hash_password(credentials.password):
        raise HTTPException(status_code=401, detail="Invalid username/email or password")
    
    db_store = db.query(models.Store).filter(models.Store.id == db_user.store_id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store associated with this account not found")

    return schemas.UserResponse(
        id=db_user.id,
        store_id=db_store.id,
        name=db_user.name,
        email_or_username=db_user.email_or_username,
        role=db_user.role,
        phone=db_user.phone,
        image=db_user.image,
        shop_name=db_store.name,
        shop_category=db_store.category,
        gst_number=db_store.gst_number,
        business_address=db_store.address,
        store_phone=db_store.phone
    )

@app.post("/api/stores/{store_id}/staff", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def add_staff_user(
    store_id: str, 
    staff: schemas.StaffCreate, 
    x_store_id: str = Depends(get_store_id),
    db: Session = Depends(get_db)
):
    if store_id != x_store_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this store")
        
    existing_user = db.query(models.User).filter(
        models.User.email_or_username == staff.email_or_username.lower().strip()
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email is already in use")

    db_store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")

    db_user = models.User(
        store_id=store_id,
        name=staff.name.strip(),
        email_or_username=staff.email_or_username.lower().strip(),
        password=hash_password(staff.password),
        role=staff.role.lower().strip(),
        phone=staff.phone.strip() if staff.phone else None
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return schemas.UserResponse(
        id=db_user.id,
        store_id=store_id,
        name=db_user.name,
        email_or_username=db_user.email_or_username,
        role=db_user.role,
        phone=db_user.phone,
        image=db_user.image,
        shop_name=db_store.name,
        shop_category=db_store.category,
        gst_number=db_store.gst_number,
        business_address=db_store.address,
        store_phone=db_store.phone
    )

@app.get("/api/stores/{store_id}/staff", response_model=List[schemas.UserResponse])
def get_staff_users(
    store_id: str,
    x_store_id: str = Depends(get_store_id),
    db: Session = Depends(get_db)
):
    if store_id != x_store_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this store")
    
    db_store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")

    users = db.query(models.User).filter(models.User.store_id == store_id).all()
    return [
        schemas.UserResponse(
            id=u.id,
            store_id=u.store_id,
            name=u.name,
            email_or_username=u.email_or_username,
            role=u.role,
            phone=u.phone,
            image=u.image,
            shop_name=db_store.name,
            shop_category=db_store.category,
            gst_number=db_store.gst_number,
            business_address=db_store.address,
            store_phone=db_store.phone
        ) for u in users
    ]

@app.put("/api/stores/{store_id}", response_model=schemas.StoreResponse)
def update_store(
    store_id: str,
    updated_fields: schemas.StoreUpdate,
    x_store_id: str = Depends(get_store_id),
    db: Session = Depends(get_db)
):
    if store_id != x_store_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this store")

    db_store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")

    for key, value in updated_fields.model_dump(exclude_unset=True).items():
        setattr(db_store, key, value)

    db.commit()
    db.refresh(db_store)
    return db_store

@app.get("/api/users/{user_id}", response_model=schemas.UserResponse)
def get_user(
    user_id: int,
    x_store_id: str = Depends(get_store_id),
    db: Session = Depends(get_db)
):
    db_user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.store_id == x_store_id
    ).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found in this store")

    db_store = db.query(models.Store).filter(models.Store.id == x_store_id).first()
    return schemas.UserResponse(
        id=db_user.id,
        store_id=db_user.store_id,
        name=db_user.name,
        email_or_username=db_user.email_or_username,
        role=db_user.role,
        phone=db_user.phone,
        image=db_user.image,
        shop_name=db_store.name if db_store else None,
        shop_category=db_store.category if db_store else None,
        gst_number=db_store.gst_number if db_store else None,
        business_address=db_store.address if db_store else None,
        store_phone=db_store.phone if db_store else None
    )

@app.put("/api/users/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    updated_fields: schemas.UserUpdate,
    x_store_id: str = Depends(get_store_id),
    db: Session = Depends(get_db)
):
    db_user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.store_id == x_store_id
    ).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found in this store")

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

    db_store = db.query(models.Store).filter(models.Store.id == x_store_id).first()
    return schemas.UserResponse(
        id=db_user.id,
        store_id=db_user.store_id,
        name=db_user.name,
        email_or_username=db_user.email_or_username,
        role=db_user.role,
        phone=db_user.phone,
        image=db_user.image,
        shop_name=db_store.name if db_store else None,
        shop_category=db_store.category if db_store else None,
        gst_number=db_store.gst_number if db_store else None,
        business_address=db_store.address if db_store else None,
        store_phone=db_store.phone if db_store else None
    )

# --- Product Endpoints (Multi-tenant scoped by x_store_id) ---

@app.get("/api/products", response_model=List[schemas.ProductResponse])
def read_products(
    category: Optional[str] = Query(None),
    query: Optional[str] = Query(None),
    x_store_id: str = Depends(get_store_id),
    db: Session = Depends(get_db)
):
    q = db.query(models.Product).filter(models.Product.store_id == x_store_id)
    if category and category != "All Items":
        q = q.filter(models.Product.category == category)
    if query:
        search = f"%{query}%"
        q = q.filter(
            (models.Product.name.ilike(search)) | (models.Product.sku.ilike(search))
        )
    return q.order_by(models.Product.id.asc()).all()

@app.post("/api/products", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product: schemas.ProductCreate, 
    x_store_id: str = Depends(get_store_id),
    db: Session = Depends(get_db)
):
    existing = db.query(models.Product).filter(
        models.Product.sku == product.sku.upper(),
        models.Product.store_id == x_store_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU code already exists in your store catalog")
        
    db_product = models.Product(
        store_id=x_store_id,
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
    x_store_id: str = Depends(get_store_id),
    db: Session = Depends(get_db)
):
    db_product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.store_id == x_store_id
    ).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if updated_fields.sku and updated_fields.sku.upper() != db_product.sku:
        existing = db.query(models.Product).filter(
            models.Product.sku == updated_fields.sku.upper(),
            models.Product.store_id == x_store_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="SKU code already exists in your store catalog")
            
    for key, value in updated_fields.model_dump(exclude_unset=True).items():
        if key == "sku" and value:
            setattr(db_product, key, value.upper())
        else:
            setattr(db_product, key, value)
            
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/api/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    x_store_id: str = Depends(get_store_id),
    db: Session = Depends(get_db)
):
    db_product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.store_id == x_store_id
    ).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return None

@app.post("/api/products/{product_id}/restock", response_model=schemas.ProductResponse)
def restock_product(
    product_id: int,
    qty: int = Query(..., gt=0),
    x_store_id: str = Depends(get_store_id),
    db: Session = Depends(get_db)
):
    db_product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.store_id == x_store_id
    ).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db_product.stock += qty
    db.commit()
    db.refresh(db_product)
    return db_product

# --- Checkout & Bill Generator Endpoints (Composite Primary Key: store_id, invoice_number) ---

@app.post("/api/checkout", response_model=schemas.BillResponse, status_code=status.HTTP_201_CREATED)
def checkout(
    order: schemas.CheckoutSchema,
    x_store_id: str = Depends(get_store_id),
    x_user_id: Optional[int] = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    db_store = db.query(models.Store).filter(models.Store.id == x_store_id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")

    cashier_name = None
    if x_user_id:
        db_user = db.query(models.User).filter(models.User.id == x_user_id).first()
        if db_user:
            cashier_name = db_user.name

    # 1. Generate unique sequential invoice number per store for today
    today_str = datetime.now().strftime("%Y%m%d")
    today_count = db.query(models.Transaction).filter(
        models.Transaction.store_id == x_store_id,
        models.Transaction.invoice_number.like(f"INV-{today_str}-%")
    ).count()
    invoice_number = f"INV-{today_str}-{(today_count + 1):04d}"

    # 2. Create Transaction with Composite PK (store_id, invoice_number)
    db_transaction = models.Transaction(
        store_id=x_store_id,
        invoice_number=invoice_number,
        user_id=x_user_id,
        payment_method=order.payment_method.upper().strip(),
        payment_status=order.payment_status.upper().strip(),
        subtotal=order.subtotal,
        discount=order.discount,
        tax=order.tax,
        total=order.total
    )
    db.add(db_transaction)
    db.flush()

    # 3. Add Line Items & Decrement Stock
    bill_items = []
    for item in order.items:
        db_product = db.query(models.Product).filter(
            models.Product.id == item.product_id,
            models.Product.store_id == x_store_id
        ).first()
        if not db_product:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found in store catalog")
            
        if db_product.stock < item.quantity:
            db.rollback()
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock for {db_product.name}. Available: {db_product.stock}"
            )
            
        db_product.stock -= item.quantity
        
        db_item = models.TransactionItem(
            store_id=x_store_id,
            invoice_number=invoice_number,
            product_id=item.product_id,
            product_name=db_product.name,
            quantity=item.quantity,
            price=item.price
        )
        db.add(db_item)
        bill_items.append(schemas.TransactionItemResponse(
            product_id=item.product_id,
            product_name=db_product.name,
            quantity=item.quantity,
            price=item.price
        ))
        
    db.commit()

    return schemas.BillResponse(
        store_id=x_store_id,
        invoice_number=invoice_number,
        shop_name=db_store.name,
        shop_address=db_store.address,
        shop_phone=db_store.phone,
        gst_number=db_store.gst_number,
        cashier_name=cashier_name,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        subtotal=order.subtotal,
        discount=order.discount,
        tax=order.tax,
        total=order.total,
        created_at=datetime.now(),
        items=bill_items
    )

@app.get("/api/bills/{invoice_number}", response_model=schemas.BillResponse)
def get_bill(
    invoice_number: str,
    x_store_id: str = Depends(get_store_id),
    db: Session = Depends(get_db)
):
    db_transaction = db.query(models.Transaction).filter(
        models.Transaction.store_id == x_store_id,
        models.Transaction.invoice_number == invoice_number
    ).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Bill / Invoice not found")

    db_store = db.query(models.Store).filter(models.Store.id == x_store_id).first()
    
    cashier_name = None
    if db_transaction.user_id:
        cashier = db.query(models.User).filter(models.User.id == db_transaction.user_id).first()
        if cashier:
            cashier_name = cashier.name

    items = db.query(models.TransactionItem).filter(
        models.TransactionItem.store_id == x_store_id,
        models.TransactionItem.invoice_number == invoice_number
    ).all()

    return schemas.BillResponse(
        store_id=x_store_id,
        invoice_number=invoice_number,
        shop_name=db_store.name if db_store else "SmartPOS",
        shop_address=db_store.address if db_store else None,
        shop_phone=db_store.phone if db_store else None,
        gst_number=db_store.gst_number if db_store else None,
        cashier_name=cashier_name,
        payment_method=db_transaction.payment_method,
        payment_status=db_transaction.payment_status,
        subtotal=db_transaction.subtotal,
        discount=db_transaction.discount,
        tax=db_transaction.tax,
        total=db_transaction.total,
        created_at=db_transaction.created_at,
        items=[
            schemas.TransactionItemResponse(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product_name,
                quantity=item.quantity,
                price=item.price
            ) for item in items
        ]
    )

@app.get("/api/transactions", response_model=List[schemas.TransactionResponse])
def get_transactions(
    limit: int = Query(20, ge=1, le=100),
    x_store_id: str = Depends(get_store_id),
    db: Session = Depends(get_db)
):
    transactions = db.query(models.Transaction).filter(
        models.Transaction.store_id == x_store_id
    ).order_by(models.Transaction.created_at.desc()).limit(limit).all()

    result = []
    for tx in transactions:
        items = db.query(models.TransactionItem).filter(
            models.TransactionItem.store_id == x_store_id,
            models.TransactionItem.invoice_number == tx.invoice_number
        ).all()
        result.append(schemas.TransactionResponse(
            store_id=tx.store_id,
            invoice_number=tx.invoice_number,
            payment_method=tx.payment_method,
            subtotal=tx.subtotal,
            discount=tx.discount,
            tax=tx.tax,
            total=tx.total,
            created_at=tx.created_at,
            items=[
                schemas.TransactionItemResponse(
                    id=item.id,
                    product_id=item.product_id,
                    product_name=item.product_name,
                    quantity=item.quantity,
                    price=item.price
                ) for item in items
            ]
        ))
    return result

# --- Dashboard Analytics Endpoints ---

@app.get("/api/dashboard", response_model=schemas.DashboardMetricsResponse)
def get_dashboard_metrics(
    x_store_id: str = Depends(get_store_id),
    db: Session = Depends(get_db)
):
    today = date.today()
    start_today = datetime.combine(today, time.min)
    end_today = datetime.combine(today, time.max)

    # 1. Today's Sales total sum for this store
    today_sales_query = db.query(func.sum(models.Transaction.total)).filter(
        models.Transaction.store_id == x_store_id,
        models.Transaction.created_at >= start_today,
        models.Transaction.created_at <= end_today
    ).scalar()
    today_sales = Decimal(str(today_sales_query)) if today_sales_query else Decimal("0.00")

    # 1b. Yesterday's Sales total sum for comparison
    yesterday = today - timedelta(days=1)
    start_yesterday = datetime.combine(yesterday, time.min)
    end_yesterday = datetime.combine(yesterday, time.max)

    yesterday_sales_query = db.query(func.sum(models.Transaction.total)).filter(
        models.Transaction.store_id == x_store_id,
        models.Transaction.created_at >= start_yesterday,
        models.Transaction.created_at <= end_yesterday
    ).scalar()
    yesterday_sales = Decimal(str(yesterday_sales_query)) if yesterday_sales_query else Decimal("0.00")

    if yesterday_sales > Decimal("0.00"):
        sales_growth_percentage = float(round(((today_sales - yesterday_sales) / yesterday_sales) * Decimal("100.0"), 1))
    elif today_sales > Decimal("0.00"):
        sales_growth_percentage = 100.0
    else:
        sales_growth_percentage = 0.0

    # 2. Orders Count today for this store
    orders_count = db.query(models.Transaction).filter(
        models.Transaction.store_id == x_store_id,
        models.Transaction.created_at >= start_today,
        models.Transaction.created_at <= end_today
    ).count()

    # 3. Calculate Today's Profit for this store: sum(sales_price - cost_price * quantity)
    profit_query = db.query(
        func.sum((models.TransactionItem.price - models.Product.cost_price) * models.TransactionItem.quantity)
    ).join(
        models.Transaction,
        (models.Transaction.store_id == models.TransactionItem.store_id) & 
        (models.Transaction.invoice_number == models.TransactionItem.invoice_number)
    ).join(
        models.Product, models.Product.id == models.TransactionItem.product_id
    ).filter(
        models.Transaction.store_id == x_store_id,
        models.Transaction.created_at >= start_today,
        models.Transaction.created_at <= end_today
    ).scalar()
    profit = Decimal(str(profit_query)) if profit_query else Decimal("0.00")

    # 4. Low stock alerts
    low_stock = db.query(models.Product).filter(
        models.Product.store_id == x_store_id,
        models.Product.stock <= models.Product.low_stock_alert
    ).order_by(models.Product.stock.asc()).limit(5).all()

    low_stock_alerts = [
        schemas.LowStockAlert(id=p.id, name=p.name, stock=p.stock, unit=p.unit or "pcs")
        for p in low_stock
    ]

    # 5. Recent transactions
    recent_txs = db.query(models.Transaction).filter(
        models.Transaction.store_id == x_store_id
    ).order_by(models.Transaction.created_at.desc()).limit(5).all()

    recent_transactions = []
    for tx in recent_txs:
        items_count = db.query(func.sum(models.TransactionItem.quantity)).filter(
            models.TransactionItem.store_id == x_store_id,
            models.TransactionItem.invoice_number == tx.invoice_number
        ).scalar() or 0
        recent_transactions.append(
            schemas.RecentTransaction(
                store_id=tx.store_id,
                invoice_number=tx.invoice_number,
                created_at=tx.created_at,
                items_count=int(items_count),
                total=tx.total,
                payment_method=tx.payment_method
            )
        )

    # 6. Weekly sales trend (last 7 days)
    weekly_trend = []
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        start_d = datetime.combine(target_date, time.min)
        end_d = datetime.combine(target_date, time.max)
        day_sales_query = db.query(func.sum(models.Transaction.total)).filter(
            models.Transaction.store_id == x_store_id,
            models.Transaction.created_at >= start_d,
            models.Transaction.created_at <= end_d
        ).scalar()
        day_amt = Decimal(str(day_sales_query)) if day_sales_query else Decimal("0.00")
        weekly_trend.append(
            schemas.DailySalesTrend(
                day=target_date.strftime("%a"),
                date=target_date.isoformat(),
                amount=day_amt
            )
        )

    return schemas.DashboardMetricsResponse(
        today_sales=today_sales,
        yesterday_sales=yesterday_sales,
        sales_growth_percentage=sales_growth_percentage,
        orders_count=orders_count,
        profit=profit,
        low_stock_alerts=low_stock_alerts,
        recent_transactions=recent_transactions,
        weekly_trend=weekly_trend
    )
