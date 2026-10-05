import React, { useState } from 'react';
import { Product, Category, Brand } from '../../types/pos';
import { ProductFormModal } from './ProductFormModal';
import { CategoryBrandModal } from './CategoryBrandModal';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  Layers,
  AlertTriangle,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import { downloadCsv, convertToCsv } from '../../services/exportCsv';
import { formatCurrency } from '../../utils/currency';

interface ProductListProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  currencySymbol: string;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onSaveCategory: (category: Category) => void;
  onSaveBrand: (brand: Brand) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  categories,
  brands,
  currencySymbol,
  onSaveProduct,
  onDeleteProduct,
  onSaveCategory,
  onSaveBrand,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);

  const filteredProducts = products.filter((p) => {
    if (!p.active) return false;
    const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcode.includes(q);
    return matchCat && matchSearch;
  });

  const handleExportCsv = () => {
    const data = products.map((p) => ({
      SKU: p.sku,
      Barcode: p.barcode,
      Name: p.name,
      Category: categories.find((c) => c.id === p.categoryId)?.name || '',
      CostPrice: p.costPrice,
      SellingPrice: p.sellingPrice,
      Stock: p.stock,
      MinStock: p.minStock,
      Unit: p.baseUnit,
    }));
    downloadCsv(`Products_Master_${new Date().toISOString().slice(0, 10)}.csv`, convertToCsv(data));
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        alert('CSV file is empty or missing data rows.');
        return;
      }

      let importedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());
        if (cols.length < 3) continue;

        const [sku, barcode, name, categoryName, costStr, sellStr, stockStr, minStockStr, unit] = cols;
        if (!name || !sku) continue;

        const cat = categories.find((c) => c.name.toLowerCase() === (categoryName || '').toLowerCase()) || categories[0];
        const costPrice = parseFloat(costStr) || 0;
        const sellingPrice = parseFloat(sellStr) || 0;
        const stock = parseInt(stockStr, 10) || 0;
        const minStock = parseInt(minStockStr, 10) || 5;

        const existingProd = products.find((p) => p.sku === sku);
        const newProduct: Product = {
          id: existingProd ? existingProd.id : 'prd_' + Date.now() + '_' + i,
          sku,
          code: sku,
          barcode: barcode || sku,
          name,
          categoryId: cat ? cat.id : categories[0]?.id || 'cat_gen',
          costPrice,
          sellingPrice,
          stock,
          minStock,
          baseUnit: unit || 'Pcs',
          unitConversions: existingProd ? existingProd.unitConversions : [{ unitName: unit || 'Pcs', conversionFactor: 1 }],
          priceTiers: existingProd ? existingProd.priceTiers : [
            { tierName: 'Retail', price: sellingPrice },
            { tierName: 'Wholesale', price: sellingPrice * 0.9 },
            { tierName: 'VIP', price: sellingPrice * 0.85 },
          ],
          active: true,
          createdAt: existingProd ? existingProd.createdAt : new Date().toISOString(),
        };

        onSaveProduct(newProduct);
        importedCount++;
      }

      alert(`Successfully imported/updated ${importedCount} products from CSV!`);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 bg-slate-950 p-4 md:p-6 overflow-y-auto space-y-5 text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-400" />
            Products & Catalog Master
          </h1>
          <p className="text-xs text-slate-400">
            Manage inventory items, pricing tiers, units, categories, and barcodes
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Categories & Brands</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="bg-[#1E293B] hover:bg-slate-800 text-slate-200 border border-slate-800 px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
            <span>EXPORT CSV</span>
          </button>
          <label className="bg-[#1E293B] hover:bg-slate-800 text-slate-200 border border-slate-800 px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>IMPORT CSV</span>
            <input type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
          </label>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-950 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, SKU, or barcode..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                <th className="p-3">Product Name</th>
                <th className="p-3">SKU & Barcode</th>
                <th className="p-3">Category</th>
                <th className="p-3">Cost Price</th>
                <th className="p-3">Selling Price</th>
                <th className="p-3">Stock Level</th>
                <th className="p-3">Units & Tiers</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No active products found in catalogue.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const cat = categories.find((c) => c.id === p.categoryId);
                  const isLowStock = p.stock <= p.minStock;

                  return (
                    <tr key={p.id} className="hover:bg-slate-850 transition">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-950 overflow-hidden flex-shrink-0 border border-slate-800 flex items-center justify-center">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-bold text-slate-700">{p.name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-100">{p.name}</div>
                            <div className="text-[10px] text-slate-400">
                              Base Unit: {p.baseUnit}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-300">{p.sku}</div>
                        <div className="text-[10px] text-slate-500">{p.barcode}</div>
                      </td>
                      <td className="p-3 text-slate-300">{cat?.name || 'Unassigned'}</td>
                      <td className="p-3 text-slate-400">
                        {formatCurrency(p.costPrice, currencySymbol)}
                      </td>
                      <td className="p-3 font-bold text-emerald-400">
                        {formatCurrency(p.sellingPrice, currencySymbol)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`font-bold ${
                              p.stock <= 0
                                ? 'text-rose-400'
                                : isLowStock
                                ? 'text-amber-400'
                                : 'text-slate-200'
                            }`}
                          >
                            {p.stock} {p.baseUnit}
                          </span>
                          {isLowStock && (
                            <span className="p-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800" title="Low Stock Warning">
                              <AlertTriangle className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-[10px] text-slate-400">
                        <div>Units: {p.unitConversions.map((u) => u.unitName).join(', ')}</div>
                        <div>Tiers: {p.priceTiers.length} Pricing Rules</div>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 hover:text-rose-300 text-slate-400"
                          title="Deactivate Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {(showAddModal || editingProduct) && (
        <ProductFormModal
          initialProduct={editingProduct}
          categories={categories}
          brands={brands}
          currencySymbol={currencySymbol}
          onSaveProduct={onSaveProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Categories & Brands Modal */}
      {showCategoryModal && (
        <CategoryBrandModal
          categories={categories}
          brands={brands}
          onSaveCategory={onSaveCategory}
          onSaveBrand={onSaveBrand}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </div>
  );
};
