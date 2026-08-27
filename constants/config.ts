export const API_BASE_URL = 'https://pos-x2jt.onrender.com';

// Single source of truth for product categories. Used by the Add/Edit Product
// form, the Products filter, and the Billing category tabs so a product saved
// under any category stays filterable everywhere.
export const PRODUCT_CATEGORIES = [
  'Grocery',
  'Snacks',
  'Beverages',
  'Dairy',
  'Produce',
  'Apparel',
  'Electronics',
  'Other',
] as const;
