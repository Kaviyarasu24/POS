import requests
import json

BASE_URL = "http://localhost:8000"

def test_api():
    print("--- 1. Testing Store Products Retrieval (Store #1) ---")
    headers = {"X-Store-ID": "1", "X-User-ID": "1"}
    res = requests.get(f"{BASE_URL}/api/products", headers=headers)
    print(f"GET /api/products status: {res.status_code}")
    products = res.json()
    print(f"Loaded {len(products)} products for Store 1.")
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
    assert bill["store_id"] == 1, "Bill store_id should match store header"

    invoice_number = bill["invoice_number"]

    print(f"\n--- 3. Testing Get Bill by Invoice Number: {invoice_number} ---")
    bill_res = requests.get(f"{BASE_URL}/api/bills/{invoice_number}", headers=headers)
    print(f"GET /api/bills/{invoice_number} status: {bill_res.status_code}")
    retrieved_bill = bill_res.json()
    assert retrieved_bill["invoice_number"] == invoice_number

    print("\n--- 4. Testing Dashboard Metrics for Store 1 ---")
    dash_res = requests.get(f"{BASE_URL}/api/dashboard", headers=headers)
    print(f"GET /api/dashboard status: {dash_res.status_code}")
    dash_data = dash_res.json()
    print("Dashboard Data:")
    print(json.dumps(dash_data, indent=2))
    assert dash_data["orders_count"] >= 1

    print("\n--- 5. Testing Adding Staff User to Store 1 ---")
    staff_payload = {
        "name": "Priya Cashier",
        "email_or_username": "priya.cashier@tgm.com",
        "password": "password123",
        "role": "cashier",
        "phone": "+91 9123456780"
    }
    staff_res = requests.post(f"{BASE_URL}/api/stores/1/staff", json=staff_payload, headers=headers)
    print(f"POST /api/stores/1/staff status: {staff_res.status_code}")
    if staff_res.status_code == 201:
        staff_data = staff_res.json()
        print(f"Created staff user: {staff_data['name']} (ID: {staff_data['id']}, Store: {staff_data['store_id']})")
    elif staff_res.status_code == 400:
        print("Staff user already exists (idempotent test pass).")

    print("\nAll database structure, composite PK, and bill generator API tests PASSED successfully!")

if __name__ == "__main__":
    test_api()
