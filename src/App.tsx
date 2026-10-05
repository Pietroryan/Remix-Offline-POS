import React, { useState, useEffect } from 'react';
import {
  Product,
  Category,
  Brand,
  Sale,
  Shift,
  Customer,
  Supplier,
  Purchase,
  StockMovement,
  StockAdjustment,
  StockOpname,
  StoreSettings,
  User,
  SalesReturn,
} from './types/pos';
import { storage } from './services/storage';

// Common Components
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LoginModal } from './components/auth/LoginModal';
import { LoginPage } from './components/auth/LoginPage';
import { LogoutConfirmModal } from './components/auth/LogoutConfirmModal';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { authService } from './services/auth';

// Feature Views
import { PosTerminal } from './components/pos/PosTerminal';
import { SalesHistoryView } from './components/sales/SalesHistoryView';
import { ProductList } from './components/products/ProductList';
import { InventoryOverview } from './components/inventory/InventoryOverview';
import { PurchaseOrderList } from './components/purchases/PurchaseOrderList';
import { CustomerManager } from './components/contacts/CustomerManager';
import { ShiftManagementView } from './components/shifts/ShiftManagementView';
import { DashboardView } from './components/reports/DashboardView';
import { SettingsView } from './components/settings/SettingsView';
import { BackupRestoreView } from './components/settings/BackupRestoreView';
import { AuditLogView } from './components/audit/AuditLogView';
import { TemplateStudioModal } from './components/templates/TemplateStudioModal';
import { StoreTemplatePreset } from './data/storeTemplates';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<
    'pos' | 'sales' | 'products' | 'inventory' | 'purchases' | 'contacts' | 'shifts' | 'reports' | 'settings' | 'backup' | 'audit'
  >('pos');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Auth State
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [showTemplateStudio, setShowTemplateStudio] = useState<boolean>(false);

  // Core Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(storage.getSettings());

  // Active Shift State
  const [activeShift, setActiveShift] = useState<Shift | null>(null);

  // Initial Load from Storage
  const loadAllData = () => {
    storage.initSeedData();
    setProducts(storage.getProducts());
    setCategories(storage.getCategories());
    setBrands(storage.getBrands());
    setSales(storage.getSales());
    setShifts(storage.getShifts());
    setCustomers(storage.getCustomers());
    setSuppliers(storage.getSuppliers());
    setPurchases(storage.getPurchases());
    setMovements(storage.getStockMovements());
    setSettings(storage.getSettings());
    setUsers(storage.getUsers());

    const active = storage.getActiveShift();
    setActiveShift(active);

    const currentUser = authService.getCurrentUser();
    setActiveUser(currentUser);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Step 3: Route Guard Popstate Listener - prevent navigating back into inner application when logged out
  useEffect(() => {
    const handlePopState = () => {
      if (!authService.isLoggedIn()) {
        window.history.pushState(null, '', window.location.pathname);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Step 3: Route Guard for role-based view access
  useEffect(() => {
    if (activeUser) {
      // Re-verify session is still active and valid in local database
      const verified = authService.getCurrentUser();
      if (!verified) {
        setActiveUser(null);
        return;
      }

      // Restrict admin-only views if user has 'user' or 'cashier' role
      if (!authService.isAdmin() && (currentView === 'audit' || currentView === 'backup')) {
        setCurrentView('pos');
      }
    }
  }, [currentView, activeUser]);

  // Handlers for POS Sale Completion
  const handleSaveSale = (sale: Sale) => {
    storage.saveSale(sale);
    setSales(storage.getSales());
    setProducts(storage.getProducts());
    setMovements(storage.getStockMovements());
    setShifts(storage.getShifts());
    setActiveShift(storage.getActiveShift());
  };

  // Handlers for Sales Return
  const handleProcessReturn = (
    saleId: string,
    itemsToReturn: { productId: string; quantity: number }[],
    refundAmount: number,
    reason: string
  ) => {
    if (!activeUser) return;
    const targetSale = sales.find((s) => s.id === saleId);
    if (!targetSale) return;

    const returnObj: SalesReturn = {
      id: 'ret_' + Date.now(),
      returnNumber: 'RET-' + Math.floor(Math.random() * 90000 + 10000),
      saleId: targetSale.id,
      saleNumber: targetSale.saleNumber,
      cashierName: activeUser.fullName,
      items: itemsToReturn.map((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const uPrice = prod?.sellingPrice || 0;
        return {
          productId: item.productId,
          productName: prod?.name || 'Product',
          unitName: prod?.baseUnit || 'Pcs',
          quantity: item.quantity,
          unitPrice: uPrice,
          refundAmount: uPrice * item.quantity,
          reason,
        };
      }),
      totalRefund: refundAmount,
      refundMethod: 'cash',
      notes: reason,
      createdAt: new Date().toISOString(),
    };

    storage.saveSalesReturn(returnObj);
    setSales(storage.getSales());
    setProducts(storage.getProducts());
    setMovements(storage.getStockMovements());
  };

  // Handlers for Products CRUD
  const handleSaveProduct = (product: Product) => {
    storage.saveProduct(product);
    setProducts(storage.getProducts());
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this product?')) {
      storage.deleteProduct(id);
      setProducts(storage.getProducts());
    }
  };

  const handleSaveCategory = (category: Category) => {
    storage.saveCategory(category);
    setCategories(storage.getCategories());
  };

  const handleSaveBrand = (brand: Brand) => {
    storage.saveBrand(brand);
    setBrands(storage.getBrands());
  };

  // Handlers for Inventory Adjustments & Opname
  const handleSaveAdjustment = (adj: StockAdjustment) => {
    storage.saveStockAdjustment(adj);
    setProducts(storage.getProducts());
    setMovements(storage.getStockMovements());
  };

  const handleSaveOpname = (opname: StockOpname) => {
    storage.saveStockOpname(opname);
    setProducts(storage.getProducts());
    setMovements(storage.getStockMovements());
  };

  // Handlers for Purchases
  const handleSavePurchase = (purchase: Purchase) => {
    storage.savePurchase(purchase);
    setPurchases(storage.getPurchases());
    setProducts(storage.getProducts());
    setMovements(storage.getStockMovements());
  };

  // Handlers for Contacts
  const handleSaveCustomer = (customer: Customer) => {
    storage.saveCustomer(customer);
    setCustomers(storage.getCustomers());
  };

  const handleSaveSupplier = (supplier: Supplier) => {
    storage.saveSupplier(supplier);
    setSuppliers(storage.getSuppliers());
  };

  // Handlers for Shift Management
  const handleOpenShift = (startingCash: number) => {
    if (!activeUser) return;
    const shift = storage.openShift(startingCash, activeUser.id, activeUser.fullName);
    setActiveShift(shift);
    setShifts(storage.getShifts());
  };

  const handleRecordCashMovement = (type: 'in' | 'out', amount: number, reason: string) => {
    if (!activeShift) return;
    storage.recordCashMovement(type, amount, reason);
    setActiveShift(storage.getActiveShift());
    setShifts(storage.getShifts());
  };

  const handleCloseShift = (actualCash: number, notes?: string) => {
    if (!activeShift) return;
    storage.closeShift(actualCash, notes);
    setActiveShift(null);
    setShifts(storage.getShifts());
  };

  // Handlers for Settings
  const handleSaveSettings = (newSettings: StoreSettings) => {
    storage.saveSettings(newSettings);
    setSettings(newSettings);
  };

  // Handlers for Store Presets
  const handleLoadStoreTemplate = (preset: StoreTemplatePreset) => {
    storage.setProducts(preset.products);
    storage.setCategories(preset.categories);
    storage.setBrands(preset.brands);
    const updatedSettings: StoreSettings = {
      ...settings,
      ...preset.settingsDefaults,
      storeName: preset.settingsDefaults.storeName || preset.name,
      receiptHeader: preset.settingsDefaults.receiptHeader || settings.receiptHeader,
      receiptFooter: preset.settingsDefaults.receiptFooter || settings.receiptFooter,
      storeTemplate: preset.id,
      uiTheme: preset.recommendedTheme,
      receiptTemplate: preset.settingsDefaults.receiptTemplate || 'standard-80',
      paperWidth: preset.settingsDefaults.receiptTemplate === 'compact-58' ? '58mm' : '80mm',
    };
    storage.saveSettings(updatedSettings);
    setProducts(preset.products);
    setCategories(preset.categories);
    setBrands(preset.brands);
    setSettings(updatedSettings);
  };

  // Auth Handlers
  const handleSelectUserPin = (pin: string) => {
    const matched = users.find((u) => u.pin === pin);
    if (matched) {
      storage.setActiveUser(matched);
      setActiveUser(matched);
      setShowLoginModal(false);
    } else {
      alert('Invalid PIN code! Please try again.');
    }
  };

  // Step 5: Logout Handler
  const handlePerformLogout = () => {
    // 1. Invalidate session in storage, record audit log, and push state
    authService.logout();

    // 2. Reset user and close all open dialogs
    setActiveUser(null);
    setShowLogoutModal(false);
    setShowLoginModal(false);
    setCurrentView('pos');

    // 3. Invalidate history to prevent navigating back
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // If not logged in, render the Login Page (Step 2)
  if (!activeUser || !authService.isLoggedIn()) {
    return (
      <LoginPage
        settings={settings}
        onLoginSuccess={(user) => {
          setActiveUser(user);
          loadAllData();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* Top Header */}
      <Header
        activeUser={activeUser}
        activeShift={activeShift}
        storeName={settings.storeName}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onNavigateToShifts={() => setCurrentView('shifts')}
        onOpenTemplateStudio={() => setShowTemplateStudio(true)}
        onRequestLogout={() => setShowLogoutModal(true)}
      />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          currentView={currentView}
          isOpen={isSidebarOpen}
          isAdmin={authService.isAdmin()}
          onRequestLogout={() => setShowLogoutModal(true)}
          onSelectView={setCurrentView}
        />

        {/* View Switcher Router */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden">
          {currentView === 'pos' && (
            <PosTerminal
              products={products}
              categories={categories}
              brands={brands}
              customers={customers}
              activeShift={activeShift}
              settings={settings}
              userName={activeUser?.fullName || 'Cashier'}
              onSaveSale={handleSaveSale}
            />
          )}

          {currentView === 'sales' && (
            <SalesHistoryView
              sales={sales}
              currencySymbol={settings.currencySymbol}
              settings={settings}
              onProcessReturn={handleProcessReturn}
            />
          )}

          {currentView === 'products' && (
            <ProductList
              products={products}
              categories={categories}
              brands={brands}
              currencySymbol={settings.currencySymbol}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onSaveCategory={handleSaveCategory}
              onSaveBrand={handleSaveBrand}
            />
          )}

          {currentView === 'inventory' && (
            <InventoryOverview
              products={products}
              movements={movements}
              currencySymbol={settings.currencySymbol}
              userName={activeUser?.fullName || 'Manager'}
              onSaveAdjustment={handleSaveAdjustment}
              onSaveOpname={handleSaveOpname}
            />
          )}

          {currentView === 'purchases' && (
            <PurchaseOrderList
              purchases={purchases}
              suppliers={suppliers}
              products={products}
              settings={settings}
              userName={activeUser?.fullName || 'Purchaser'}
              onSavePurchase={handleSavePurchase}
            />
          )}

          {currentView === 'contacts' && (
            <CustomerManager
              customers={customers}
              suppliers={suppliers}
              currencySymbol={settings.currencySymbol}
              onSaveCustomer={handleSaveCustomer}
              onSaveSupplier={handleSaveSupplier}
            />
          )}

          {currentView === 'shifts' && (
            <ShiftManagementView
              activeShift={activeShift}
              shifts={shifts}
              activeUser={activeUser || users[0]}
              settings={settings}
              onOpenShift={handleOpenShift}
              onRecordCashMovement={handleRecordCashMovement}
              onCloseShift={handleCloseShift}
            />
          )}

          {currentView === 'reports' && (
            <DashboardView
              sales={sales}
              products={products}
              categories={categories}
              settings={settings}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              settings={settings}
              currentUser={activeUser}
              isAdmin={authService.isAdmin()}
              onSaveSettings={handleSaveSettings}
              onOpenTemplateStudio={() => setShowTemplateStudio(true)}
              onUsersUpdated={() => {
                setUsers(storage.getUsers());
                const verified = authService.getCurrentUser();
                setActiveUser(verified);
              }}
            />
          )}

          {currentView === 'backup' && <BackupRestoreView onReloadData={loadAllData} />}

          {currentView === 'audit' && <AuditLogView />}
        </main>
      </div>

      {/* PIN Login Modal */}
      {showLoginModal && (
        <LoginModal
          users={users}
          onSelectUserWithPin={handleSelectUserPin}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* Template & Theme Studio Modal */}
      {showTemplateStudio && (
        <TemplateStudioModal
          isOpen={showTemplateStudio}
          onClose={() => setShowTemplateStudio(false)}
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onLoadStoreTemplate={handleLoadStoreTemplate}
        />
      )}

      {/* Step 5: Logout Confirmation Modal */}
      <LogoutConfirmModal
        user={activeUser}
        activeShift={activeShift}
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirmLogout={handlePerformLogout}
      />

      {/* PWA Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}
