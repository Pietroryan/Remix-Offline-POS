import React, { useState } from 'react';
import { Customer, Supplier } from '../../types/pos';
import { Users, UserPlus, Truck, Search, Plus, X, Download, Upload } from 'lucide-react';
import { downloadCsv, convertToCsv } from '../../services/exportCsv';
import { formatCurrency } from '../../utils/currency';

interface CustomerManagerProps {
  customers: Customer[];
  suppliers: Supplier[];
  currencySymbol: string;
  onSaveCustomer: (customer: Customer) => void;
  onSaveSupplier: (supplier: Supplier) => void;
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({
  customers,
  suppliers,
  currencySymbol,
  onSaveCustomer,
  onSaveSupplier,
}) => {
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showCustModal, setShowCustModal] = useState<boolean>(false);
  const [showSuppModal, setShowSuppModal] = useState<boolean>(false);

  // New Customer State
  const [custName, setCustName] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [custEmail, setCustEmail] = useState<string>('');
  const [custAddress, setCustAddress] = useState<string>('');
  const [custTier, setCustTier] = useState<'Regular' | 'Wholesale' | 'VIP'>('Regular');

  // New Supplier State
  const [suppName, setSuppName] = useState<string>('');
  const [suppContact, setSuppContact] = useState<string>('');
  const [suppPhone, setSuppPhone] = useState<string>('');
  const [suppEmail, setSuppEmail] = useState<string>('');
  const [suppAddress, setSuppAddress] = useState<string>('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) return;

    const newCust: Customer = {
      id: 'cust_' + Date.now(),
      code: 'CUST-' + Math.floor(Math.random() * 900 + 100),
      name: custName.trim(),
      phone: custPhone.trim() || 'N/A',
      email: custEmail.trim() || undefined,
      address: custAddress.trim() || undefined,
      tier: custTier,
      totalSpent: 0,
      points: 0,
      active: true,
      createdAt: new Date().toISOString(),
    };

    onSaveCustomer(newCust);
    setShowCustModal(false);
    setCustName('');
    setCustPhone('');
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suppName.trim()) return;

    const newSupp: Supplier = {
      id: 'sup_' + Date.now(),
      code: 'SUP-' + Math.floor(Math.random() * 900 + 100),
      name: suppName.trim(),
      contactPerson: suppContact.trim() || 'Manager',
      phone: suppPhone.trim() || 'N/A',
      email: suppEmail.trim() || undefined,
      address: suppAddress.trim() || undefined,
      active: true,
      createdAt: new Date().toISOString(),
    };

    onSaveSupplier(newSupp);
    setShowSuppModal(false);
    setSuppName('');
  };

  const handleExportCustomers = () => {
    const data = customers.map((c) => ({
      Code: c.code,
      Name: c.name,
      Phone: c.phone,
      Email: c.email || '',
      Address: c.address || '',
      Tier: c.tier,
      TotalSpent: c.totalSpent,
      Points: c.points,
    }));
    downloadCsv(`Customers_List_${new Date().toISOString().slice(0, 10)}.csv`, convertToCsv(data));
  };

  const handleImportCustomers = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      let count = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());
        if (cols.length < 2) continue;
        const [code, name, phone, email, address, tierStr] = cols;
        if (!name) continue;

        const newCust: Customer = {
          id: 'cust_' + Date.now() + '_' + i,
          code: code || 'CUST-' + Math.floor(Math.random() * 900 + 100),
          name,
          phone: phone || 'N/A',
          email: email || undefined,
          address: address || undefined,
          tier: (tierStr === 'VIP' || tierStr === 'Wholesale') ? tierStr : 'Regular',
          totalSpent: 0,
          points: 0,
          active: true,
          createdAt: new Date().toISOString(),
        };

        onSaveCustomer(newCust);
        count++;
      }
      alert(`Imported ${count} customers successfully.`);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 bg-slate-950 p-4 md:p-6 overflow-y-auto space-y-5 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            Customers & Suppliers Management
          </h1>
          <p className="text-xs text-slate-400">
            Maintain customer loyalty tiers, contact details, and supplier profiles
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'customers' && (
            <>
              <button
                onClick={handleExportCustomers}
                className="bg-[#1E293B] hover:bg-slate-800 text-slate-200 border border-slate-800 px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>EXPORT CSV</span>
              </button>
              <label className="bg-[#1E293B] hover:bg-slate-800 text-slate-200 border border-slate-800 px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>IMPORT CSV</span>
                <input type="file" accept=".csv" onChange={handleImportCustomers} className="hidden" />
              </label>
            </>
          )}

          {activeTab === 'customers' ? (
            <button
              onClick={() => setShowCustModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center space-x-1.5 transition-colors shadow"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>ADD CUSTOMER</span>
            </button>
          ) : (
            <button
              onClick={() => setShowSuppModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center space-x-1.5 transition-colors shadow"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>ADD SUPPLIER</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'customers'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'suppliers'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Suppliers ({suppliers.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, or code..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Table Content */}
      {activeTab === 'customers' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                  <th className="p-3">Code</th>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Phone & Email</th>
                  <th className="p-3">Loyalty Tier</th>
                  <th className="p-3">Total Spent</th>
                  <th className="p-3">Loyalty Points</th>
                  <th className="p-3">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850 transition">
                    <td className="p-3 font-bold text-emerald-400">{c.code}</td>
                    <td className="p-3 font-bold text-slate-100">{c.name}</td>
                    <td className="p-3 text-slate-300">
                      <div>{c.phone}</div>
                      <div className="text-[10px] text-slate-500">{c.email || '-'}</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          c.tier === 'VIP'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : c.tier === 'Wholesale'
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {c.tier}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-emerald-400">
                      {formatCurrency(c.totalSpent, currencySymbol)}
                    </td>
                    <td className="p-3 text-slate-200">{c.points} pts</td>
                    <td className="p-3 text-slate-400">{c.address || '-'}</td>
                  </tr>
                ))}
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
                  <th className="p-3">Code</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Contact Person</th>
                  <th className="p-3">Phone & Email</th>
                  <th className="p-3">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-850 transition">
                    <td className="p-3 font-bold text-emerald-400">{s.code}</td>
                    <td className="p-3 font-bold text-slate-100">{s.name}</td>
                    <td className="p-3 text-slate-200">{s.contactPerson}</td>
                    <td className="p-3 text-slate-300">
                      <div>{s.phone}</div>
                      <div className="text-[10px] text-slate-500">{s.email || '-'}</div>
                    </td>
                    <td className="p-3 text-slate-400">{s.address || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {showCustModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                Add New Customer
              </h3>
              <button onClick={() => setShowCustModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Alice Johnson"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="+1 555-0192"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Loyalty Tier</label>
                <select
                  value={custTier}
                  onChange={(e) => setCustTier(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Regular">Regular Tier</option>
                  <option value="Wholesale">Wholesale Tier</option>
                  <option value="VIP">VIP Tier</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCustModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Supplier Modal */}
      {showSuppModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                Add New Supplier
              </h3>
              <button onClick={() => setShowSuppModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Supplier / Company Name *</label>
                <input
                  type="text"
                  required
                  value={suppName}
                  onChange={(e) => setSuppName(e.target.value)}
                  placeholder="e.g. Global Beverage Distributors"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Contact Person</label>
                <input
                  type="text"
                  value={suppContact}
                  onChange={(e) => setSuppContact(e.target.value)}
                  placeholder="e.g. David Miller"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Phone</label>
                <input
                  type="text"
                  value={suppPhone}
                  onChange={(e) => setSuppPhone(e.target.value)}
                  placeholder="+1 800-555-9000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSuppModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
