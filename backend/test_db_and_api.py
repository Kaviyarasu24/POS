import requests
import json

BASE_URL = "http://localhost:8000"

def test_api():
    print("--- 1. Testing Store Products Retrieval (Store 'TGM-1001') ---")
    headers = {"X-Store-ID": "TGM-1001", "X-User-ID": "1"}
    res = requests.get(f"{BASE_URL}/api/products", headers=headers)
    print(f"GET /api/products status: {res.status_code}")
    products = res.json()
    print(f"Loaded {len(products)} products for Store TGM-1001.")
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
    assert bill["store_id"] == "TGM-1001", "Bill store_id should match alphanumeric store header"

    invoice_number = bill["invoice_number"]

    print(f"\n--- 3. Testing Get Bill by Invoice Number: {invoice_number} ---")
    bill_res = requests.get(f"{BASE_URL}/api/bills/{invoice_number}", headers=headers)
    print(f"GET /api/bills/{invoice_number} status: {bill_res.status_code}")
    retrieved_bill = bill_res.json()
    assert retrieved_bill["invoice_number"] == invoice_number
    assert retrieved_bill["store_id"] == "TGM-1001"

    print("\n--- 4. Testing Dashboard Metrics for Store 'TGM-1001' ---")
    dash_res = requests.get(f"{BASE_URL}/api/dashboard", headers=headers)
    print(f"GET /api/dashboard status: {dash_res.status_code}")
    dash_data = dash_res.json()
    print("Dashboard Data:")
    print(json.dumps(dash_data, indent=2))
    assert dash_data["orders_count"] >= 1

    print("\n--- 5. Testing Adding Staff User to Store 'TGM-1001' ---")
    staff_payload = {
        "name": "Priya Cashier",
        "email_or_username": "priya.cashier@tgm.com",
        "password": "password123",
        "role": "cashier",
        "phone": "+91 9123456780"
    }
    staff_res = requests.post(f"{BASE_URL}/api/stores/TGM-1001/staff", json=staff_payload, headers=headers)
    print(f"POST /api/stores/TGM-1001/staff status: {staff_res.status_code}")
    if staff_res.status_code == 201:
        staff_data = staff_res.json()
        print(f"Created staff user: {staff_data['name']} (ID: {staff_data['id']}, Store: {staff_data['store_id']})")
        assert staff_data["store_id"] == "TGM-1001"
    elif staff_res.status_code == 400:
        print("Staff user already exists (idempotent test pass).")

    print("\n--- 6. Testing New Store Registration & Alphanumeric Store ID Auto-Generation ---")
    signup_payload = {
        "shop_name": "Organic Greens Market",
        "owner_name": "Ravi Kumar",
        "shop_category": "Organic & Vegetables",
        "phone": "+91 9876543211",
        "email_or_username": "ravi.organic@gmail.com",
        "password": "securepassword",
        "business_address": "45 Farmer Lane, Coimbatore"
    }
    signup_res = requests.post(f"{BASE_URL}/api/signup", json=signup_payload)
    print(f"POST /api/signup status: {signup_res.status_code}")
    if signup_res.status_code == 201:
        new_store_user = signup_res.json()
        print(f"Registered Store ID: {new_store_user['store_id']} for '{new_store_user['shop_name']}'")
        assert "-" in new_store_user["store_id"], "Auto-generated store_id should have alphanumeric format like ORGA-XXXX"
    elif signup_res.status_code == 400:
        print("Store user already registered (idempotent test pass).")

    print("\nAll alphanumeric VARCHAR store_id tests PASSED successfully!")

if __name__ == "__main__":
    test_api()
