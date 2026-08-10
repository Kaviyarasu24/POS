from database import SessionLocal
import main
import schemas

def test_api():
    db = SessionLocal()
    try:
        # 1. Test get_global_products
        items = main.get_global_products(query=None, category=None, brand=None, is_active=1, skip=0, limit=100, db=db)
        print(f"1. get_global_products SUCCESS: {len(items)} master items found.")
        for item in items[:3]:
            print(f"   * [{item.barcode}] {item.name} | Brand: {item.brand} | Default Price: ${item.default_price}")

        # 2. Test barcode lookup
        item = main.get_global_product_by_barcode(barcode="APP-1001", db=db)
        print(f"2. Barcode lookup SUCCESS: Found {item.name} (ID: {item.id}, Brand: {item.brand})")

        # 3. Test Store products fetch
        store_items = main.read_products(category=None, query=None, x_store_id="TGM-1001", db=db)
        print(f"3. Store products fetch SUCCESS: {len(store_items)} store items found.")
        first = store_items[0]
        print(f"   * Store Item: {first.name} | SKU: {first.sku} | Global ID: {first.global_product_id} | Brand: {first.brand}")

        print("\nALL GLOBAL PRODUCT TESTS PASSED SUCCESSFULLY!")
    finally:
        db.close()

if __name__ == "__main__":
    test_api()
