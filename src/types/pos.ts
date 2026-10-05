export type UserRole = 'admin' | 'user' | 'supervisor' | 'cashier';

export interface User {
  id: string; // Primary key (UUID / string)
  username: string; // Unik, required
  password_hash: string; // Hasil hashing SHA-256
  nama_lengkap: string; // Required full name
  fullName: string; // Backward-compatibility alias
  role: UserRole; // 'admin' | 'user' (supports supervisor/cashier for existing modules)
  is_active: boolean; // Default: true
  active: boolean; // Backward-compatibility alias
  mustChangePassword?: boolean; // True jika user belum mengganti password default
  last_login?: string | null; // DATETIME nullable
  created_at: string; // DATETIME auto ISO
  createdAt: string; // Backward-compatibility alias
  pin?: string; // 4-digit PIN for quick cashier unlock
  avatarUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  productCount?: number;
  active?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  active?: boolean;
}

export interface UnitConversion {
  unitName: string;
  conversionFactor: number; // e.g., Pcs = 1, Box = 12, Carton = 144
  barcode?: string;
}

export interface PriceTier {
  tierName: 'Retail' | 'Wholesale' | 'VIP';
  price: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  additionalPrice: number;
  stock: number;
}

export interface Product {
  id: string;
  sku: string;
  code: string;
  barcode: string;
  name: string;
  categoryId: string;
  brandId?: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  baseUnit: string;
  unitConversions: UnitConversion[];
  priceTiers: PriceTier[];
  variants?: ProductVariant[];
  isBundle?: boolean;
  bundleItems?: { productId: string; quantity: number }[];
  active: boolean;
  imageUrl?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  tier: 'Regular' | 'Wholesale' | 'VIP';
  totalSpent: number;
  points: number;
  active: boolean;
  createdAt: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  active: boolean;
  createdAt: string;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  product: Product;
  variantId?: string;
  variantName?: string;
  unitName: string;
  unitFactor: number;
  selectedPriceTier: 'Retail' | 'Wholesale' | 'VIP';
  unitPrice: number;
  quantity: number;
  lineDiscountAmount: number;
  subtotal: number;
}

export type PaymentMethod = 'cash' | 'card' | 'qr' | 'split';

export interface PaymentDetail {
  method: PaymentMethod;
  amount: number;
  referenceNo?: string;
}

export interface Sale {
  id: string;
  saleNumber: string;
  cashierId: string;
  cashierName: string;
  customerId?: string;
  customerName?: string;
  shiftId?: string;
  items: CartItem[];
  subtotal: number;
  discountType: 'amount' | 'percent';
  discountValue: number;
  totalDiscount: number;
  taxRate: number;
  totalTax: number;
  grandTotal: number;
  payments: PaymentDetail[];
  totalPaid: number;
  changeAmount: number;
  status: 'completed' | 'refunded' | 'partially_refunded';
  createdAt: string;
  notes?: string;
}

export interface DraftTransaction {
  id: string;
  title: string;
  cashierName: string;
  items: CartItem[];
  customerId?: string;
  customerName?: string;
  createdAt: string;
}

export interface SalesReturnItem {
  productId: string;
  productName: string;
  unitName: string;
  quantity: number;
  unitPrice: number;
  refundAmount: number;
  reason: string;
}

export interface SalesReturn {
  id: string;
  returnNumber: string;
  saleId: string;
  saleNumber: string;
  cashierName: string;
  items: SalesReturnItem[];
  totalRefund: number;
  refundMethod: PaymentMethod;
  createdAt: string;
  notes?: string;
}

export type StockMovementType = 'sale' | 'sale_return' | 'purchase' | 'purchase_return' | 'adjustment' | 'opname' | 'initial';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantityDelta: number;
  stockBefore: number;
  stockAfter: number;
  referenceId?: string;
  referenceType?: string;
  userName: string;
  notes?: string;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  productId: string;
  productName: string;
  quantityBefore: number;
  quantityAdjusted: number;
  quantityAfter: number;
  reason: 'Damaged' | 'Expired' | 'Inventory Count Variance' | 'Internal Use' | 'Other';
  userName: string;
  notes?: string;
  createdAt: string;
}

export interface StockOpnameItem {
  productId: string;
  productName: string;
  currentStock: number;
  physicalStock: number;
  variance: number;
}

export interface StockOpname {
  id: string;
  opnameNumber: string;
  status: 'draft' | 'completed';
  items: StockOpnameItem[];
  userName: string;
  createdAt: string;
  completedAt?: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  unitCost: number;
  quantity: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  status: 'Received' | 'Pending';
  userName: string;
  createdAt: string;
  notes?: string;
}

export interface PurchaseReturn {
  id: string;
  returnNumber: string;
  purchaseId: string;
  poNumber: string;
  supplierName: string;
  items: PurchaseItem[];
  totalRefund: number;
  userName: string;
  createdAt: string;
  reason: string;
}

export interface Shift {
  id: string;
  shiftNumber: string;
  cashierId: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  startingCash: number;
  cashSales: number;
  cardSales: number;
  qrSales: number;
  totalSales: number;
  cashIn: number;
  cashOut: number;
  expectedCash: number;
  actualCash?: number;
  variance?: number;
  status: 'open' | 'closed';
  notes?: string;
}

export interface CashMovement {
  id: string;
  shiftId: string;
  type: 'in' | 'out';
  amount: number;
  reason: string;
  userName: string;
  createdAt: string;
}

export type UiThemeId =
  | 'modern-light'
  | 'midnight-sapphire'
  | 'artisan-warm'
  | 'high-density'
  | 'emerald-retail';

export type StoreTemplateId =
  | 'cafe-bakery'
  | 'retail-apparel'
  | 'grocery-mart'
  | 'electronics'
  | 'general-pos';

export type ReceiptTemplateId =
  | 'standard-80'
  | 'compact-58'
  | 'tax-invoice'
  | 'gift-slip';

export interface ReceiptTemplate {
  id: string;
  h1Title: string; // Receipt title / main heading (required, no fixed limit)
  h2Address?: string; // Store address (optional, maximum 150 characters)
  footnote1?: string; // Additional information 1 (optional, maximum 100 characters)
  footnote2?: string; // Additional information 2 (optional, maximum 100 characters)
  paperWidth: '58mm' | '80mm';
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface StoreSettings {
  storeName: string;
  address: string;
  phone: string;
  email: string;
  currencySymbol: string;
  currencyCode?: string;
  taxRate: number; // e.g. 10 for 10%
  defaultTaxInclusive: boolean;
  receiptHeader: string;
  receiptFooter: string;
  paperWidth: '58mm' | '80mm';
  logoUrl?: string;
  uiTheme?: UiThemeId;
  storeTemplate?: StoreTemplateId;
  receiptTemplate?: ReceiptTemplateId;
  // Receipt Template Custom Information (H1, H2, Footnote 1, Footnote 2)
  h1Title?: string;
  h2Address?: string;
  footnote1?: string;
  footnote2?: string;
  receiptTemplateConfig?: ReceiptTemplate;
}

export const RECEIPT_PERMISSIONS = {
  VIEW: 'receipt_template.view',
  EDIT: 'receipt_template.edit',
} as const;

export function canEditReceiptTemplate(user: User | null): boolean {
  if (!user) return false;
  // Admin and supervisor have edit permissions
  return user.role === 'admin' || user.role === 'supervisor';
}

export function canViewReceiptTemplate(user: User | null): boolean {
  return !!user;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  category: 'auth' | 'product' | 'inventory' | 'sale' | 'shift' | 'settings' | 'data';
  details: string;
}
