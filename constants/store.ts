import { API_BASE_URL } from './config';

export interface Product {
  id: string;
  storeId?: string;
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

export interface UserSession {
  id: string; // user_id
  storeId: string; // store_id
  userName: string;
  role: string; // 'owner' | 'manager' | 'cashier'
  shopName: string;
  shopCategory: string;
  phone: string;
  email: string;
  image?: string; // Profile Avatar (Base64 / URL)
  gstNumber?: string;
  businessAddress?: string;
  storePhone?: string;
}

export interface BillItem {
  id?: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface GeneratedBill {
  store_id: string;
  invoice_number: string;
  shop_name: string;
  shop_address?: string;
  shop_phone?: string;
  gst_number?: string;
  cashier_name?: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  created_at: string;
  items: BillItem[];
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
  private isSynced = false;
  public scannedItems: { productId: string; quantity: number }[] = [];
  private _currentUser: UserSession | null = {
    id: '1',
    storeId: 'TGM-1001',
    userName: 'Kaviyarasu P',
    role: 'owner',
    shopName: 'TGM Supermart',
    shopCategory: 'Retail & Grocery',
    phone: '+91 7010764469',
    email: 'rithes07@gmail.com',
    gstNumber: '33AAACT1024K1Z0',
    businessAddress: '124 Market Avenue, Tech Park City, TN 600001',
    storePhone: '+91 7010764469',
  };

  constructor() {
    this.syncProducts();
  }

  get currentUser(): UserSession | null {
    return this._currentUser;
  }

  set currentUser(user: UserSession | null) {
    this._currentUser = user;
    this.isSynced = false; // reset sync state
    this.syncProducts(); // auto-sync products when user changes
  }

  getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this._currentUser) {
      headers['X-Store-ID'] = this._currentUser.storeId || 'TGM-1001';
      headers['X-User-ID'] = this._currentUser.id;
    } else {
      headers['X-Store-ID'] = 'TGM-1001';
    }
    return headers;
  }

  // Trigger API Sync
  async syncProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error('API fetch error');
      const data = await response.json();
      
      this.products = data.map((p: any) => ({
        id: p.id.toString(),
        storeId: p.store_id ? p.store_id.toString() : 'TGM-1001',
        name: p.name,
        price: parseFloat(p.price),
        costPrice: parseFloat(p.cost_price),
        stock: p.stock,
        lowStockAlert: p.low_stock_alert,
        sku: p.sku,
        category: p.category,
        unit: p.unit || undefined,
        taxRate: parseFloat(p.tax_rate),
        image: p.image || undefined,
      }));
      
      this.isSynced = true;
      this.notify();
    } catch (err) {
      console.warn('API sync failed, using local store:', err);
    }
  }

  getProducts() {
    if (!this.isSynced) {
      this.syncProducts();
    }
    return this.products;
  }

  getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  async addProduct(product: Omit<Product, 'id'>) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          name: product.name,
          sku: product.sku.toUpperCase(),
          price: product.price,
          cost_price: product.costPrice,
          stock: product.stock,
          low_stock_alert: product.lowStockAlert,
          category: product.category,
          unit: product.unit || null,
          tax_rate: product.taxRate,
          image: product.image || null,
        }),
      });
      
      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(errorDetail.detail || 'API addition error');
      }
      
      await this.syncProducts();
    } catch (err) {
      console.warn('API add failed, falling back to local simulation:', err);
      const localProduct: Product = {
        ...product,
        id: Date.now().toString(),
      };
      this.products = [localProduct, ...this.products];
      this.notify();
    }
  }

  async updateProduct(id: string, updatedFields: Partial<Product>) {
    try {
      const bodyPayload: any = {};
      if (updatedFields.name !== undefined) bodyPayload.name = updatedFields.name;
      if (updatedFields.sku !== undefined) bodyPayload.sku = updatedFields.sku;
      if (updatedFields.price !== undefined) bodyPayload.price = updatedFields.price;
      if (updatedFields.costPrice !== undefined) bodyPayload.cost_price = updatedFields.costPrice;
      if (updatedFields.stock !== undefined) bodyPayload.stock = updatedFields.stock;
      if (updatedFields.lowStockAlert !== undefined) bodyPayload.low_stock_alert = updatedFields.lowStockAlert;
      if (updatedFields.category !== undefined) bodyPayload.category = updatedFields.category;
      if (updatedFields.unit !== undefined) bodyPayload.unit = updatedFields.unit || null;
      if (updatedFields.taxRate !== undefined) bodyPayload.tax_rate = updatedFields.taxRate;
      if (updatedFields.image !== undefined) bodyPayload.image = updatedFields.image || null;

      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(errorDetail.detail || 'API update error');
      }

      await this.syncProducts();
    } catch (err) {
      console.warn('API update failed, falling back to local simulation:', err);
      this.products = this.products.map((p) =>
        p.id === id ? { ...p, ...updatedFields } : p
      );
      this.notify();
    }
  }

  async deleteProduct(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(errorDetail.detail || 'API deletion error');
      }

      await this.syncProducts();
    } catch (err) {
      console.warn('API delete failed, falling back to local simulation:', err);
      this.products = this.products.filter((p) => p.id !== id);
      this.notify();
    }
  }

  async updateUserProfile(updatedFields: Partial<UserSession>) {
    if (!this._currentUser) return;

    try {
      // 1. Update Store Details
      const storePayload: any = {};
      if (updatedFields.shopName !== undefined) storePayload.name = updatedFields.shopName;
      if (updatedFields.shopCategory !== undefined) storePayload.category = updatedFields.shopCategory;
      if (updatedFields.storePhone !== undefined || updatedFields.phone !== undefined) {
        storePayload.phone = updatedFields.storePhone || updatedFields.phone;
      }
      if (updatedFields.gstNumber !== undefined) storePayload.gst_number = updatedFields.gstNumber;
      if (updatedFields.businessAddress !== undefined) storePayload.address = updatedFields.businessAddress;

      await fetch(`${API_BASE_URL}/api/stores/${this._currentUser.storeId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(storePayload),
      });

      // 2. Update User Details
      const userPayload: any = {};
      if (updatedFields.userName !== undefined) userPayload.name = updatedFields.userName;
      if (updatedFields.phone !== undefined) userPayload.phone = updatedFields.phone;
      if (updatedFields.email !== undefined) userPayload.email_or_username = updatedFields.email;
      if (updatedFields.image !== undefined) userPayload.image = updatedFields.image;

      const userRes = await fetch(`${API_BASE_URL}/api/users/${this._currentUser.id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(userPayload),
      });

      if (userRes.ok) {
        const data = await userRes.json();
        this.currentUser = {
          id: data.id.toString(),
          storeId: data.store_id.toString(),
          userName: data.name,
          role: data.role,
          shopName: data.shop_name || 'SmartPOS Store',
          shopCategory: data.shop_category || 'Retail',
          phone: data.phone || '',
          email: data.email_or_username,
          image: data.image || undefined,
          gstNumber: data.gst_number || undefined,
          businessAddress: data.business_address || undefined,
          storePhone: data.store_phone || undefined,
        };
      }
    } catch (err) {
      console.warn('API user update failed, falling back to local simulation:', err);
      this.currentUser = {
        ...this._currentUser,
        ...updatedFields,
      };
    }
  }

  async restockProduct(id: string, qtyToAdd: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}/restock?qty=${qtyToAdd}`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error('API restock error');
      await this.syncProducts();
    } catch (err) {
      console.warn('API restock failed, falling back to local simulation:', err);
      this.products = this.products.map((p) =>
        p.id === id ? { ...p, stock: p.stock + qtyToAdd } : p
      );
      this.notify();
    }
  }

  // Unified Checkout & Bill Generator API call
  async checkoutOrder(
    subtotal: number,
    discount: number,
    tax: number,
    total: number,
    items: { product_id: string; product_name?: string; quantity: number; price: number }[],
    paymentMethod: string = 'CASH'
  ): Promise<GeneratedBill> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          subtotal,
          discount,
          tax,
          total,
          payment_method: paymentMethod,
          payment_status: 'PAID',
          items: items.map(item => ({
            product_id: parseInt(item.product_id, 10),
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(errorDetail.detail || 'API checkout error');
      }

      const billDataRaw = await response.json();
      const billData: GeneratedBill = {
        store_id: billDataRaw.store_id,
        invoice_number: billDataRaw.invoice_number,
        shop_name: billDataRaw.shop_name,
        shop_address: billDataRaw.shop_address,
        shop_phone: billDataRaw.shop_phone,
        gst_number: billDataRaw.gst_number,
        cashier_name: billDataRaw.cashier_name,
        payment_method: billDataRaw.payment_method,
        payment_status: billDataRaw.payment_status,
        subtotal: parseFloat(billDataRaw.subtotal) || 0,
        discount: parseFloat(billDataRaw.discount) || 0,
        tax: parseFloat(billDataRaw.tax) || 0,
        total: parseFloat(billDataRaw.total) || 0,
        created_at: billDataRaw.created_at,
        items: (billDataRaw.items || []).map((i: any) => ({
          id: i.id,
          product_id: i.product_id,
          product_name: i.product_name,
          quantity: i.quantity,
          price: parseFloat(i.price) || 0,
        })),
      };
      await this.syncProducts();
      return billData;
    } catch (err) {
      console.warn('API checkout failed, falling back to local bill generation:', err);
      
      // Fallback: local in-memory decrement
      items.forEach(item => {
        this.products = this.products.map(p =>
          p.id === item.product_id ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p
        );
      });
      this.notify();

      const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      return {
        store_id: this._currentUser?.storeId || 'TGM-1001',
        invoice_number: invoiceNumber,
        shop_name: this._currentUser?.shopName || 'SmartPOS Store',
        shop_address: this._currentUser?.businessAddress || '124 Market Avenue, Tech Park City',
        shop_phone: this._currentUser?.phone || '+91 7010764469',
        gst_number: this._currentUser?.gstNumber || '33AAACT1024K1Z0',
        cashier_name: this._currentUser?.userName || 'Store Cashier',
        payment_method: paymentMethod,
        payment_status: 'PAID',
        subtotal,
        discount,
        tax,
        total,
        created_at: new Date().toISOString(),
        items: items.map(i => ({
          product_id: parseInt(i.product_id, 10),
          product_name: i.product_name || `Product #${i.product_id}`,
          quantity: i.quantity,
          price: i.price
        }))
      };
    }
  }

  addScannedItem(productId: string, quantity: number = 1) {
    const existing = this.scannedItems.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.scannedItems.push({ productId, quantity });
    }
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
