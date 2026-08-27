from database import SessionLocal
import main
import schemas

# Demo store seeded by schema.sql.
DEMO_STORE_ID = "DEMO-1001"

def test_signup():
    db = SessionLocal()
    try:
        # 1. Test Joining existing demo store with its join code (store_id).
        #    signup() is a public endpoint, so no auth token is required here.
        join_payload = schemas.UserCreate(
            owner_name="Demo Staff",
            email_or_username="staff_join@example.com",
            password="Password123!",
            phone="+91 90000 00005",
            store_id=DEMO_STORE_ID,
            role="cashier"
        )

        # Remove if previously created from testing
        from models import User
        existing = db.query(User).filter(User.email_or_username == "staff_join@example.com").first()
        if existing:
            db.delete(existing)
            db.commit()

        user_res = main.signup(payload=join_payload, db=db)
        print(f"Join Store SUCCESS: User '{user_res.name}' created with role '{user_res.role}' in store '{user_res.shop_name}' ({user_res.store_id})")

        # 2. Test Store Verification endpoint
        verified = main.verify_store_join_code(DEMO_STORE_ID, db=db)
        print(f"Store Verification SUCCESS: Verified store '{verified['name']}' ({verified['id']})")

    finally:
        db.close()

if __name__ == "__main__":
    test_signup()
