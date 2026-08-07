-- Use existing database
CREATE DATABASE IF NOT EXISTS smartpossystem;
USE smartpossystem;

-- 0. Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    shop_category VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email_or_username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    gst_number VARCHAR(100) NULL,
    business_address TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1. Create products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    low_stock_alert INT NOT NULL DEFAULT 5,
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NULL,
    tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 8.00,
    image TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create transaction_items table
CREATE TABLE IF NOT EXISTS transaction_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Insert initial product records
INSERT INTO products (name, sku, price, cost_price, stock, low_stock_alert, category, unit, tax_rate, image)
VALUES
('Organic Red Apples', 'APP-1001', 2.99, 1.50, 142, 10, 'Grocery', 'lb', 8.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7Yv43gGyBrKPnc0srxcs5O03zMXz-kw6ik4_yGC9vLV0HpZ-DtXrmoqJoZ-RVFG83qRIFt1v8J5pcGPem1sa0aBpIAkuBFtLldhxByyecMfmiFpVduKdE0EEGiDt8ujZaKP_8Y2Wrn24FG4W7_ybunWjQx6wxkOkfQ3w61Mn2jjVLLuCJosYlkzfue6upEIqLJHudITp58a71o2d_cNpwwWkAblqsDdAPwFtn_Q0hTDNYkoGOQuT9Vg'),
('Premium Dark Chocolate', 'CHC-8092', 4.50, 2.00, 56, 5, 'Snacks', NULL, 8.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcjJoa_Zd04PJFBlQNgfFIaDRlfTxM2JpcwdEqdGmx0RVcEp4OZRx1nNZRDblw3DpbJSDbSde8QpAeDIVunwmBIeIkQB2RX5vCRUst99bnd7EvjX31OB0V8-IYXkHZ1pjrjBog3EcE4z0gS3quC8ZLdfE_dtWlzKj3qWzDqsFVN2nGtBHm3qOhlLgAABZZrWIEFa044t_7pSjp_qSyAfRJCIUO3Khq_Cvjegnz31bPqQp5b0Q_sFQOVA'),
('Sparkling Spring Water', 'BEV-2201', 1.25, 0.50, 8, 10, 'Beverages', NULL, 8.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBznE2CZzBvkdpUgXw3R5l-fH_KSpOwInC0SmgXoOwDitZLjvqbHyOsezACGSROCb7jbnbJy5KViR7dcFf_3nloXK705mflV0iGb1_FpfWc4N3A6_2tQVl1E8UX9CKUojYAIZxOe1f5dOGhUIAPGJo0ggcgd7D7hhpFmHWaaeYhU0cMNuQCQPFmD7DBBI-ojIIuhFiuQw5Wl-xDA04_viCwIqCbCqfTgG4UHInY0n19mEL-ADWLbg9Cyw'),
('Artisan Sourdough Loaf', 'BAK-0045', 5.00, 2.50, 0, 5, 'Grocery', NULL, 8.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-I0YlupUZeAa1MceqEGvWcr6StURpq5EZrBS63mYwhe-xKfcxpdTD2FSPt9u4-1StjeQRsFn5BQUdr_eMxsJI2t2V8a9ld6UGyMqTF0QPN-jhKZZginZnPfggx_ialJi7KZJWXlYZrIpCjuh2CLhE-miTP9AqxPs85dL7eghROJ3eDDuuMzpsF_ZukBAt3nCnHVTpLHmyom6-HanHNMZAMJAcl5t-26uOGJgLI64MCl3abMa7FxiLAg'),
('Organic Bananas Bunch', 'FRU-9921', 1.99, 0.80, 85, 15, 'Grocery', 'ea', 8.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzwe9ikzT25B_qRuKo0FCxckifDsnHJEGEdyP9DuKwtFxPW2baYpTEVcjGvECg6sdRdHnPUykFm3cFrh8gh2CW_jdwh9Okx2GX0-CfJC48-FbsvMJH1Db5gGYuR6KcnMxW6zH4IK7M49vd3fOnf3TRY58TGpQVJ-pa-nEbjlN_gza5HtKDYtUtL4jz-TZkytZSVACGdO2KLvlGnTCVT2GuF-QsrzE2N_OBHbcxUludBVK6kuT41DsVkw'),
('Ceramic Mug - White', 'CM-WHT-01', 12.00, 5.00, 85, 10, 'Apparel', NULL, 8.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1LekN-jkmiYWqgvtWR1FLYpJCzpgQyov2zYLrLtIE9oeqYrNYqOJI1rV0CMfR6hIRBrCQzxmmTJY7vTrAMDOzqPTodg59Gm9iFnJhNPt_qupMoVWmex9P92Uq2rzacRWYiAFBNjH70zPowM0xk1kt2XQFmvLINML7BpcWTIGGIoW74splBp3Tu99f79kiSjlnCdyT_Yr1rUkIz3AIJOA_pRGynoIjFOIShHZUWfSGP9n-f3I5wGakTQ'),
('Artisan Coffee Beans 500g', 'CB-ART-500', 14.99, 7.00, 4, 5, 'Beverages', NULL, 8.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPOUvDOKaK81hCABlsg5y5SlL9vARP47Xr_jxEh3--ahaORPeZgVkKc349TJX6OW65d1-1QB2qvTmk0963wx2vQbt3RkODToh8SofzzhlRXCll94Ywu3tA6wYpMTB5vVLNRW0saHupr53HsWGrnXPMda3lXsL9tQqkF5_F036yxxxlBi53D4m8j1w3jaZlrGJqnzxtw7nIOnXZH6uUUfRs8tR9XhxR65JTUHMO0H-X8JtEzpYBlcjleA'),
('Organic Oat Milk 1L', 'OM-ORG-1L', 4.50, 2.00, 15, 5, 'Beverages', NULL, 8.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCc87xKniW_pNkxmpHb8OQenjLOrbGF73DdCwm40fPFaGxV15bdGw-UXxa5QLYxQHz2V-d7TQvJDGf69GIRa_Hi915ctz8bSbm63rVCyoammLPWdBHC4ptzfTyCLqD2W61fJLsYXBac_dNcTeLTDjVm4YxAO7f14CSIUXa_MKKu7W8V8siIjKi9bAROkjINNc-idUgkOxGSSI1ChpZGN2D0mfdpia7A3qjZZPn-GSMOiGWmYhEnbWHUeA'),
('Wireless Charging Pad', 'WCP-15W-01', 29.99, 15.00, 2, 3, 'Electronics', NULL, 8.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbzsFnwR1dDaMlIjVr8PZrvOepuQ2tEP2tupZm9_9-UVDyG0efyl15hGAIHx9ODQ3lkjoaxMlSuGgv-XlE7AAiB0KtKwyuctg31J1cj_Xespl40g-l2KZza7KdtR8JmL6C0pvAUVaOxn8hXxa_mSk7ltlEqSc-uE17SHD25SfqZLZk5uRrBFPPbx8zf4MWbViV851HZKm65wgExHo1jgkDsVv8_x1cH7_8CcitPc_7CmElu5y-3TrkWA'),
('SmartPOS Brand T-Shirt', 'TS-SPOS-L', 19.99, 8.00, 12, 5, 'Apparel', NULL, 8.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1LekN-jkmiYWqgvtWR1FLYpJCzpgQyov2zYLrLtIE9oeqYrNYqOJI1rV0CMfR6hIRBrCQzxmmTJY7vTrAMDOzqPTodg59Gm9iFnJhNPt_qupMoVWmex9P92Uq2rzacRWYiAFBNjH70zPowM0xk1kt2XQFmvLINML7BpcWTIGGIoW74splBp3Tu99f79kiSjlnCdyT_Yr1rUkIz3AIJOA_pRGynoIjFOIShHZUWfSGP9n-f3I5wGakTQ');
