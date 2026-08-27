import requests
import json

BASE_URL = "http://localhost:8000"

# Demo credentials seeded by schema.sql. The demo password is stored as a legacy
# SHA-256 hash and transparently upgraded to bcrypt on the first successful login.
DEMO_STORE_ID = "DEMO-1001"
DEMO_LOGIN = {"email_or_username": "owner@example.com", "password": "password"}


def get_auth_headers():
    """Log in as the demo owner and return Bearer-token auth headers.

    Auth is now JWT-based: identity (store_id / user_id) is derived server-side
    from the verified token, replacing the old X-Store-ID / X-User-ID headers.
    """
    res = requests.post(f"{BASE_URL}/api/login", json=DEMO_LOGIN)
    assert res.status_code == 200, f"Login failed ({res.status_code}): {res.text}"
    token = res.json().get("token")
    assert token, "Login response did not include a token"
    return {"Authorization": f"Bearer {token}"}


def test_api():
    print("--- 0. Testing that protected endpoints reject unauthenticated requests ---")
    unauth = requests.get(f"{BASE_URL}/api/products")
    print(f"GET /api/products (no token) status: {unauth.status_code}")
    assert unauth.status_code == 401, "Protected endpoint must return 401 without a token"

    headers = get_auth_headers()

    print(f"\n--- 1. Testing Store Products Retrieval (Store '{DEMO_STORE_ID}') ---")
    res = requests.get(f"{BASE_URL}/api/products", headers=headers)
    print(f"GET /api/products status: {res.status_code}")
    products = res.json()
    print(f"Loaded {len(products)} products for Store {DEMO_STORE_ID}.")
    assert len(products) > 0, "Store products list should not be empty"

    print("\n--- 2. Testing Checkout & Bill Generation with Composite PK (store_id, invoice_number) ---")
    first_product = products[0]
    checkout_payload = {
        "subtotal": 10.00,
        "discount": 1.00,
        "tax": 0.72,
        "total": 9.72,
        "payment_method": "CASH",
        "payment_status": "PAID",
        "items": [
            {
                "product_id": first_product["id"],
                "quantity": 1,
                "price": first_product["price"]
            }
        ]
    }
    checkout_res = requests.post(f"{BASE_URL}/api/checkout", json=checkout_payload, headers=headers)
    print(f"POST /api/checkout status: {checkout_res.status_code}")
    bill = checkout_res.json()
    print("Generated Bill Payload:")
    print(json.dumps(bill, indent=2))

    assert "invoice_number" in bill, "Bill must contain invoice_number"
    assert bill["store_id"] == DEMO_STORE_ID, "Bill store_id should match the token's store"

    invoice_number = bill["invoice_number"]

    print(f"\n--- 3. Testing Get Bill by Invoice Number: {invoice_number} ---")
    bill_res = requests.get(f"{BASE_URL}/api/bills/{invoice_number}", headers=headers)
    print(f"GET /api/bills/{invoice_number} status: {bill_res.status_code}")
    retrieved_bill = bill_res.json()
    assert retrieved_bill["invoice_number"] == invoice_number
    assert retrieved_bill["store_id"] == DEMO_STORE_ID

    print(f"\n--- 4. Testing Dashboard Metrics for Store '{DEMO_STORE_ID}' ---")
    dash_res = requests.get(f"{BASE_URL}/api/dashboard", headers=headers)
    print(f"GET /api/dashboard status: {dash_res.status_code}")
    dash_data = dash_res.json()
    print("Dashboard Data:")
    print(json.dumps(dash_data, indent=2))
    assert dash_data["orders_count"] >= 1

    print(f"\n--- 5. Testing Adding Staff User to Store '{DEMO_STORE_ID}' ---")
    staff_payload = {
        "name": "Demo Staff",
        "email_or_username": "staff@example.com",
        "password": "password123",
        "role": "cashier",
        "phone": "+91 90000 00003"
    }
    staff_res = requests.post(f"{BASE_URL}/api/stores/{DEMO_STORE_ID}/staff", json=staff_payload, headers=headers)
    print(f"POST /api/stores/{DEMO_STORE_ID}/staff status: {staff_res.status_code}")
    if staff_res.status_code == 201:
        staff_data = staff_res.json()
        print(f"Created staff user: {staff_data['name']} (ID: {staff_data['id']}, Store: {staff_data['store_id']})")
        assert staff_data["store_id"] == DEMO_STORE_ID
    elif staff_res.status_code == 400:
        print("Staff user already exists (idempotent test pass).")

    print("\n--- 6. Testing New Store Registration & Alphanumeric Store ID Auto-Generation ---")
    signup_payload = {
        "shop_name": "Demo Greens Market",
        "owner_name": "Demo Owner Two",
        "shop_category": "Organic & Vegetables",
        "phone": "+91 90000 00004",
        "email_or_username": "owner2@example.com",
        "password": "securepassword",
        "business_address": "2 Demo Lane, Sample City"
    }
    signup_res = requests.post(f"{BASE_URL}/api/signup", json=signup_payload)
    print(f"POST /api/signup status: {signup_res.status_code}")
    if signup_res.status_code == 201:
        new_store_user = signup_res.json()
        print(f"Registered Store ID: {new_store_user['store_id']} for '{new_store_user['shop_name']}'")
        assert len(new_store_user["store_id"]) >= 6, "Auto-generated store_id should be 6-7 chars like DEMOXYZ"
    elif signup_res.status_code == 400:
        print("Store user already registered (idempotent test pass).")

    print("\n--- 7. Testing User Profile Image Update & Retrieval ---")
    avatar_payload = {
        "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP..."
    }
    update_res = requests.put(f"{BASE_URL}/api/users/1", json=avatar_payload, headers=headers)
    print(f"PUT /api/users/1 status: {update_res.status_code}")
    assert update_res.status_code == 200, "User update with image should succeed"
    assert update_res.json()["image"] == avatar_payload["image"], "Returned user must contain updated image"

    get_user_res = requests.get(f"{BASE_URL}/api/users/1", headers=headers)
    print(f"GET /api/users/1 status: {get_user_res.status_code}")
    assert get_user_res.status_code == 200
    assert get_user_res.json()["image"] == avatar_payload["image"], "Persisted image must match uploaded image"
    print("User profile image persistence verified successfully!")

    print("\nAll JWT-auth, alphanumeric VARCHAR store_id and profile image tests PASSED successfully!")

if __name__ == "__main__":
    test_api()
