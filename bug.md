# 🐛 SmartPOS — Comprehensive Bug & Issue Report

This document details all bugs, critical failure points, platform compatibility issues, and code smells identified across the SmartPOS codebase (React Native / Expo frontend & FastAPI backend).

---

## 📑 Table of Contents
1. [🚨 Critical Severity (P0) — Data Loss & Deployment Blockers](#-critical-severity-p0--data-loss--deployment-blockers)
2. [⚠️ High Severity (P1) — Platform Compatibility & Broken Core Features](#️-high-severity-p1--platform-compatibility--broken-core-features)
3. [🛠️ Medium Severity (P2) — Business Logic & UI Flaws](#️-medium-severity-p2--business-logic--ui-flaws)
4. [🧹 Low Severity (P3) — Code Quality & Linter Warnings](#-low-severity-p3--code-quality--linter-warnings)
5. [📋 Resolution Checklist](#-resolution-checklist)

---

## 🚨 Critical Severity (P0) — Data Loss & Deployment Blockers

### 1. Cascading Deletion of Historical Sales Line Items on Product Deletion
* **File:** `backend/models.py` (Line 98) & `backend/main.py` (Lines 703–715)
* **Status:** Resolved
* **Description:**
  In `models.py`, `TransactionItem.product_id` is declared with `ForeignKey("products.id", ondelete="CASCADE")`:
  ```python
  product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
  ```
  When a product is deleted (or when `/api/products/clear-all` runs `db.delete(p)`), the database cascades this deletion to all `TransactionItem` records referencing that product across **all historical customer invoices**.
* **Impact:** **Catastrophic financial & sales audit data loss.** Past customer bills, receipts, and accounting reports permanently lose their line items.
* **Fix:** Change `TransactionItem.product_id` to either `ondelete="RESTRICT"` or `nullable=True` with `ondelete="SET NULL"` so that deleting or modifying the catalog preserves historical transaction line items:
  ```python
  product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
  ```

---

### 2. Missing PostgreSQL Driver (`psycopg2-binary`) in `backend/requirements.txt`
* **File:** `backend/requirements.txt` (Lines 1–10) & `deployment.md` (Lines 9–13, 69–71)
* **Status:** Won't Fix / N/A (Using MySQL Database)
* **Description:**
  The production deployment guide documented running PostgreSQL on Render (`DATABASE_URL=postgres://...`).
* **Note:**
  The project is configured for and exclusively uses MySQL (`pymysql==1.1.0` and `cryptography==42.0.5` are already present in `backend/requirements.txt`). PostgreSQL driver is not required.


---

## ⚠️ High Severity (P1) — Platform Compatibility & Broken Core Features

### 3. `Alert.alert` is a No-Op on Web (`react-native-web`) — User Cannot Log Out
* **File:** `app/(tabs)/profile.tsx` (Lines 321–337), `app/reports.tsx`, `app/customers.tsx`, `app/transactions.tsx`, `app/(tabs)/billing.tsx`
* **Status:** Won't Fix / N/A (Application is targetted strictly for Mobile APK)
* **Note:** The app is deployed as a native Android APK where `Alert.alert` displays the native OS confirmation dialog correctly.

---

### 4. Excel/CSV Bulk Import Crashes on Web
* **File:** `app/(tabs)/products.tsx` (Lines 233–260)
* **Status:** Won't Fix / N/A (Application is targetted strictly for Mobile APK)
* **Note:** On native mobile (APK), `expo-file-system` `new File(uri).arrayBuffer()` is fully supported.

---

### 5. Sales Report Export (CSV & PDF) Disabled / Non-Functional on Web
* **File:** `constants/export.ts` (Lines 34–53) & `app/reports.tsx` (Lines 214–244)
* **Status:** Won't Fix / N/A (Application is targetted strictly for Mobile APK)
* **Note:** On native mobile (APK), `expo-sharing` and `expo-print` utilize the native Android share sheet and print service.

---

## 🛠️ Medium Severity (P2) — Business Logic & UI Flaws

### 6. Missing UI for Cash Received and Change Due in Billing Modal
* **File:** `app/(tabs)/billing.tsx` (Lines 439–446, 867–950)
* **Status:** Won't Fix / Not Needed (User preference: straightforward cash checkout without tender entry)

---

### 7. Unused `removeFromCart` (Missing Trash/Delete Button in Cart)
* **File:** `app/(tabs)/billing.tsx` (Lines 260–263, 681–710)
* **Status:** Resolved
* **Description:**
  Added a trash/delete button (`delete-outline`) calling `removeFromCart(item.product.id)` on each cart line item.

---

### 8. Lexicographical Sorting Bug in Daily Invoice Number Generator
* **File:** `backend/main.py` (Lines 758–775)
* **Status:** Resolved
* **Description:**
  ```python
  latest_inv = db.query(models.Transaction.invoice_number).filter(
      models.Transaction.store_id == store_id,
      models.Transaction.invoice_number.like(f"{prefix}%")
  ).order_by(models.Transaction.invoice_number.desc()).first()
  ```
  `invoice_number` is a string column. In lexicographical order:
  `"INV-20260918-10000" < "INV-20260918-9999"`.
* **Impact:** Once a store passes 9,999 transactions in a single day, the generator will repeatedly pick `9999` and try to generate `10000`, causing repeated `409 CONFLICT` collisions and blocking checkout.
* **Fix:** Order by string length first:
  ```python
  .order_by(func.length(models.Transaction.invoice_number).desc(), models.Transaction.invoice_number.desc())
  ```

---

### 9. SKU Column Length Overflow on Soft Delete
* **File:** `backend/main.py` (Lines 730–735) & `backend/models.py` (Line 46)
* **Status:** Resolved
* **Description:**
  `Product.sku` is defined as `String(100)`. Soft deletion appends `#DEL_<unix_timestamp>`:
  ```python
  db_product.sku = f"{db_product.sku}#DEL_{timestamp_suffix}"
  ```
* **Impact:** If a product's SKU is 90+ characters, appending `#DEL_1715000000` (15 characters) exceeds 100 characters and throws `DataError: value too long for type character varying(100)`.
* **Fix:** Truncate before appending:
  ```python
  db_product.sku = f"{db_product.sku[:80]}#DEL_{timestamp_suffix}"
  ```

---

### 10. WhatsApp Direct Share Fails on iOS & Hardcoded Tax Rate
* **File:** `app/transactions.tsx` (Lines 195, 225, 231–242) & `app.json`
* **Status:** Open
* **Description:**
  1. `transactions.tsx` uses `whatsapp://send?text=...`. On iOS, `Linking.canOpenURL('whatsapp://')` returns `false` unless `whatsapp` is registered in `LSApplicationQueriesSchemes` in `app.json`.
  2. The universal web URL `https://wa.me/${phone}?text=${encoded}` works across web, Android, and iOS without URL scheme restrictions.
  3. The receipt text hardcodes `Tax (GST 8%):` even though products can have other tax rates (0%, 5%, 12%, 18%, 28%).
* **Fix:** Use `https://wa.me/` and calculate the effective tax percentage dynamically.

---

### 11. Checkout Price & Total Verification Missing on Backend
* **File:** `backend/main.py` (Lines 778–880)
* **Status:** Open
* **Description:**
  `/api/checkout` directly trusts client-supplied values for item price, subtotal, discount, tax, and total without server-side verification that `subtotal - discount + tax == total` or that item prices match the active catalog.
* **Impact:** Staff or external API callers can submit arbitrarily discounted or zero-dollar sales.
* **Fix:** Recalculate or validate totals and prices against the database catalog server-side.

---

## 🧹 Low Severity (P3) — Code Quality & Linter Warnings

### 12. ESLint Warnings & Unused Imports
* **`app/(tabs)/billing.tsx`:**
  - Line 260: `'removeFromCart' is assigned a value but never used`
  - Line 439: `'changeDue' is assigned a value but never used`
* **`app/(tabs)/products.tsx`:**
  - Lines 9, 12: `'ScrollView'` and `'RefreshControl'` defined but never used
* **`app/add_product.tsx`:**
  - Line 254: `'err'` defined but never used
* **`app/login.tsx`:**
  - Lines 26, 43: `'SCREEN_WIDTH'`, `'AnimatedMaterialIcon'` unused
  - Line 143: React Hook `useEffect` missing dependencies: `fadeContent`, `fadeHeader`, `translateContentY`, `translateHeaderY`
* **`app/signup.tsx`:**
  - Lines 26, 107, 182: `'SCREEN_WIDTH'`, `'theme'`, and error param `'e'` unused
* **`app/transactions.tsx`:**
  - Lines 24, 52: `'SCREEN_WIDTH'`, and error param `'e'` unused

---

## 📋 Resolution Checklist

- [x] **Fix 1:** Change `ForeignKey("products.id", ondelete="CASCADE")` to `ondelete="SET NULL"` in `backend/models.py`.
- [x] **Fix 2:** N/A — Using MySQL (`pymysql` and `cryptography` already configured in `backend/requirements.txt`).
- [x] **Fix 3:** N/A — Mobile APK only (`Alert.alert` works natively on Android).
- [x] **Fix 4:** N/A — Mobile APK only (`expo-file-system` works natively on Android).
- [x] **Fix 5:** N/A — Mobile APK only (`expo-sharing` & `expo-print` work natively on Android).
- [x] **Fix 6:** N/A — Not needed (straightforward cash checkout without tender entry).
- [x] **Fix 7:** Add trash/delete item action in billing cart in `app/(tabs)/billing.tsx`.
- [x] **Fix 8:** Fix invoice number sequence sorting in `backend/main.py`.
- [x] **Fix 9:** Truncate SKU to 80 chars before soft-delete suffix in `backend/main.py`.
- [ ] **Fix 10:** Update WhatsApp receipt sharing to `https://wa.me/` and dynamic tax string.
- [ ] **Fix 11:** Verify price and checkout totals integrity in `backend/main.py`.
- [ ] **Fix 12:** Clean up 13 ESLint warnings across frontend files.
