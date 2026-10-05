import React, { useState, useRef } from 'react';
import {
  Product,
  Category,
  Brand,
  UnitConversion,
  PriceTier,
  ProductVariant,
} from '../../types/pos';
import { Package, Plus, Trash2, X, Check, Upload, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { convertImageFileToBase64, formatBytes } from '../../utils/imageUpload';

interface ProductFormModalProps {
  initialProduct?: Product | null;
  categories: Category[];
  brands: Brand[];
  currencySymbol?: string;
  onSaveProduct: (product: Product) => void;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  initialProduct,
  categories,
  brands,
  currencySymbol = 'Rp',
  onSaveProduct,
  onClose,
}) => {
  const [name, setName] = useState<string>(initialProduct?.name || '');
  const [sku, setSku] = useState<string>(
    initialProduct?.sku || 'PRD-' + Math.floor(Math.random() * 900 + 100)
  );
  const [code, setCode] = useState<string>(
    initialProduct?.code || String(Math.floor(Math.random() * 9000 + 1000))
  );
  const [barcode, setBarcode] = useState<string>(
    initialProduct?.barcode || '899' + Math.floor(Math.random() * 9000000 + 1000000)
  );
  const [categoryId, setCategoryId] = useState<string>(
    initialProduct?.categoryId || categories[0]?.id || ''
  );
  const [brandId, setBrandId] = useState<string>(initialProduct?.brandId || '');
  const [costPrice, setCostPrice] = useState<number>(initialProduct?.costPrice || 0);
  const [sellingPrice, setSellingPrice] = useState<number>(initialProduct?.sellingPrice || 0);
  const [stock, setStock] = useState<number>(initialProduct?.stock || 0);
  const [minStock, setMinStock] = useState<number>(initialProduct?.minStock || 5);
  const [baseUnit, setBaseUnit] = useState<string>(initialProduct?.baseUnit || 'Pcs');

  // Local Image File and Base64 State
  const [imageData, setImageData] = useState<string>(initialProduct?.imageUrl || '');
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [imageFileSize, setImageFileSize] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Multi-Unit Conversions
  const [unitConversions, setUnitConversions] = useState<UnitConversion[]>(
    initialProduct?.unitConversions || [{ unitName: 'Pcs', conversionFactor: 1, barcode }]
  );

  // Multi-Price Tiers
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>(
    initialProduct?.priceTiers || [
      { tierName: 'Retail', price: sellingPrice },
      { tierName: 'Wholesale', price: Math.round(sellingPrice * 0.85) },
      { tierName: 'VIP', price: Math.round(sellingPrice * 0.8) },
    ]
  );

  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>(initialProduct?.variants || []);
  const [newVarName, setNewVarName] = useState<string>('');
  const [newVarPrice, setNewVarPrice] = useState<number>(0);

  const handleProcessFile = async (file: File) => {
    if (!file) return;
    setImageError(null);
    setIsProcessingImage(true);

    try {
      const result = await convertImageFileToBase64(file, 600, 0.85);
      setImageData(result.dataUrl);
      setImageFileName(result.originalName);
      setImageFileSize(formatBytes(result.optimizedSize));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process local image file.';
      setImageError(errorMessage);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageData('');
    setImageFileName(null);
    setImageFileSize(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddUnit = () => {
    setUnitConversions((prev) => [
      ...prev,
      { unitName: 'Box (12)', conversionFactor: 12, barcode: barcode + '12' },
    ]);
  };

  const handleRemoveUnit = (index: number) => {
    if (unitConversions.length <= 1) return;
    setUnitConversions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    if (!newVarName.trim()) return;
    setVariants((prev) => [
      ...prev,
      {
        id: 'var_' + Date.now(),
        name: newVarName.trim(),
        sku: `${sku}-${newVarName.toUpperCase().slice(0, 3)}`,
        additionalPrice: newVarPrice,
        stock: 0,
      },
    ]);
    setNewVarName('');
    setNewVarPrice(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const product: Product = {
      id: initialProduct?.id || 'prd_' + Date.now(),
      sku,
      code,
      barcode,
      name: name.trim(),
      categoryId,
      brandId: brandId || undefined,
      costPrice,
      sellingPrice,
      stock,
      minStock,
      baseUnit,
      unitConversions,
      priceTiers,
      variants,
      active: true,
      imageUrl: imageData.trim() || undefined,
      createdAt: initialProduct?.createdAt || new Date().toISOString(),
    };

    onSaveProduct(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">
              {initialProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 flex-1 pr-1">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 font-semibold block mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Premium Espresso Coffee Beans 1kg"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Barcode / EAN</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Brand (Optional)</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">None</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Cost Price ({currencySymbol})</label>
              <input
                type="number"
                step="any"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Base Selling Price ({currencySymbol})</label>
              <input
                type="number"
                step="any"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Current Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Min Stock Alert</label>
              <input
                type="number"
                value={minStock}
                onChange={(e) => setMinStock(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            {/* Local Product Image Upload */}
            <div className="sm:col-span-2">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Product Image (Local Device Upload)</span>
                </label>
                {imageData && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                    {imageFileSize ? `${imageFileSize} • Local Data URL` : 'Stored in Local Database'}
                  </span>
                )}
              </div>

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                id="product-file-upload-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />

              {imageData ? (
                /* 1. Preview State when image is loaded */
                <div
                  id="product-image-preview-card"
                  className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3.5 shadow-inner"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-950 border-2 border-slate-700 shrink-0 relative group shadow-md flex items-center justify-center">
                    <img
                      src={imageData}
                      alt={name || 'Product preview'}
                      className="w-full h-full object-cover"
                      onError={() => setImageError('Failed to load image preview. File may be corrupted.')}
                    />
                    {isProcessingImage && (
                      <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                      <span className="text-xs font-semibold text-slate-100 truncate max-w-[240px]">
                        {imageFileName || (initialProduct?.name ? `${initialProduct.name} Photo` : 'Local Product Image')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Saved directly into offline browser storage as Base64. Persists without internet.
                    </p>

                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      <button
                        type="button"
                        id="change-product-image-button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessingImage}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        title="Select a different image from your device"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                        <span>Change Image</span>
                      </button>

                      <button
                        type="button"
                        id="remove-product-image-button"
                        onClick={handleRemoveImage}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 flex items-center gap-1.5 transition-colors"
                        title="Remove product image"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Remove Image</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* 2. Upload Zone when no image is uploaded */
                <div
                  id="product-image-dropzone"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-emerald-400 bg-emerald-950/30 ring-2 ring-emerald-500/30'
                      : 'border-slate-700 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800/80'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shadow-sm">
                    {isProcessingImage ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-200">
                      {isProcessingImage ? (
                        <span className="text-emerald-400 font-mono">Converting file to Base64...</span>
                      ) : (
                        <>
                          <span className="text-emerald-400 underline underline-offset-2">
                            Click to browse photo
                          </span>{' '}
                          or drag and drop here
                        </>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Supports JPG, PNG, WebP, GIF • Automatically compressed for offline storage
                    </p>
                  </div>
                </div>
              )}

              {/* Processing or Error alerts */}
              {imageError && (
                <div
                  id="product-image-error-alert"
                  className="mt-2 text-[11px] text-rose-300 bg-rose-950/50 border border-rose-800/60 rounded-lg p-2 flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  <span>{imageError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Multi-Unit Conversions Section */}
          <div className="border-t border-slate-800 pt-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-400">Multi-Unit Conversions</span>
              <button
                type="button"
                onClick={handleAddUnit}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Unit
              </button>
            </div>

            <div className="space-y-2">
              {unitConversions.map((uc, index) => (
                <div key={index} className="flex gap-2 items-center text-xs">
                  <input
                    type="text"
                    value={uc.unitName}
                    onChange={(e) => {
                      const updated = [...unitConversions];
                      updated[index].unitName = e.target.value;
                      setUnitConversions(updated);
                    }}
                    placeholder="Unit name e.g. Box"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                  <input
                    type="number"
                    value={uc.conversionFactor}
                    onChange={(e) => {
                      const updated = [...unitConversions];
                      updated[index].conversionFactor = parseFloat(e.target.value) || 1;
                      setUnitConversions(updated);
                    }}
                    placeholder="Factor e.g. 12"
                    className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-center"
                  />
                  {unitConversions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveUnit(index)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
