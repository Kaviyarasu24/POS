-- Recreate database
CREATE DATABASE IF NOT EXISTS smartpossystem;
USE smartpossystem;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS transaction_items;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS stores;

-- 1. Create stores table (id is VARCHAR alphanumeric)
CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NULL,
    gst_number VARCHAR(100) NULL,
    address TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create users table (multiple users/cashiers per store)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email_or_username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'cashier',
    phone VARCHAR(50) NULL,
    image TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

-- 3. Create products table (multi-tenant per store)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2) NOT NULL,
    stock DECIMAL(10, 3) NOT NULL DEFAULT 0.000,
    low_stock_alert DECIMAL(10, 3) NOT NULL DEFAULT 5.000,
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(50) DEFAULT 'pcs',
    tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 8.00,
    image TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    UNIQUE KEY unique_store_sku (store_id, sku)
);

-- 4. Create transactions table (Composite Primary Key: store_id, invoice_number)
CREATE TABLE IF NOT EXISTS transactions (
    store_id VARCHAR(100) NOT NULL,
    invoice_number VARCHAR(100) NOT NULL,
    user_id INT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'CASH',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PAID',
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (store_id, invoice_number),
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Create transaction_items table (Composite Foreign Key: store_id, invoice_number)
CREATE TABLE IF NOT EXISTS transaction_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id VARCHAR(100) NOT NULL,
    invoice_number VARCHAR(100) NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 3) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (store_id, invoice_number) REFERENCES transactions(store_id, invoice_number) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Seed Default Store (ID = 'DEMO-1001')
INSERT INTO stores (id, name, category, phone, email, gst_number, address)
VALUES ('DEMO-1001', 'Demo Supermart', 'Retail & Grocery', '+91 90000 00000', 'demo@example.com', '00AAAAA0000A1Z0', '1 Demo Street, Sample City, 000001')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Store Owner and Cashier Users
-- Demo password for both accounts: "password"
-- Stored as a legacy SHA-256 hash on purpose: the backend verifies it and
-- transparently re-hashes to bcrypt on the first successful login (see verify_password in main.py).
INSERT INTO users (id, store_id, name, email_or_username, password, role, phone)
VALUES
(1, 'DEMO-1001', 'Demo Owner', 'owner@example.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'owner', '+91 90000 00001'),
(2, 'DEMO-1001', 'Demo Cashier', 'cashier@example.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'cashier', '+91 90000 00002')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Initial Catalog for Store 'DEMO-1001'
INSERT INTO products (store_id, name, sku, price, cost_price, stock, low_stock_alert, category, unit, tax_rate, image)
VALUES
('DEMO-1001', 'Organic Red Apples', 'APP-1001', 2.99, 1.50, 142, 10, 'Grocery', 'lb', 8.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7Yv43gGyBrKPnc0srxcs5O03zMXz-kw6ik4_yGC9vLV0HpZ-DtXrmoqJoZ-RVFG83qRIFt1v8J5pcGPem1sa0aBpIAkuBFtLldhxByyecMfmiFpVduKdE0EEGiDt8ujZaKP_8Y2Wrn24FG4W7_ybunWjQx6wxkOkfQ3w61Mn2jjVLLuCJosYlkzfue6upEIqLJHudITp58a71o2d_cNpwwWkAblqsDdAPwFtn_Q0hTDNYkoGOQuT9Vg'),
('DEMO-1001', 'Premium Dark Chocolate', 'CHC-8092', 4.50, 2.00, 56, 5, 'Snacks', NULL, 8.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcjJoa_Zd04PJFBlQNgfFIaDRlfTxM2JpcwdEqdGmx0RVcEp4OZRx1nNZRDblw3DpbJSDbSde8QpAeDIVunwmBIeIkQB2RX5vCRUst99bnd7EvjX31OB0V8-IYXkHZ1pjrjBog3EcE4z0gS3quC8ZLdfE_dtWlzKj3qWzDqsFVN2nGtBHm3qOhlLgAABZZrWIEFa044t_7pSjp_qSyAfRJCIUO3Khq_Cvjegnz31bPqQp5b0Q_sFQOVA'),
('DEMO-1001', 'Sparkling Spring Water', 'BEV-2201', 1.25, 0.50, 8, 10, 'Beverages', NULL, 8.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBznE2CZzBvkdpUgXw3R5l-fH_KSpOwInC0SmgXoOwDitZLjvqbHyOsezACGSROCb7jbnbJy5KViR7dcFf_3nloXK705mflV0iGb1_FpfWc4N3A6_2tQVl1E8UX9CKUojYAIZxOe1f5dOGhUIAPGJo0ggcgd7D7hhpFmHWaaeYhU0cMNuQCQPFmD7DBBI-ojIIuhFiuQw5Wl-xDA04_viCwIqCbCqfTgG4UHInY0n19mEL-ADWLbg9Cyw'),
('DEMO-1001', 'Artisan Sourdough Loaf', 'BAK-0045', 5.00, 2.50, 0, 5, 'Grocery', NULL, 8.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-I0YlupUZeAa1MceqEGvWcr6StURpq5EZrBS63mYwhe-xKfcxpdTD2FSPt9u4-1StjeQRsFn5BQUdr_eMxsJI2t2V8a9ld6UGyMqTF0QPN-jhKZZginZnPfggx_ialJi7KZJWXlYZrIpCjuh2CLhE-miTP9AqxPs85dL7eghROJ3eDDuuMzpsF_ZukBAt3nCnHVTpLHmyom6-HanHNMZAMJAcl5t-26uOGJgLI64MCl3abMa7FxiLAg'),
('DEMO-1001', 'Organic Bananas Bunch', 'FRU-9921', 1.99, 0.80, 85, 15, 'Grocery', 'ea', 8.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzwe9ikzT25B_qRuKo0FCxckifDsnHJEGEdyP9DuKwtFxPW2baYpTEVcjGvECg6sdRdHnPUykFm3cFrh8gh2CW_jdwh9Okx2GX0-CfJC48-FbsvMJH1Db5gGYuR6KcnMxW6zH4IK7M49vd3fOnf3TRY58TGpQVJ-pa-nEbjlN_gza5HtKDYtUtL4jz-TZkytZSVACGdO2KLvlGnTCVT2GuF-QsrzE2N_OBHbcxUludBVK6kuT41DsVkw'),
('DEMO-1001', 'Ceramic Mug - White', 'CM-WHT-01', 12.00, 5.00, 85, 10, 'Apparel', NULL, 8.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1LekN-jkmiYWqgvtWR1FLYpJCzpgQyov2zYLrLtIE9oeqYrNYqOJI1rV0CMfR6hIRBrCQzxmmTJY7vTrAMDOzqPTodg59Gm9iFnJhNPt_qupMoVWmex9P92Uq2rzacRWYiAFBNjH70zPowM0xk1kt2XQFmvLINML7BpcWTIGGIoW74splBp3Tu99f79kiSjlnCdyT_Yr1rUkIz3AIJOA_pRGynoIjFOIShHZUWfSGP9n-f3I5wGakTQ'),
('DEMO-1001', 'Artisan Coffee Beans 500g', 'CB-ART-500', 14.99, 7.00, 4, 5, 'Beverages', NULL, 8.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPOUvDOKaK81hCABlsg5y5SlL9vARP47Xr_jxEh3--ahaORPeZgVkKc349TJX6OW65d1-1QB2qvTmk0963wx2vQbt3RkODToh8SofzzhlRXCll94Ywu3tA6wYpMTB5vVLNRW0saHupr53HsWGrnXPMda3lXsL9tQqkF5_F036yxxxlBi53D4m8j1w3jaZlrGJqnzxtw7nIOnXZH6uUUfRs8tR9XhxR65JTUHMO0H-X8JtEzpYBlcjleA'),
('DEMO-1001', 'Organic Oat Milk 1L', 'OM-ORG-1L', 4.50, 2.00, 15, 5, 'Beverages', NULL, 8.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCc87xKniW_pNkxmpHb8OQenjLOrbGF73DdCwm40fPFaGxV15bdGw-UXxa5QLYxQHz2V-d7TQvJDGf69GIRa_Hi915ctz8bSbm63rVCyoammLPWdBHC4ptzfTyCLqD2W61fJLsYXBac_dNcTeLTDjVm4YxAO7f14CSIUXa_MKKu7W8V8siIjKi9bAROkjINNc-idUgkOxGSSI1ChpZGN2D0mfdpia7A3qjZZPn-GSMOiGWmYhEnbWHUeA'),
('DEMO-1001', 'Wireless Charging Pad', 'WCP-15W-01', 29.99, 15.00, 2, 3, 'Electronics', NULL, 8.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbzsFnwR1dDaMlIjVr8PZrvOepuQ2tEP2tupZm9_9-UVDyG0efyl15hGAIHx9ODQ3lkjoaxMlSuGgv-XlE7AAiB0KtKwyuctg31J1cj_Xespl40g-l2KZza7KdtR8JmL6C0pvAUVaOxn8hXxa_mSk7ltlEqSc-uE17SHD25SfqZLZk5uRrBFPPbx8zf4MWbViV851HZKm65wgExHo1jgkDsVv8_x1cH7_8CcitPc_7CmElu5y-3TrkWA'),
('DEMO-1001', 'SmartPOS Brand T-Shirt', 'TS-SPOS-L', 19.99, 8.00, 12, 5, 'Apparel', NULL, 8.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1LekN-jkmiYWqgvtWR1FLYpJCzpgQyov2zYLrLtIE9oeqYrNYqOJI1rV0CMfR6hIRBrCQzxmmTJY7vTrAMDOzqPTodg59Gm9iFnJhNPt_qupMoVWmex9P92Uq2rzacRWYiAFBNjH70zPowM0xk1kt2XQFmvLINML7BpcWTIGGIoW74splBp3Tu99f79kiSjlnCdyT_Yr1rUkIz3AIJOA_pRGynoIjFOIShHZUWfSGP9n-f3I5wGakTQ');
