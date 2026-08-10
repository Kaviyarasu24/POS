from database import SessionLocal
import main
import schemas

def test_signup():
    db = SessionLocal()
    try:
        # 1. Test Joining existing store 'TGM-1001' with join code
        join_payload = schemas.UserCreate(
            owner_name="Priya Cashier",
            email_or_username="priya_cashier@tgm.com",
            password="Password123!",
            phone="+91 9988776655",
            store_id="TGM-1001",
            role="cashier"
        )
        
        # Remove if previously created from testing
        from models import User
        existing = db.query(User).filter(User.email_or_username == "priya_cashier@tgm.com").first()
        if existing:
            db.delete(existing)
            db.commit()

        user_res = main.signup(payload=join_payload, db=db)
        print(f"Join Store SUCCESS: User '{user_res.name}' created with role '{user_res.role}' in store '{user_res.shop_name}' ({user_res.store_id})")

        # 2. Test Store Verification endpoint
        verified = main.verify_store_join_code("TGM-1001", db=db)
        print(f"Store Verification SUCCESS: Verified store '{verified['name']}' ({verified['id']})")

    finally:
        db.close()

if __name__ == "__main__":
    test_signup()
