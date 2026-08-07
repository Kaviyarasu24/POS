export interface Product {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  lowStockAlert: number;
  sku: string;
  category: string;
  unit?: string; // e.g. "lb", "ea"
  taxRate: number; // e.g. 8%
  image?: string;
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Organic Red Apples',
    price: 2.99,
    costPrice: 1.50,
    stock: 142,
    lowStockAlert: 10,
    sku: 'APP-1001',
    category: 'Grocery',
    unit: 'lb',
    taxRate: 8,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7Yv43gGyBrKPnc0srxcs5O03zMXz-kw6ik4_yGC9vLV0HpZ-DtXrmoqJoZ-RVFG83qRIFt1v8J5pcGPem1sa0aBpIAkuBFtLldhxByyecMfmiFpVduKdE0EEGiDt8ujZaKP_8Y2Wrn24FG4W7_ybunWjQx6wxkOkfQ3w61Mn2jjVLLuCJosYlkzfue6upEIqLJHudITp58a71o2d_cNpwwWkAblqsDdAPwFtn_Q0hTDNYkoGOQuT9Vg',
  },
  {
    id: '2',
    name: 'Premium Dark Chocolate',
    price: 4.50,
    costPrice: 2.00,
    stock: 56,
    lowStockAlert: 5,
    sku: 'CHC-8092',
    category: 'Snacks',
    taxRate: 8,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcjJoa_Zd04PJFBlQNgfFIaDRlfTxM2JpcwdEqdGmx0RVcEp4OZRx1nNZRDblw3DpbJSDbSde8QpAeDIVunwmBIeIkQB2RX5vCRUst99bnd7EvjX31OB0V8-IYXkHZ1pjrjBog3EcE4z0gS3quC8ZLdfE_dtWlzKj3qWzDqsFVN2nGtBHm3qOhlLgAABZZrWIEFa044t_7pSjp_qSyAfRJCIUO3Khq_Cvjegnz31bPqQp5b0Q_sFQOVA',
  },
  {
    id: '3',
    name: 'Sparkling Spring Water',
    price: 1.25,
    costPrice: 0.50,
    stock: 8,
    lowStockAlert: 10,
    sku: 'BEV-2201',
    category: 'Beverages',
    taxRate: 8,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBznE2CZzBvkdpUgXw3R5l-fH_KSpOwInC0SmgXoOwDitZLjvqbHyOsezACGSROCb7jbnbJy5KViR7dcFf_3nloXK705mflV0iGb1_FpfWc4N3A6_2tQVl1E8UX9CKUojYAIZxOe1f5dOGhUIAPGJo0ggcgd7D7hhpFmHWaaeYhU0cMNuQCQPFmD7DBBI-ojIIuhFiuQw5Wl-xDA04_viCwIqCbCqfTgG4UHInY0n19mEL-ADWLbg9Cyw',
  },
  {
    id: '4',
    name: 'Artisan Sourdough Loaf',
    price: 5.00,
    costPrice: 2.50,
    stock: 0,
    lowStockAlert: 5,
    sku: 'BAK-0045',
    category: 'Grocery',
    taxRate: 8,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-I0YlupUZeAa1MceqEGvWcr6StURpq5EZrBS63mYwhe-xKfcxpdTD2FSPt9u4-1StjeQRsFn5BQUdr_eMxsJI2t2V8a9ld6UGyMqTF0QPN-jhKZZginZnPfggx_ialJi7KZJWXlYZrIpCjuh2CLhE-miTP9AqxPs85dL7eghROJ3eDDuuMzpsF_ZukBAt3nCnHVTpLHmyom6-HanHNMZAMJAcl5t-26uOGJgLI64MCl3abMa7FxiLAg',
  },
  {
    id: '5',
    name: 'Organic Bananas Bunch',
    price: 1.99,
    costPrice: 0.80,
    stock: 85,
    lowStockAlert: 15,
    sku: 'FRU-9921',
    category: 'Grocery',
    unit: 'ea',
    taxRate: 8,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzwe9ikzT25B_qRuKo0FCxckifDsnHJEGEdyP9DuKwtFxPW2baYpTEVcjGvECg6sdRdHnPUykFm3cFrh8gh2CW_jdwh9Okx2GX0-CfJC48-FbsvMJH1Db5gGYuR6KcnMxW6zH4IK7M49vd3fOnf3TRY58TGpQVJ-pa-nEbjlN_gza5HtKDYtUtL4jz-TZkytZSVACGdO2KLvlGnTCVT2GuF-QsrzE2N_OBHbcxUludBVK6kuT41DsVkw',
  },
  {
    id: '6',
    name: 'Ceramic Mug - White',
    price: 12.00,
    costPrice: 5.00,
    stock: 85,
    lowStockAlert: 10,
    sku: 'CM-WHT-01',
    category: 'Apparel',
    taxRate: 8,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1LekN-jkmiYWqgvtWR1FLYpJCzpgQyov2zYLrLtIE9oeqYrNYqOJI1rV0CMfR6hIRBrCQzxmmTJY7vTrAMDOzqPTodg59Gm9iFnJhNPt_qupMoVWmex9P92Uq2rzacRWYiAFBNjH70zPowM0xk1kt2XQFmvLINML7BpcWTIGGIoW74splBp3Tu99f79kiSjlnCdyT_Yr1rUkIz3AIJOA_pRGynoIjFOIShHZUWfSGP9n-f3I5wGakTQ',
  },
  {
    id: '7',
    name: 'Artisan Coffee Beans 500g',
    price: 14.99,
    costPrice: 7.00,
    stock: 4,
    lowStockAlert: 5,
    sku: 'CB-ART-500',
    category: 'Beverages',
    taxRate: 8,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPOUvDOKaK81hCABlsg5y5SlL9vARP47Xr_jxEh3--ahaORPeZgVkKc349TJX6OW65d1-1QB2qvTmk0963wx2vQbt3RkODToh8SofzzhlRXCll94Ywu3tA6wYpMTB5vVLNRW0saHupr53HsWGrnXPMda3lXsL9tQqkF5_F036yxxxlBi53D4m8j1w3jaZlrGJqnzxtw7nIOnXZH6uUUfRs8tR9XhxR65JTUHMO0H-X8JtEzpYBlcjleA',
  },
  {
    id: '8',
    name: 'Organic Oat Milk 1L',
    price: 4.50,
    costPrice: 2.00,
    stock: 15,
    lowStockAlert: 5,
    sku: 'OM-ORG-1L',
    category: 'Beverages',
    taxRate: 8,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCc87xKniW_pNkxmpHb8OQenjLOrbGF73DdCwm40fPFaGxV15bdGw-UXxa5QLYxQHz2V-d7TQvJDGf69GIRa_Hi915ctz8bSbm63rVCyoammLPWdBHC4ptzfTyCLqD2W61fJLsYXBac_dNcTeLTDjVm4YxAO7f14CSIUXa_MKKu7W8V8siIjKi9bAROkjINNc-idUgkOxGSSI1ChpZGN2D0mfdpia7A3qjZZPn-GSMOiGWmYhEnbWHUeA',
  },
  {
    id: '9',
    name: 'Wireless Charging Pad',
    price: 29.99,
    costPrice: 15.00,
    stock: 2,
    lowStockAlert: 3,
    sku: 'WCP-15W-01',
    category: 'Electronics',
    taxRate: 8,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbzsFnwR1dDaMlIjVr8PZrvOepuQ2tEP2tupZm9_9-UVDyG0efyl15hGAIHx9ODQ3lkjoaxMlSuGgv-XlE7AAiB0KtKwyuctg31J1cj_Xespl40g-l2KZza7KdtR8JmL6C0pvAUVaOxn8hXxa_mSk7ltlEqSc-uE17SHD25SfqZLZk5uRrBFPPbx8zf4MWbViV851HZKm65wgExHo1jgkDsVv8_x1cH7_8CcitPc_7CmElu5y-3TrkWA',
  },
  {
    id: '10',
    name: 'SmartPOS Brand T-Shirt',
    price: 19.99,
    costPrice: 8.00,
    stock: 12,
    lowStockAlert: 5,
    sku: 'TS-SPOS-L',
    category: 'Apparel',
    taxRate: 8,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1LekN-jkmiYWqgvtWR1FLYpJCzpgQyov2zYLrLtIE9oeqYrNYqOJI1rV0CMfR6hIRBrCQzxmmTJY7vTrAMDOzqPTodg59Gm9iFnJhNPt_qupMoVWmex9P92Uq2rzacRWYiAFBNjH70zPowM0xk1kt2XQFmvLINML7BpcWTIGGIoW74splBp3Tu99f79kiSjlnCdyT_Yr1rUkIz3AIJOA_pRGynoIjFOIShHZUWfSGP9n-f3I5wGakTQ',
  },
];

class ProductStore {
  private products: Product[] = INITIAL_PRODUCTS;
  private listeners: (() => void)[] = [];

  getProducts() {
    return this.products;
  }

  getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  addProduct(product: Product) {
    this.products = [product, ...this.products];
    this.notify();
  }

  updateProduct(id: string, updatedFields: Partial<Product>) {
    this.products = this.products.map((p) =>
      p.id === id ? { ...p, ...updatedFields } : p
    );
    this.notify();
  }

  restockProduct(id: string, qtyToAdd: number) {
    this.products = this.products.map((p) =>
      p.id === id ? { ...p, ...{ stock: p.stock + qtyToAdd } } : p
    );
    this.notify();
  }

  checkoutProduct(id: string, qtyToSubtract: number) {
    this.products = this.products.map((p) =>
      p.id === id ? { ...p, ...{ stock: Math.max(0, p.stock - qtyToSubtract) } } : p
    );
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const store = new ProductStore();
