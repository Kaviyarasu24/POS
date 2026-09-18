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
* **Status:** Open
* **Description:**
  In `react-native-web`, `Alert.alert` is implemented as an empty no-op function:
  ```js
  class Alert { static alert() {} }
  ```
  In `app/(tabs)/profile.tsx`, tapping **"Sign Out"** invokes `Alert.alert('Confirm Logout', ...)` with buttons.
* **Impact:** On Web, **the logout confirmation dialog never appears, and the user cannot sign out of their account**. In addition, error alerts and action prompts across the app fail silently on Web.
* **Fix:** Provide a cross-platform helper:
  ```ts
  if (Platform.OS === 'web') {
    if (window.confirm('Are you sure you want to log out from this device?')) {
      await store.logout();
      router.replace('/login');
    }
  } else {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out from this device?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await store.logout(); router.replace('/login'); } },
    ]);
  }
  ```

---

### 4. Excel/CSV Bulk Import Crashes on Web
* **File:** `app/(tabs)/products.tsx` (Lines 233–260)
* **Status:** Open
* **Description:**
  `products.tsx` uses `expo-file-system`'s `File` constructor:
  ```ts
  const buffer = await new File(uri).arrayBuffer();
  const fileContent = await new File(asset.uri).text();
  ```
  `expo-file-system` does not implement `new File().arrayBuffer()` or `.text()` on Web (its web module logs a warning and returns an empty stub).
* **Impact:** Selecting an `.xlsx` or `.csv` catalog file on Web throws:
  ```text
  TypeError: (new File(...)).arrayBuffer is not a function
  ```
* **Fix:** On Web, read the asset via standard browser `fetch` or `File` API:
  ```ts
  let buffer: ArrayBuffer;
  if (Platform.OS === 'web') {
    buffer = await (await fetch(asset.uri)).arrayBuffer();
  } else {
    buffer = await new File(asset.uri).arrayBuffer();
  }
  ```

---

### 5. Sales Report Export (CSV & PDF) Disabled / Non-Functional on Web
* **File:** `constants/export.ts` (Lines 34–53) & `app/reports.tsx` (Lines 214–244)
* **Status:** Open
* **Description:**
  `shareTextFile` and `shareHtmlAsPdf` return `null` if `Platform.OS === 'web'`. When `!uri` is returned, `reports.tsx` triggers `Alert.alert('Not Available', 'Sharing files is not supported on this platform.')` (which also does nothing on Web).
* **Impact:** Web users cannot export CSV or PDF sales reports.
* **Fix:** For Web, trigger a native browser file download using Blob URLs (consistent with the template download in `products.tsx`).

---

## 🛠️ Medium Severity (P2) — Business Logic & UI Flaws

### 6. Missing UI for Cash Received and Change Due in Billing Modal
* **File:** `app/(tabs)/billing.tsx` (Lines 439–446, 867–950)
* **Status:** Open
* **Description:**
  `billing.tsx` defines:
  ```ts
  const changeDue = (parseFloat(cashReceived) || 0) - cartTotals.total;
  ```
  and checks `paymentBlocked` against `cashReceived`. However, in the payment bottom sheet modal under the CASH payment mode, **no input field exists for `cashReceived`**, and `changeDue` is never rendered to the cashier.
* **Impact:** The cashier cannot input the cash amount received from the customer to see change due prior to generating the bill.
* **Fix:** Add a dedicated cash tender input section with quick cash chips (`Exact`, `+₹100`, `+₹500`, etc.) and a live change due indicator.

---

### 7. Unused `removeFromCart` (Missing Trash/Delete Button in Cart)
* **File:** `app/(tabs)/billing.tsx` (Lines 260–263, 681–710)
* **Status:** Open
* **Description:**
  `removeFromCart` is defined at line 260 but is never called or bound to any UI component.
* **Impact:** Cashiers must repeatedly click the minus button until quantity drops to 0 to remove an item from the cart, rather than tapping a delete/trash icon.
* **Fix:** Add a delete icon button next to each cart line item calling `removeFromCart(item.product.id)`.

---

### 8. Lexicographical Sorting Bug in Daily Invoice Number Generator
* **File:** `backend/main.py` (Lines 758–775)
* **Status:** Open
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
* **Status:** Open
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
- [ ] **Fix 3:** Add Web confirmation fallback for `Alert.alert` in `app/(tabs)/profile.tsx`.
- [ ] **Fix 4:** Update `app/(tabs)/products.tsx` bulk import to handle Web `fetch`/`Blob`.
- [ ] **Fix 5:** Implement browser file download in `constants/export.ts` for Web report export.
- [ ] **Fix 6:** Add cash received input & change due calculation display in `app/(tabs)/billing.tsx`.
- [ ] **Fix 7:** Add trash/delete item action in billing cart in `app/(tabs)/billing.tsx`.
- [ ] **Fix 8:** Fix invoice number sequence sorting in `backend/main.py`.
- [ ] **Fix 9:** Truncate SKU to 80 chars before soft-delete suffix in `backend/main.py`.
- [ ] **Fix 10:** Update WhatsApp receipt sharing to `https://wa.me/` and dynamic tax string.
- [ ] **Fix 11:** Verify price and checkout totals integrity in `backend/main.py`.
- [ ] **Fix 12:** Clean up 13 ESLint warnings across frontend files.
