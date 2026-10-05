import React, { useState, useMemo } from 'react';
import { Sale, Product, Category, StoreSettings } from '../../types/pos';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Award,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { downloadCsv, convertToCsv } from '../../services/exportCsv';
import { formatCurrency } from '../../utils/currency';
import { CurrencyIcon } from '../common/CurrencyIcon';

interface DashboardViewProps {
  sales: Sale[];
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sales,
  products,
  categories,
  settings,
}) => {
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Filter Sales
  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter((s) => {
      if (s.status !== 'completed') return false;
      const sDate = new Date(s.createdAt);

      if (timeFilter === 'today') {
        return sDate.toDateString() === now.toDateString();
      }
      if (timeFilter === 'week') {
        const diffDays = (now.getTime() - sDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }
      if (timeFilter === 'month') {
        return (
          sDate.getMonth() === now.getMonth() && sDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [sales, timeFilter]);

  // Key Performance Indicators
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalOrders = filteredSales.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Estimate Profit (Selling Price - Cost Price)
  const totalProfit = filteredSales.reduce((sum, s) => {
    const saleCost = s.items.reduce((cSum, item) => {
      return cSum + (item.product.costPrice || 0) * item.quantity * item.unitFactor;
    }, 0);
    return sum + (s.grandTotal - saleCost);
  }, 0);

  // Sales Trend Chart Data
  const salesTrendData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSales.forEach((s) => {
      const dateKey = new Date(s.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      map[dateKey] = (map[dateKey] || 0) + s.grandTotal;
    });

    return Object.keys(map).map((key) => ({
      date: key,
      sales: Math.round(map[key] * 100) / 100,
    }));
  }, [filteredSales]);

  // Top Selling Products
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};

    filteredSales.forEach((s) => {
      s.items.forEach((item) => {
        const id = item.productId;
        if (!map[id]) {
          map[id] = { name: item.product.name, qty: 0, revenue: 0 };
        }
        map[id].qty += item.quantity;
        map[id].revenue += item.subtotal;
      });
    });

    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredSales]);

  // Category Distribution Data
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSales.forEach((s) => {
      s.items.forEach((item) => {
        const cat = categories.find((c) => c.id === item.product.categoryId);
        const catName = cat ? cat.name : 'Other';
        map[catName] = (map[catName] || 0) + item.subtotal;
      });
    });

    return Object.keys(map).map((catName) => ({
      name: catName,
      value: Math.round(map[catName] * 100) / 100,
    }));
  }, [filteredSales, categories]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  const handleExportCsv = () => {
    const data = filteredSales.map((s) => ({
      SaleNumber: s.saleNumber,
      Timestamp: s.createdAt,
      Cashier: s.cashierName,
      Customer: s.customerName || 'Walk-in',
      GrandTotal: s.grandTotal,
    }));
    downloadCsv(`Dashboard_Report_${new Date().toISOString().slice(0, 10)}.csv`, convertToCsv(data));
  };

  return (
    <div className="flex-1 bg-slate-950 p-4 md:p-6 overflow-y-auto space-y-6 text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Executive Reports & Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Real-time revenue performance, gross margin estimates, and category distribution
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Filter Pills */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {(['today', 'week', 'month', 'all'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1 rounded-lg font-semibold capitalize transition ${
                  timeFilter === filter
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCsv}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 font-medium flex items-center justify-between">
            TOTAL REVENUE
            <CurrencyIcon currency={settings.currencySymbol} className="w-4 h-4 text-emerald-400" />
          </span>
          <div className="text-2xl font-black text-emerald-400">
            {formatCurrency(totalRevenue, settings.currencySymbol)}
          </div>
          <span className="text-[10px] text-slate-500">Gross sales before taxes</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 font-medium flex items-center justify-between">
            GROSS MARGIN PROFIT
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </span>
          <div className="text-2xl font-black text-emerald-300">
            {formatCurrency(totalProfit, settings.currencySymbol)}
          </div>
          <span className="text-[10px] text-slate-500">Revenue minus cost price</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 font-medium flex items-center justify-between">
            TOTAL TRANSACTIONS
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </span>
          <div className="text-2xl font-black text-slate-100">{totalOrders} Orders</div>
          <span className="text-[10px] text-slate-500">Completed receipts</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 font-medium flex items-center justify-between">
            AVG ORDER VALUE
            <Award className="w-4 h-4 text-amber-400" />
          </span>
          <div className="text-2xl font-black text-slate-100">
            {formatCurrency(avgOrderValue, settings.currencySymbol)}
          </div>
          <span className="text-[10px] text-slate-500">Revenue per ticket</span>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Sales Revenue Trend
          </h3>
          <div className="h-64 w-full">
            {salesTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No revenue recorded for selected period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value: any) => [formatCurrency(Number(value) || 0, settings.currencySymbol), 'Sales']}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#salesGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Category Sales Revenue
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <div className="text-slate-500 text-xs">No sales data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value: any) => [formatCurrency(Number(value) || 0, settings.currencySymbol), 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top Performing Products */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Top 5 Best-Selling Products
        </h3>

        <div className="space-y-2">
          {topProducts.map((p, index) => (
            <div
              key={index}
              className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs"
            >
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 font-extrabold flex items-center justify-center text-xs border border-emerald-800">
                  #{index + 1}
                </span>
                <span className="font-bold text-slate-100">{p.name}</span>
              </div>

              <div className="text-right">
                <span className="font-extrabold text-emerald-400">
                  {formatCurrency(p.revenue, settings.currencySymbol)}
                </span>
                <span className="text-[10px] text-slate-400 block">{p.qty} Units Sold</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
