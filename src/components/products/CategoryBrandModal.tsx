import React, { useState } from 'react';
import { Category, Brand } from '../../types/pos';
import { Layers, Plus, Trash2, X } from 'lucide-react';

interface CategoryBrandModalProps {
  categories: Category[];
  brands: Brand[];
  onSaveCategory: (category: Category) => void;
  onSaveBrand: (brand: Brand) => void;
  onClose: () => void;
}

export const CategoryBrandModal: React.FC<CategoryBrandModalProps> = ({
  categories,
  brands,
  onSaveCategory,
  onSaveBrand,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'brands'>('categories');
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatDesc, setNewCatDesc] = useState<string>('');

  const [newBrdName, setNewBrdName] = useState<string>('');
  const [newBrdDesc, setNewBrdDesc] = useState<string>('');

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    onSaveCategory({
      id: 'cat_' + Date.now(),
      name: newCatName.trim(),
      description: newCatDesc.trim(),
    });
    setNewCatName('');
    setNewCatDesc('');
  };

  const handleAddBrand = () => {
    if (!newBrdName.trim()) return;
    onSaveBrand({
      id: 'brd_' + Date.now(),
      name: newBrdName.trim(),
      description: newBrdDesc.trim(),
    });
    setNewBrdName('');
    setNewBrdDesc('');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-5">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">Categories & Brands</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-2 text-xs font-semibold ${
              activeTab === 'categories'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={`flex-1 py-2 text-xs font-semibold ${
              activeTab === 'brands'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Brands ({brands.length})
          </button>
        </div>

        {activeTab === 'categories' ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Category name..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
              <button
                onClick={handleAddCategory}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 flex justify-between items-center text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-200">{c.name}</div>
                    {c.description && (
                      <div className="text-[10px] text-slate-400">{c.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Brand name..."
                value={newBrdName}
                onChange={(e) => setNewBrdName(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
              <button
                onClick={handleAddBrand}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {brands.map((b) => (
                <div
                  key={b.id}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 flex justify-between items-center text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-200">{b.name}</div>
                    {b.description && (
                      <div className="text-[10px] text-slate-400">{b.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
