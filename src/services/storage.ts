import {
  User,
  Category,
  Brand,
  Product,
  Customer,
  Supplier,
  Sale,
  DraftTransaction,
  SalesReturn,
  Purchase,
  PurchaseReturn,
  StockMovement,
  StockAdjustment,
  StockOpname,
  Shift,
  CashMovement,
  StoreSettings,
  AuditEvent,
  ReceiptTemplate,
} from '../types/pos';
import { formatCurrency } from '../utils/currency';
import { DEFAULT_ADMIN_HASH, DEFAULT_KASIR_HASH, hashPasswordSync } from '../utils/crypto';

const STORAGE_KEYS = {
  USERS: 'pos_users',
  ACTIVE_USER: 'pos_active_user',
  CATEGORIES: 'pos_categories',
  BRANDS: 'pos_brands',
  PRODUCTS: 'pos_products',
  CUSTOMERS: 'pos_customers',
  SUPPLIERS: 'pos_suppliers',
  SALES: 'pos_sales',
  DRAFTS: 'pos_drafts',
  SALES_RETURNS: 'pos_sales_returns',
  PURCHASES: 'pos_purchases',
  PURCHASE_RETURNS: 'pos_purchase_returns',
  STOCK_MOVEMENTS: 'pos_stock_movements',
  STOCK_ADJUSTMENTS: 'pos_stock_adjustments',
  STOCK_OPNAMES: 'pos_stock_opnames',
  SHIFTS: 'pos_shifts',
  CASH_MOVEMENTS: 'pos_cash_movements',
  SETTINGS: 'pos_settings',
  AUDIT_LOGS: 'pos_audit_logs',
  RECEIPT_TEMPLATE: 'pos_receipt_template',
};

// Default Initial Seed Data
const DEFAULT_USERS: User[] = [
  {
    id: 'usr_admin',
    username: 'admin',
    password_hash: DEFAULT_ADMIN_HASH, // SHA-256 for 'admin123'
    nama_lengkap: 'Super Admin',
    fullName: 'Super Admin',
    role: 'admin',
    is_active: true,
    active: true,
    mustChangePassword: false,
    last_login: null,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    pin: '1234',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  {
    id: 'usr_cashier1',
    username: 'kasir',
    password_hash: hashPasswordSync('kasir123'), // SHA-256 for 'kasir123'
    nama_lengkap: 'Kasir',
    fullName: 'Kasir',
    role: 'user',
    is_active: true,
    active: true,
    mustChangePassword: false,
    last_login: null,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    pin: '1111',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_bev', name: 'Beverages', description: 'Hot & cold coffee, tea, and bottled drinks' },
  { id: 'cat_elec', name: 'Electronics', description: 'Gadgets, mice, accessories' },
  { id: 'cat_snack', name: 'Bakery & Snacks', description: 'Freshly baked bread, cookies, snacks' },
  { id: 'cat_dairy', name: 'Dairy & Fresh', description: 'Milk, cheese, butter, yogurt' },
  { id: 'cat_care', name: 'Personal Care', description: 'Toiletries, eco bottles, soaps' },
];

const DEFAULT_BRANDS: Brand[] = [
  { id: 'brd_1', name: 'TechMaster', description: 'Quality electronics' },
  { id: 'brd_2', name: 'RefreshCo', description: 'Artisan roast coffee and beverages' },
  { id: 'brd_3', name: 'BakeryBites', description: 'Fresh organic baked goods' },
  { id: 'brd_4', name: 'OrganicLiving', description: 'Eco-friendly personal essentials' },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prd_101',
    sku: 'PRD-101',
    code: '1001',
    barcode: '8991001001',
    name: 'Espresso Coffee Beans 1kg',
    categoryId: 'cat_bev',
    brandId: 'brd_2',
    costPrice: 100000,
    sellingPrice: 185000,
    stock: 42,
    minStock: 10,
    baseUnit: 'Bag',
    unitConversions: [
      { unitName: 'Bag', conversionFactor: 1, barcode: '8991001001' },
      { unitName: 'Box (10 Bags)', conversionFactor: 10, barcode: '899100100110' },
    ],
    priceTiers: [
      { tierName: 'Retail', price: 185000 },
      { tierName: 'Wholesale', price: 160000 },
      { tierName: 'VIP', price: 150000 },
    ],
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prd_102',
    sku: 'PRD-102',
    code: '1002',
    barcode: '8991001002',
    name: 'Wireless Ergonomic Mouse',
    categoryId: 'cat_elec',
    brandId: 'brd_1',
    costPrice: 150000,
    sellingPrice: 299000,
    stock: 18,
    minStock: 5,
    baseUnit: 'Pcs',
    unitConversions: [
      { unitName: 'Pcs', conversionFactor: 1, barcode: '8991001002' },
    ],
    priceTiers: [
      { tierName: 'Retail', price: 299000 },
      { tierName: 'Wholesale', price: 250000 },
      { tierName: 'VIP', price: 240000 },
    ],
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prd_103',
    sku: 'PRD-103',
    code: '1003',
    barcode: '8991001003',
    name: 'Organic Artisan Sourdough Bread',
    categoryId: 'cat_snack',
    brandId: 'brd_3',
    costPrice: 25000,
    sellingPrice: 45000,
    stock: 35,
    minStock: 8,
    baseUnit: 'Loaf',
    unitConversions: [
      { unitName: 'Loaf', conversionFactor: 1, barcode: '8991001003' },
    ],
    priceTiers: [
      { tierName: 'Retail', price: 45000 },
      { tierName: 'Wholesale', price: 38000 },
      { tierName: 'VIP', price: 35000 },
    ],
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=300',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prd_104',
    sku: 'PRD-104',
    code: '1004',
    barcode: '8991001004',
    name: 'Fresh Whole Milk 1L',
    categoryId: 'cat_dairy',
    costPrice: 22000,
    sellingPrice: 32000,
    stock: 4, // LOW STOCK
    minStock: 10,
    baseUnit: 'Bottle',
    unitConversions: [
      { unitName: 'Bottle', conversionFactor: 1, barcode: '8991001004' },
      { unitName: 'Crate (12 Bottles)', conversionFactor: 12, barcode: '899100100412' },
    ],
    priceTiers: [
      { tierName: 'Retail', price: 32000 },
      { tierName: 'Wholesale', price: 28000 },
      { tierName: 'VIP', price: 27000 },
    ],
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prd_105',
    sku: 'PRD-105',
    code: '1005',
    barcode: '8991001005',
    name: 'Stainless Steel Water Bottle 750ml',
    categoryId: 'cat_care',
    brandId: 'brd_4',
    costPrice: 75000,
    sellingPrice: 149000,
    stock: 22,
    minStock: 5,
    baseUnit: 'Pcs',
    unitConversions: [
      { unitName: 'Pcs', conversionFactor: 1, barcode: '8991001005' },
    ],
    priceTiers: [
      { tierName: 'Retail', price: 149000 },
      { tierName: 'Wholesale', price: 120000 },
      { tierName: 'VIP', price: 115000 },
    ],
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prd_106',
    sku: 'PRD-106',
    code: '1006',
    barcode: '8991001006',
    name: 'Ceremonial Grade Matcha Powder 250g',
    categoryId: 'cat_bev',
    brandId: 'brd_2',
    costPrice: 65000,
    sellingPrice: 120000,
    stock: 14,
    minStock: 5,
    baseUnit: 'Can',
    unitConversions: [
      { unitName: 'Can', conversionFactor: 1, barcode: '8991001006' },
    ],
    priceTiers: [
      { tierName: 'Retail', price: 120000 },
      { tierName: 'Wholesale', price: 100000 },
      { tierName: 'VIP', price: 95000 },
    ],
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=300',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prd_107',
    sku: 'PRD-107',
    code: '1007',
    barcode: '8991001007',
    name: 'Bluetooth Noise Cancelling Headphones',
    categoryId: 'cat_elec',
    brandId: 'brd_1',
    costPrice: 450000,
    sellingPrice: 890000,
    stock: 6,
    minStock: 3,
    baseUnit: 'Pcs',
    unitConversions: [
      { unitName: 'Pcs', conversionFactor: 1, barcode: '8991001007' },
    ],
    priceTiers: [
      { tierName: 'Retail', price: 890000 },
      { tierName: 'Wholesale', price: 780000 },
      { tierName: 'VIP', price: 750000 },
    ],
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'cust_walkin',
    code: 'CUST-000',
    name: 'Walk-in Customer',
    phone: 'N/A',
    tier: 'Regular',
    totalSpent: 0,
    points: 0,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cust_1',
    code: 'CUST-001',
    name: 'Alice Johnson',
    phone: '+62 812-3456-7890',
    email: 'alice@example.com',
    address: '123 Pine St, Suite 4B',
    tier: 'VIP',
    totalSpent: 3425000,
    points: 34,
    active: true,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'cust_2',
    code: 'CUST-002',
    name: 'Metro Cafe & Bakery',
    phone: '+62 811-9876-5432',
    email: 'orders@metrocafe.com',
    address: '88 Market Avenue',
    tier: 'Wholesale',
    totalSpent: 12500000,
    points: 125,
    active: true,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: 'sup_1',
    code: 'SUP-001',
    name: 'Global Beverage Distributors',
    contactPerson: 'David Miller',
    phone: '+1 800-555-9000',
    email: 'supply@globalbev.com',
    address: '400 Industrial Parkway',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sup_2',
    code: 'SUP-002',
    name: 'TechSupply & Logistics Co',
    contactPerson: 'Karen Chen',
    phone: '+1 800-555-8888',
    email: 'karen@techsupply.com',
    address: '750 Innovation Way',
    active: true,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'CornerStone Market & POS',
  address: '101 Main Boulevard, District 5, Cityville',
  phone: '+62 (21) 555-0192',
  email: 'contact@cornerstonemarket.com',
  currencySymbol: 'Rp',
  currencyCode: 'IDR',
  taxRate: 11,
  defaultTaxInclusive: false,
  receiptHeader: 'Welcome to CornerStone Market\nQuality Products Every Day',
  receiptFooter: 'Thank you for shopping with us!\nPlease come again.',
  paperWidth: '80mm',
  h1Title: 'CornerStone Market & POS',
  h2Address: '101 Main Boulevard, District 5, Cityville',
  footnote1: 'Goods sold are not returnable without valid invoice slip.',
  footnote2: 'Customer care: support@cornerstone.com / +62 (21) 555-0192',
};

const DEFAULT_RECEIPT_TEMPLATE: ReceiptTemplate = {
  id: 'rcpt_tmpl_default',
  h1Title: 'CornerStone Market & POS',
  h2Address: '101 Main Boulevard, District 5, Cityville',
  footnote1: 'Goods sold are not returnable without valid invoice slip.',
  footnote2: 'Customer care: support@cornerstone.com / +62 (21) 555-0192',
  paperWidth: '80mm',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  updatedBy: 'usr_admin',
};

const DEFAULT_SHIFT: Shift = {
  id: 'shf_1',
  shiftNumber: 'SHF-20260811-01',
  cashierId: 'usr_cashier1',
  cashierName: 'John Cashier',
  startTime: new Date(Date.now() - 4 * 3600000).toISOString(),
  startingCash: 500000,
  cashSales: 350000,
  cardSales: 890000,
  qrSales: 185000,
  totalSales: 1425000,
  cashIn: 0,
  cashOut: 0,
  expectedCash: 850000,
  status: 'open',
};

// Storage Engine Class
class StorageService {
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to write key ${key} to localStorage`, e);
    }
  }

  public initSeedData(): void {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.setItem(STORAGE_KEYS.USERS, DEFAULT_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      this.setItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BRANDS)) {
      this.setItem(STORAGE_KEYS.BRANDS, DEFAULT_BRANDS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.setItem(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      this.setItem(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
      this.setItem(STORAGE_KEYS.SUPPLIERS, DEFAULT_SUPPLIERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SHIFTS)) {
      this.setItem(STORAGE_KEYS.SHIFTS, [DEFAULT_SHIFT]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_USER)) {
      this.setItem(STORAGE_KEYS.ACTIVE_USER, DEFAULT_USERS[2]); // John Cashier by default
    }

    // IDR Default setup: ensure currency is initialized if missing
    try {
      const storedSettings = this.getItem<StoreSettings | null>(STORAGE_KEYS.SETTINGS, null);
      if (storedSettings && !storedSettings.currencySymbol) {
        storedSettings.currencySymbol = 'Rp';
        storedSettings.currencyCode = 'IDR';
        this.setItem(STORAGE_KEYS.SETTINGS, storedSettings);
      }

      const storedProducts = this.getItem<Product[] | null>(STORAGE_KEYS.PRODUCTS, null);
      if (storedProducts && storedProducts.length > 0 && storedProducts.some((p) => p.sellingPrice < 500)) {
        const migratedProducts = storedProducts.map((p) => {
          const factor = p.sellingPrice < 500 ? 10000 : 1;
          return {
            ...p,
            costPrice: Math.round(p.costPrice * factor),
            sellingPrice: Math.round(p.sellingPrice * factor),
            priceTiers: p.priceTiers
              ? p.priceTiers.map((t) => ({
                  ...t,
                  price: Math.round(t.price * factor),
                }))
              : undefined,
          };
        });
        this.setItem(STORAGE_KEYS.PRODUCTS, migratedProducts);
      }

      const storedShifts = this.getItem<Shift[] | null>(STORAGE_KEYS.SHIFTS, null);
      if (storedShifts && storedShifts.length > 0 && storedShifts.some((s) => s.startingCash < 500)) {
        const migratedShifts = storedShifts.map((s) => {
          if (s.startingCash < 500) {
            return {
              ...s,
              startingCash: Math.round(s.startingCash * 10000),
              cashSales: Math.round(s.cashSales * 10000),
              cardSales: Math.round(s.cardSales * 10000),
              qrSales: Math.round(s.qrSales * 10000),
              totalSales: Math.round(s.totalSales * 10000),
              expectedCash: Math.round(s.expectedCash * 10000),
              actualCash: s.actualCash !== undefined ? Math.round(s.actualCash * 10000) : undefined,
              variance: s.variance !== undefined ? Math.round(s.variance * 10000) : undefined,
            };
          }
          return s;
        });
        this.setItem(STORAGE_KEYS.SHIFTS, migratedShifts);
      }
    } catch (e) {
      console.warn('IDR migration check failed', e);
    }

    // Step 1: Users Schema Verification & Default Seed
    try {
      const storedUsers = this.getItem<User[] | null>(STORAGE_KEYS.USERS, null);
      if (storedUsers && storedUsers.length > 0) {
        let changed = false;
        const upgradedUsers = storedUsers.map((u) => {
          let updated = { ...u };
          if (!updated.nama_lengkap) {
            updated.nama_lengkap = updated.fullName || updated.username;
            changed = true;
          }
          if (!updated.fullName) {
            updated.fullName = updated.nama_lengkap;
            changed = true;
          }
          if (updated.is_active === undefined) {
            updated.is_active = updated.active !== undefined ? updated.active : true;
            changed = true;
          }
          if (updated.active === undefined) {
            updated.active = updated.is_active;
            changed = true;
          }
          if (!updated.created_at) {
            updated.created_at = updated.createdAt || new Date().toISOString();
            changed = true;
          }
          if (!updated.createdAt) {
            updated.createdAt = updated.created_at;
            changed = true;
          }
          if (updated.last_login === undefined) {
            updated.last_login = null;
            changed = true;
          }
          if (!updated.password_hash) {
            if (updated.username.toLowerCase() === 'admin') {
              updated.password_hash = DEFAULT_ADMIN_HASH;
              updated.mustChangePassword = updated.mustChangePassword !== false;
            } else {
              updated.password_hash = hashPasswordSync('user123');
              updated.mustChangePassword = false;
            }
            changed = true;
          }
          return updated;
        });

        // Ensure super admin (admin:admin123) is present and synced
        const adminIndex = upgradedUsers.findIndex((u) => u.username.toLowerCase() === 'admin');
        if (adminIndex >= 0) {
          upgradedUsers[adminIndex] = {
            ...upgradedUsers[adminIndex],
            nama_lengkap: 'Super Admin',
            fullName: 'Super Admin',
            role: 'admin',
            is_active: true,
            active: true,
            password_hash: DEFAULT_ADMIN_HASH, // SHA-256 of admin123
            mustChangePassword: false,
          };
          changed = true;
        } else {
          upgradedUsers.unshift(DEFAULT_USERS[0]);
          changed = true;
        }

        // Ensure kasir (kasir:kasir123) is present and synced
        const kasirIndex = upgradedUsers.findIndex((u) => u.username.toLowerCase() === 'kasir');
        if (kasirIndex >= 0) {
          upgradedUsers[kasirIndex] = {
            ...upgradedUsers[kasirIndex],
            nama_lengkap: 'Kasir',
            fullName: 'Kasir',
            role: 'user',
            is_active: true,
            active: true,
            password_hash: DEFAULT_KASIR_HASH, // SHA-256 of kasir123
            mustChangePassword: false,
          };
          changed = true;
        } else {
          upgradedUsers.push(DEFAULT_USERS[1]);
          changed = true;
        }

        if (changed) {
          this.setItem(STORAGE_KEYS.USERS, upgradedUsers);
        }
      } else {
        this.setItem(STORAGE_KEYS.USERS, DEFAULT_USERS);
      }
    } catch (e) {
      console.warn('User schema verification failed', e);
    }
  }

  /**
   * Reset default seed accounts (admin and kasir) and clear any auth lockouts
   */
  public resetDefaultSeedUsers(): void {
    const currentUsers = this.getItem<User[]>(STORAGE_KEYS.USERS, []);
    const otherUsers = currentUsers.filter(
      (u) => u.username.toLowerCase() !== 'admin' && u.username.toLowerCase() !== 'kasir'
    );
    const refreshed = [DEFAULT_USERS[0], DEFAULT_USERS[1], ...otherUsers];
    this.setItem(STORAGE_KEYS.USERS, refreshed);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('pos_auth_attempts');
      localStorage.removeItem('pos_auth_lockout_until');
    }
  }

  // Active User / Session
  public getActiveUser(): User {
    return this.getItem<User>(STORAGE_KEYS.ACTIVE_USER, DEFAULT_USERS[0]);
  }

  public setActiveUser(user: User): void {
    this.setItem(STORAGE_KEYS.ACTIVE_USER, user);
    this.logAudit(user.id, user.fullName, 'Login / Switch Account', 'auth', `Logged in as ${user.fullName} (${user.role})`);
  }

  public getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  }

  public getUserByUsername(username: string): User | null {
    const users = this.getUsers();
    return users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase()) || null;
  }

  public saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.setItem(STORAGE_KEYS.USERS, users);
    const active = this.getActiveUser();
    this.logAudit(active.id, active.fullName, 'Save User', 'auth', `Saved user account ${user.username} (${user.role})`);
  }

  public deleteUser(id: string): boolean {
    const users = this.getUsers();
    const target = users.find((u) => u.id === id);
    if (!target) return false;
    const remaining = users.filter((u) => u.id !== id);
    this.setItem(STORAGE_KEYS.USERS, remaining);
    const active = this.getActiveUser();
    this.logAudit(active.id, active.fullName, 'Delete User', 'auth', `Deleted user account ${target.username} (${target.role})`);
    return true;
  }

  // Settings
  public getSettings(): StoreSettings {
    return this.getItem<StoreSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  public saveSettings(settings: StoreSettings): void {
    const previous = this.getSettings();
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
    const active = this.getActiveUser();

    // Also sync the dedicated receipt template if receipt custom fields are present
    const prevTemplate = this.getReceiptTemplate();
    const syncedTemplate: ReceiptTemplate = {
      ...prevTemplate,
      h1Title: (settings.h1Title || settings.storeName || 'Receipt').trim(),
      h2Address: settings.h2Address !== undefined ? settings.h2Address.slice(0, 150) : prevTemplate.h2Address,
      footnote1: settings.footnote1 !== undefined ? settings.footnote1.slice(0, 100) : prevTemplate.footnote1,
      footnote2: settings.footnote2 !== undefined ? settings.footnote2.slice(0, 100) : prevTemplate.footnote2,
      paperWidth: settings.paperWidth || prevTemplate.paperWidth,
      updatedAt: new Date().toISOString(),
      updatedBy: active.id,
    };
    this.setItem(STORAGE_KEYS.RECEIPT_TEMPLATE, syncedTemplate);

    this.logAudit(
      active.id,
      active.fullName,
      'Update Store Settings',
      'settings',
      `Updated settings for ${settings.storeName} (H1: "${syncedTemplate.h1Title}", Width: ${settings.paperWidth})`
    );
  }

  // Receipt Template Configuration
  public getReceiptTemplate(): ReceiptTemplate {
    const settings = this.getSettings();
    const fallback: ReceiptTemplate = {
      id: 'rcpt_tmpl_default',
      h1Title: settings.h1Title || settings.storeName || 'CornerStone Market & POS',
      h2Address: settings.h2Address !== undefined ? settings.h2Address : settings.address,
      footnote1: settings.footnote1 || 'Goods sold are not returnable without valid invoice slip.',
      footnote2: settings.footnote2 || 'Customer care: support@cornerstone.com / +1 (555) 019-2831',
      paperWidth: settings.paperWidth || '80mm',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: 'usr_admin',
    };
    return this.getItem<ReceiptTemplate>(STORAGE_KEYS.RECEIPT_TEMPLATE, fallback);
  }

  public saveReceiptTemplate(template: ReceiptTemplate): void {
    const previous = this.getReceiptTemplate();
    const active = this.getActiveUser();
    const sanitized: ReceiptTemplate = {
      ...template,
      h1Title: template.h1Title ? template.h1Title.trim() : 'Receipt',
      h2Address: template.h2Address ? template.h2Address.slice(0, 150) : '',
      footnote1: template.footnote1 ? template.footnote1.slice(0, 100) : '',
      footnote2: template.footnote2 ? template.footnote2.slice(0, 100) : '',
      paperWidth: template.paperWidth || '80mm',
      updatedAt: new Date().toISOString(),
      updatedBy: active.id,
    };
    this.setItem(STORAGE_KEYS.RECEIPT_TEMPLATE, sanitized);

    // Synchronize into StoreSettings so all receipt generators and previewers access the active template
    const currentSettings = this.getSettings();
    const updatedSettings: StoreSettings = {
      ...currentSettings,
      h1Title: sanitized.h1Title,
      h2Address: sanitized.h2Address,
      footnote1: sanitized.footnote1,
      footnote2: sanitized.footnote2,
      paperWidth: sanitized.paperWidth,
      receiptTemplateConfig: sanitized,
    };
    this.setItem(STORAGE_KEYS.SETTINGS, updatedSettings);

    // Detailed Audit Logging of Previous vs New Values
    const changeList: string[] = [];
    if (previous.h1Title !== sanitized.h1Title) {
      changeList.push(`H1: "${previous.h1Title}" -> "${sanitized.h1Title}"`);
    }
    if ((previous.h2Address || '') !== (sanitized.h2Address || '')) {
      changeList.push(`H2: "${previous.h2Address || ''}" -> "${sanitized.h2Address || ''}"`);
    }
    if ((previous.footnote1 || '') !== (sanitized.footnote1 || '')) {
      changeList.push(`Footnote 1: "${previous.footnote1 || ''}" -> "${sanitized.footnote1 || ''}"`);
    }
    if ((previous.footnote2 || '') !== (sanitized.footnote2 || '')) {
      changeList.push(`Footnote 2: "${previous.footnote2 || ''}" -> "${sanitized.footnote2 || ''}"`);
    }
    if (previous.paperWidth !== sanitized.paperWidth) {
      changeList.push(`Paper Width: ${previous.paperWidth} -> ${sanitized.paperWidth}`);
    }

    this.logAudit(
      active.id,
      active.fullName,
      'Update Receipt Template',
      'settings',
      changeList.length > 0
        ? `Updated receipt template fields: ${changeList.join(' | ')}`
        : `Verified/saved receipt template "${sanitized.h1Title}"`
    );
  }

  // Categories & Brands
  public getCategories(): Category[] {
    return this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  }

  public saveCategory(category: Category): void {
    const list = this.getCategories();
    const idx = list.findIndex((c) => c.id === category.id);
    if (idx >= 0) list[idx] = category;
    else list.push(category);
    this.setItem(STORAGE_KEYS.CATEGORIES, list);
  }

  public getBrands(): Brand[] {
    return this.getItem<Brand[]>(STORAGE_KEYS.BRANDS, DEFAULT_BRANDS);
  }

  public saveBrand(brand: Brand): void {
    const list = this.getBrands();
    const idx = list.findIndex((b) => b.id === brand.id);
    if (idx >= 0) list[idx] = brand;
    else list.push(brand);
    this.setItem(STORAGE_KEYS.BRANDS, list);
  }

  // Products
  public getProducts(): Product[] {
    return this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  }

  public saveProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    this.setItem(STORAGE_KEYS.PRODUCTS, products);
    const active = this.getActiveUser();
    this.logAudit(active.id, active.fullName, 'Save Product', 'product', `Saved product ${product.name} (SKU: ${product.sku}, Stock: ${product.stock})`);
  }

  public deleteProduct(id: string): void {
    const products = this.getProducts();
    const updated = products.map((p) => (p.id === id ? { ...p, active: false } : p));
    this.setItem(STORAGE_KEYS.PRODUCTS, updated);
  }

  // Bulk Setters
  public setProducts(products: Product[]): void {
    this.setItem(STORAGE_KEYS.PRODUCTS, products);
    const active = this.getActiveUser();
    this.logAudit(active.id, active.fullName, 'Load Catalog Preset', 'product', `Loaded ${products.length} products`);
  }

  public setCategories(categories: Category[]): void {
    this.setItem(STORAGE_KEYS.CATEGORIES, categories);
  }

  public setBrands(brands: Brand[]): void {
    this.setItem(STORAGE_KEYS.BRANDS, brands);
  }

  // Customers
  public getCustomers(): Customer[] {
    return this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
  }

  public saveCustomer(customer: Customer): void {
    const list = this.getCustomers();
    const idx = list.findIndex((c) => c.id === customer.id);
    if (idx >= 0) list[idx] = customer;
    else list.push(customer);
    this.setItem(STORAGE_KEYS.CUSTOMERS, list);
  }

  // Suppliers
  public getSuppliers(): Supplier[] {
    return this.getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, DEFAULT_SUPPLIERS);
  }

  public saveSupplier(supplier: Supplier): void {
    const list = this.getSuppliers();
    const idx = list.findIndex((s) => s.id === supplier.id);
    if (idx >= 0) list[idx] = supplier;
    else list.push(supplier);
    this.setItem(STORAGE_KEYS.SUPPLIERS, list);
  }

  // Sales
  public getSales(): Sale[] {
    return this.getItem<Sale[]>(STORAGE_KEYS.SALES, []);
  }

  public saveSale(sale: Sale): void {
    const sales = this.getSales();
    sales.unshift(sale); // Newest first
    this.setItem(STORAGE_KEYS.SALES, sales);

    // Deduct stock for each sale item
    const products = this.getProducts();
    const movements: StockMovement[] = [];

    sale.items.forEach((item) => {
      const pIndex = products.findIndex((p) => p.id === item.productId);
      if (pIndex >= 0) {
        const prod = products[pIndex];
        const qtyDeducted = item.quantity * item.unitFactor;
        const stockBefore = prod.stock;
        const stockAfter = Math.max(0, stockBefore - qtyDeducted);
        products[pIndex].stock = stockAfter;

        movements.push({
          id: 'mov_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          productId: prod.id,
          productName: prod.name,
          type: 'sale',
          quantityDelta: -qtyDeducted,
          stockBefore,
          stockAfter,
          referenceId: sale.id,
          referenceType: 'Sale ' + sale.saleNumber,
          userName: sale.cashierName,
          createdAt: new Date().toISOString(),
        });
      }
    });

    this.setItem(STORAGE_KEYS.PRODUCTS, products);
    if (movements.length > 0) {
      const existingMovs = this.getStockMovements();
      this.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, [...movements, ...existingMovs]);
    }

    // Update active shift sales totals
    this.recordShiftSale(sale);

    // Log audit
    this.logAudit(
      sale.cashierId,
      sale.cashierName,
      'Process Sale Checkout',
      'sale',
      `Completed sale #${sale.saleNumber} for ${sale.items.length} items. Total: ${formatCurrency(sale.grandTotal, 'Rp')}`
    );
  }

  // Drafts / Hold Carts
  public getDrafts(): DraftTransaction[] {
    return this.getItem<DraftTransaction[]>(STORAGE_KEYS.DRAFTS, []);
  }

  public saveDraft(draft: DraftTransaction): void {
    const drafts = this.getDrafts();
    drafts.unshift(draft);
    this.setItem(STORAGE_KEYS.DRAFTS, drafts);
  }

  public deleteDraft(id: string): void {
    const drafts = this.getDrafts().filter((d) => d.id !== id);
    this.setItem(STORAGE_KEYS.DRAFTS, drafts);
  }

  // Sales Returns
  public getSalesReturns(): SalesReturn[] {
    return this.getItem<SalesReturn[]>(STORAGE_KEYS.SALES_RETURNS, []);
  }

  public saveSalesReturn(salesReturn: SalesReturn): void {
    const returns = this.getSalesReturns();
    returns.unshift(salesReturn);
    this.setItem(STORAGE_KEYS.SALES_RETURNS, returns);

    // Update Sale status
    const sales = this.getSales();
    const sIndex = sales.findIndex((s) => s.id === salesReturn.saleId);
    if (sIndex >= 0) {
      sales[sIndex].status = 'refunded';
      this.setItem(STORAGE_KEYS.SALES, sales);
    }

    // Restore stock
    const products = this.getProducts();
    const movements: StockMovement[] = [];

    salesReturn.items.forEach((item) => {
      const pIdx = products.findIndex((p) => p.id === item.productId);
      if (pIdx >= 0) {
        const prod = products[pIdx];
        const stockBefore = prod.stock;
        const stockAfter = stockBefore + item.quantity;
        products[pIdx].stock = stockAfter;

        movements.push({
          id: 'mov_ret_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          productId: prod.id,
          productName: prod.name,
          type: 'sale_return',
          quantityDelta: item.quantity,
          stockBefore,
          stockAfter,
          referenceId: salesReturn.id,
          referenceType: 'Return ' + salesReturn.returnNumber,
          userName: salesReturn.cashierName,
          createdAt: new Date().toISOString(),
        });
      }
    });

    this.setItem(STORAGE_KEYS.PRODUCTS, products);
    if (movements.length > 0) {
      const existingMovs = this.getStockMovements();
      this.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, [...movements, ...existingMovs]);
    }

    const active = this.getActiveUser();
    const settings = this.getSettings();
    this.logAudit(active.id, active.fullName, 'Sales Return Refund', 'sale', `Processed return #${salesReturn.returnNumber} for sale #${salesReturn.saleNumber}. Refunded ${formatCurrency(salesReturn.totalRefund, settings.currencySymbol)}`);
  }

  // Purchases & Purchase Returns
  public getPurchases(): Purchase[] {
    return this.getItem<Purchase[]>(STORAGE_KEYS.PURCHASES, []);
  }

  public savePurchase(purchase: Purchase): void {
    const purchases = this.getPurchases();
    purchases.unshift(purchase);
    this.setItem(STORAGE_KEYS.PURCHASES, purchases);

    // Increase stock upon receiving purchase
    if (purchase.status === 'Received') {
      const products = this.getProducts();
      const movements: StockMovement[] = [];

      purchase.items.forEach((item) => {
        const idx = products.findIndex((p) => p.id === item.productId);
        if (idx >= 0) {
          const prod = products[idx];
          const stockBefore = prod.stock;
          const stockAfter = stockBefore + item.quantity;
          products[idx].stock = stockAfter;

          movements.push({
            id: 'mov_po_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            productId: prod.id,
            productName: prod.name,
            type: 'purchase',
            quantityDelta: item.quantity,
            stockBefore,
            stockAfter,
            referenceId: purchase.id,
            referenceType: 'PO ' + purchase.poNumber,
            userName: purchase.userName,
            createdAt: new Date().toISOString(),
          });
        }
      });

      this.setItem(STORAGE_KEYS.PRODUCTS, products);
      if (movements.length > 0) {
        const existingMovs = this.getStockMovements();
        this.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, [...movements, ...existingMovs]);
      }
    }

    const active = this.getActiveUser();
    const settings = this.getSettings();
    this.logAudit(active.id, active.fullName, 'Create Purchase Order', 'inventory', `Created PO #${purchase.poNumber} from supplier ${purchase.supplierName} for ${formatCurrency(purchase.totalAmount, settings.currencySymbol)}`);
  }

  // Stock Movements & Adjustments & Opname
  public getStockMovements(): StockMovement[] {
    return this.getItem<StockMovement[]>(STORAGE_KEYS.STOCK_MOVEMENTS, []);
  }

  public getStockAdjustments(): StockAdjustment[] {
    return this.getItem<StockAdjustment[]>(STORAGE_KEYS.STOCK_ADJUSTMENTS, []);
  }

  public saveStockAdjustment(adj: StockAdjustment): void {
    const list = this.getStockAdjustments();
    list.unshift(adj);
    this.setItem(STORAGE_KEYS.STOCK_ADJUSTMENTS, list);

    // Update Product Stock
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === adj.productId);
    if (idx >= 0) {
      products[idx].stock = adj.quantityAfter;
      this.setItem(STORAGE_KEYS.PRODUCTS, products);

      // Add Stock Movement
      const movement: StockMovement = {
        id: 'mov_adj_' + Date.now(),
        productId: adj.productId,
        productName: adj.productName,
        type: 'adjustment',
        quantityDelta: adj.quantityAdjusted,
        stockBefore: adj.quantityBefore,
        stockAfter: adj.quantityAfter,
        referenceId: adj.id,
        referenceType: 'Adjustment ' + adj.adjustmentNumber,
        userName: adj.userName,
        notes: `${adj.reason}: ${adj.notes || ''}`,
        createdAt: new Date().toISOString(),
      };
      const movements = this.getStockMovements();
      movements.unshift(movement);
      this.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, movements);
    }

    const active = this.getActiveUser();
    this.logAudit(active.id, active.fullName, 'Stock Adjustment', 'inventory', `Adjusted stock for ${adj.productName} by ${adj.quantityAdjusted} units (${adj.reason})`);
  }

  public getStockOpnames(): StockOpname[] {
    return this.getItem<StockOpname[]>(STORAGE_KEYS.STOCK_OPNAMES, []);
  }

  public saveStockOpname(opname: StockOpname): void {
    const list = this.getStockOpnames();
    const idx = list.findIndex((o) => o.id === opname.id);
    if (idx >= 0) list[idx] = opname;
    else list.unshift(opname);
    this.setItem(STORAGE_KEYS.STOCK_OPNAMES, list);

    if (opname.status === 'completed') {
      // Auto apply adjustments
      const products = this.getProducts();
      const movements: StockMovement[] = [];

      opname.items.forEach((item) => {
        if (item.variance !== 0) {
          const pIdx = products.findIndex((p) => p.id === item.productId);
          if (pIdx >= 0) {
            const stockBefore = products[pIdx].stock;
            const stockAfter = item.physicalStock;
            products[pIdx].stock = stockAfter;

            movements.push({
              id: 'mov_opn_' + Date.now() + '_' + item.productId,
              productId: item.productId,
              productName: item.productName,
              type: 'opname',
              quantityDelta: item.variance,
              stockBefore,
              stockAfter,
              referenceId: opname.id,
              referenceType: 'Opname ' + opname.opnameNumber,
              userName: opname.userName,
              notes: `Stock Opname Count Variance`,
              createdAt: new Date().toISOString(),
            });
          }
        }
      });

      this.setItem(STORAGE_KEYS.PRODUCTS, products);
      if (movements.length > 0) {
        const existingMovs = this.getStockMovements();
        this.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, [...movements, ...existingMovs]);
      }
    }

    const active = this.getActiveUser();
    this.logAudit(active.id, active.fullName, 'Stock Opname Count', 'inventory', `Finalized Stock Opname #${opname.opnameNumber} for ${opname.items.length} items`);
  }

  // Shifts
  public getShifts(): Shift[] {
    return this.getItem<Shift[]>(STORAGE_KEYS.SHIFTS, [DEFAULT_SHIFT]);
  }

  public getActiveShift(): Shift | null {
    const shifts = this.getShifts();
    return shifts.find((s) => s.status === 'open') || null;
  }

  public openShift(startingCash: number, cashierId: string, cashierName: string): Shift {
    const shifts = this.getShifts();
    const newShift: Shift = {
      id: 'shf_' + Date.now(),
      shiftNumber: 'SHF-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(Math.random() * 90 + 10),
      cashierId,
      cashierName,
      startTime: new Date().toISOString(),
      startingCash,
      cashSales: 0,
      cardSales: 0,
      qrSales: 0,
      totalSales: 0,
      cashIn: 0,
      cashOut: 0,
      expectedCash: startingCash,
      status: 'open',
    };
    shifts.unshift(newShift);
    this.setItem(STORAGE_KEYS.SHIFTS, shifts);
    const settings = this.getSettings();
    this.logAudit(cashierId, cashierName, 'Open Cash Shift', 'shift', `Opened new shift ${newShift.shiftNumber} with float ${formatCurrency(startingCash, settings.currencySymbol)}`);
    return newShift;
  }

  public recordShiftSale(sale: Sale): void {
    const activeShift = this.getActiveShift();
    if (!activeShift) return;

    let cashAdd = 0;
    let cardAdd = 0;
    let qrAdd = 0;

    sale.payments.forEach((p) => {
      if (p.method === 'cash') cashAdd += p.amount;
      else if (p.method === 'card') cardAdd += p.amount;
      else if (p.method === 'qr') qrAdd += p.amount;
    });

    // Net cash add = total cash collected minus change returned
    const netCashAdd = Math.max(0, cashAdd - sale.changeAmount);

    activeShift.cashSales += netCashAdd;
    activeShift.cardSales += cardAdd;
    activeShift.qrSales += qrAdd;
    activeShift.totalSales += sale.grandTotal;
    activeShift.expectedCash = activeShift.startingCash + activeShift.cashSales + activeShift.cashIn - activeShift.cashOut;

    const shifts = this.getShifts();
    const idx = shifts.findIndex((s) => s.id === activeShift.id);
    if (idx >= 0) {
      shifts[idx] = activeShift;
      this.setItem(STORAGE_KEYS.SHIFTS, shifts);
    }
  }

  public recordCashMovement(type: 'in' | 'out', amount: number, reason: string): void {
    const activeShift = this.getActiveShift();
    if (!activeShift) return;

    const user = this.getActiveUser();
    if (type === 'in') {
      activeShift.cashIn += amount;
    } else {
      activeShift.cashOut += amount;
    }
    activeShift.expectedCash = activeShift.startingCash + activeShift.cashSales + activeShift.cashIn - activeShift.cashOut;

    const shifts = this.getShifts();
    const idx = shifts.findIndex((s) => s.id === activeShift.id);
    if (idx >= 0) {
      shifts[idx] = activeShift;
      this.setItem(STORAGE_KEYS.SHIFTS, shifts);
    }

    const cashMov: CashMovement = {
      id: 'csh_' + Date.now(),
      shiftId: activeShift.id,
      type,
      amount,
      reason,
      userName: user.fullName,
      createdAt: new Date().toISOString(),
    };
    const list = this.getItem<CashMovement[]>(STORAGE_KEYS.CASH_MOVEMENTS, []);
    list.unshift(cashMov);
    this.setItem(STORAGE_KEYS.CASH_MOVEMENTS, list);

    const settings = this.getSettings();
    this.logAudit(user.id, user.fullName, `Cash ${type === 'in' ? 'Paid In' : 'Paid Out'}`, 'shift', `Cash movement: ${type.toUpperCase()} ${formatCurrency(amount, settings.currencySymbol)} - ${reason}`);
  }

  public closeShift(actualCash: number, notes?: string): Shift | null {
    const activeShift = this.getActiveShift();
    if (!activeShift) return null;

    activeShift.endTime = new Date().toISOString();
    activeShift.actualCash = actualCash;
    activeShift.variance = actualCash - activeShift.expectedCash;
    activeShift.status = 'closed';
    activeShift.notes = notes;

    const shifts = this.getShifts();
    const idx = shifts.findIndex((s) => s.id === activeShift.id);
    if (idx >= 0) {
      shifts[idx] = activeShift;
      this.setItem(STORAGE_KEYS.SHIFTS, shifts);
    }

    const user = this.getActiveUser();
    const settings = this.getSettings();
    this.logAudit(
      user.id,
      user.fullName,
      'Close Cash Shift',
      'shift',
      `Closed shift ${activeShift.shiftNumber}. Expected cash: ${formatCurrency(activeShift.expectedCash, settings.currencySymbol)}, Actual cash: ${formatCurrency(actualCash, settings.currencySymbol)}, Variance: ${formatCurrency(activeShift.variance, settings.currencySymbol)}`
    );

    return activeShift;
  }

  // Audit Logs
  public getAuditLogs(): AuditEvent[] {
    return this.getItem<AuditEvent[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  public logAudit(
    userId: string,
    userName: string,
    action: string,
    category: 'auth' | 'product' | 'inventory' | 'sale' | 'shift' | 'settings' | 'data',
    details: string
  ): void {
    const logs = this.getAuditLogs();
    const newLog: AuditEvent = {
      id: 'aud_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      userId,
      userName,
      action,
      category,
      details,
    };
    logs.unshift(newLog); // Newest first
    if (logs.length > 500) logs.pop(); // Cap at 500 logs
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  // Backup & Restore
  public exportFullBackup(): string {
    const backupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      users: this.getUsers(),
      settings: this.getSettings(),
      categories: this.getCategories(),
      brands: this.getBrands(),
      products: this.getProducts(),
      customers: this.getCustomers(),
      suppliers: this.getSuppliers(),
      sales: this.getSales(),
      drafts: this.getDrafts(),
      salesReturns: this.getSalesReturns(),
      purchases: this.getPurchases(),
      stockMovements: this.getStockMovements(),
      stockAdjustments: this.getStockAdjustments(),
      stockOpnames: this.getStockOpnames(),
      shifts: this.getShifts(),
      auditLogs: this.getAuditLogs(),
    };

    const user = this.getActiveUser();
    this.logAudit(user.id, user.fullName, 'Create System Backup', 'data', `Generated full database backup JSON export`);
    return JSON.stringify(backupData, null, 2);
  }

  public importFullBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (!data.products || !data.settings) {
        throw new Error('Invalid backup file structure.');
      }

      if (data.users) this.setItem(STORAGE_KEYS.USERS, data.users);
      if (data.settings) this.setItem(STORAGE_KEYS.SETTINGS, data.settings);
      if (data.categories) this.setItem(STORAGE_KEYS.CATEGORIES, data.categories);
      if (data.brands) this.setItem(STORAGE_KEYS.BRANDS, data.brands);
      if (data.products) this.setItem(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.customers) this.setItem(STORAGE_KEYS.CUSTOMERS, data.customers);
      if (data.suppliers) this.setItem(STORAGE_KEYS.SUPPLIERS, data.suppliers);
      if (data.sales) this.setItem(STORAGE_KEYS.SALES, data.sales);
      if (data.purchases) this.setItem(STORAGE_KEYS.PURCHASES, data.purchases);
      if (data.shifts) this.setItem(STORAGE_KEYS.SHIFTS, data.shifts);
      if (data.auditLogs) this.setItem(STORAGE_KEYS.AUDIT_LOGS, data.auditLogs);

      const user = this.getActiveUser();
      this.logAudit(user.id, user.fullName, 'Restore System Backup', 'data', `Restored full database state from file`);
      return true;
    } catch (e) {
      console.error('Failed to import backup JSON', e);
      return false;
    }
  }

  public resetToDefaultSeed(): void {
    localStorage.clear();
    this.initSeedData();
  }
}

export const storage = new StorageService();
