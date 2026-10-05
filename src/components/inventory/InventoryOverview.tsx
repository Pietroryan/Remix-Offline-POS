import React, { useState } from 'react';
import {
  Product,
  StockMovement,
  StockAdjustment,
  StockOpname,
} from '../../types/pos';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { StockOpnameView } from './StockOpnameView';
import {
  Boxes,
  AlertTriangle,
  ClipboardCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  FileSpreadsheet,
} from 'lucide-react';
import { downloadCsv, convertToCsv } from '../../services/exportCsv';
import { formatCurrency } from '../../utils/currency';

interface InventoryOverviewProps {
  products: Product[];
  movements: StockMovement[];
  currencySymbol: string;
  userName: string;
  onSaveAdjustment: (adj: StockAdjustment) => void;
  onSaveOpname: (opname: StockOpname) => void;
}

export const InventoryOverview: React.FC<InventoryOverviewProps> = ({
  products,
  movements,
  currencySymbol,
  userName,
  onSaveAdjustment,
  onSaveOpname,
}) => {
  const [activeTab, setActiveTab] = useState<'levels' | 'movements'>('levels');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAdjustmentModal, setShowAdjustmentModal] = useState<boolean>(false);
  const [showOpnameModal, setShowOpnameModal] = useState<boolean>(false);

  // Valuation metrics
  const totalStockItems = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValuationCost = products.reduce((sum, p) => sum + p.stock * p.costPrice, 0);
  const totalValuationRetail = products.reduce((sum, p) => sum + p.stock * p.sellingPrice, 0);
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMovements = movements.filter(
    (m) =>
      m.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCsv = () => {
    const data = movements.map((m) => ({
      Timestamp: m.createdAt,
      Product: m.productName,
      Type: m.type,
      QuantityDelta: m.quantityDelta,
      StockBefore: m.stockBefore,
      StockAfter: m.stockAfter,
      Reference: m.referenceType || '',
      User: m.userName,
    }));
    downloadCsv(`Stock_Movements_${new Date().toISOString().slice(0, 10)}.csv`, convertToCsv(data));
  };

  return (
    <div className="flex-1 bg-slate-950 p-4 md:p-6 overflow-y-auto space-y-5 text-white">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Boxes className="w-6 h-6 text-emerald-400" />
            Inventory & Stock Management
          </h1>
          <p className="text-xs text-slate-400">
            Real-time stock levels, movement history, physical opname, and adjustments
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowOpnameModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition"
          >
            <ClipboardCheck className="w-4 h-4 text-emerald-400" />
            <span>Stock Opname</span>
          </button>
          <button
            onClick={() => setShowAdjustmentModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-950 transition"
          >
            <Boxes className="w-4 h-4" />
            <span>Stock Adjustment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">TOTAL ITEMS IN STOCK</span>
          <div className="text-2xl font-extrabold text-slate-100">{totalStockItems} Units</div>
          <span className="text-[10px] text-slate-500">Across {products.length} catalog SKUs</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">STOCK COST VALUATION</span>
          <div className="text-2xl font-extrabold text-emerald-400">
            {formatCurrency(totalValuationCost, currencySymbol)}
          </div>
          <span className="text-[10px] text-slate-500">Base inventory asset cost</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">RETAIL POTENTIAL VALUE</span>
          <div className="text-2xl font-extrabold text-emerald-300">
            {formatCurrency(totalValuationRetail, currencySymbol)}
          </div>
          <span className="text-[10px] text-slate-500">Gross revenue potential</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            LOW STOCK REORDER ALERTS
          </span>
          <div className="text-2xl font-extrabold text-amber-400">
            {lowStockProducts.length} Items
          </div>
          <span className="text-[10px] text-slate-500">Below minimum threshold</span>
        </div>
      </div>

      {/* Tab Controls & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('levels')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'levels'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Stock Levels & Reorder
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'movements'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Movement Audit Log ({movements.length})
          </button>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter stock or movement logs..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          {activeTab === 'movements' && (
            <button
              onClick={handleExportCsv}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 p-2 rounded-xl text-xs"
              title="Export Movement Log CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table View */}
      {activeTab === 'levels' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                  <th className="p-3">Product Name</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Stock On Hand</th>
                  <th className="p-3">Min Threshold</th>
                  <th className="p-3">Cost Valuation</th>
                  <th className="p-3">Retail Valuation</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((p) => {
                  const isLow = p.stock <= p.minStock;
                  return (
                    <tr key={p.id} className="hover:bg-slate-850 transition">
                      <td className="p-3 font-bold text-slate-100">{p.name}</td>
                      <td className="p-3 text-slate-400">{p.sku}</td>
                      <td className="p-3 font-bold text-slate-200">
                        {p.stock} {p.baseUnit}
                      </td>
                      <td className="p-3 text-slate-400">{p.minStock} {p.baseUnit}</td>
                      <td className="p-3 text-slate-300">
                        {formatCurrency(p.stock * p.costPrice, currencySymbol)}
                      </td>
                      <td className="p-3 font-bold text-emerald-400">
                        {formatCurrency(p.stock * p.sellingPrice, currencySymbol)}
                      </td>
                      <td className="p-3 text-right">
                        {p.stock <= 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                            OUT OF STOCK
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            LOW STOCK
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            IN STOCK
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Quantity Delta</th>
                  <th className="p-3">Before → After</th>
                  <th className="p-3">Reference / Notes</th>
                  <th className="p-3">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      No stock movement audit records found.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-850 transition">
                      <td className="p-3 text-slate-400">
                        {new Date(m.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-slate-200">{m.productName}</td>
                      <td className="p-3">
                        <span className="uppercase text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {m.type}
                        </span>
                      </td>
                      <td className="p-3 font-bold">
                        {m.quantityDelta > 0 ? (
                          <span className="text-emerald-400 flex items-center gap-0.5">
                            <ArrowUpRight className="w-3.5 h-3.5" /> +{m.quantityDelta}
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-0.5">
                            <ArrowDownRight className="w-3.5 h-3.5" /> {m.quantityDelta}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-300">
                        {m.stockBefore} → <span className="font-bold">{m.stockAfter}</span>
                      </td>
                      <td className="p-3 text-slate-400">{m.referenceType || m.notes || '-'}</td>
                      <td className="p-3 text-slate-300">{m.userName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjustment Modal */}
      {showAdjustmentModal && (
        <StockAdjustmentModal
          products={products}
          userName={userName}
          onSaveAdjustment={onSaveAdjustment}
          onClose={() => setShowAdjustmentModal(false)}
        />
      )}

      {/* Opname Modal */}
      {showOpnameModal && (
        <StockOpnameView
          products={products}
          userName={userName}
          onSaveOpname={onSaveOpname}
          onClose={() => setShowOpnameModal(false)}
        />
      )}
    </div>
  );
};
