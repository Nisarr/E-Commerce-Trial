import React, { useState } from 'react';
import { X, DollarSign, Percent, Save, Loader2, Tag } from 'lucide-react';
import type { Product } from '../../types';

interface SpecialOfferPriceModalProps {
  product: Product;
  onClose: () => void;
  onSave: (price: number, salePrice: number) => Promise<void>;
}

export const SpecialOfferPriceModal: React.FC<SpecialOfferPriceModalProps> = ({ product, onClose, onSave }) => {
  const [price, setPrice] = useState(product.price);
  const [salePrice, setSalePrice] = useState(product.salePrice || product.price * 0.9);
  const [isSaving, setIsSaving] = useState(false);

  const discountAmount = price - salePrice;
  const discountPercentage = price > 0 ? Math.round((discountAmount / price) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(price, salePrice);
      onClose();
    } catch {
      alert('Failed to save prices');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-primary/20 backdrop-blur-xl flex items-center justify-center z-[110] p-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/40">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-orange-50/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
              <Tag size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-primary tracking-tight">Set Offer Price</h3>
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{product.title.slice(0, 30)}...</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-muted">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-muted/60 uppercase tracking-widest ml-1">Original Price (৳)</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted/40">
                  <DollarSign size={18} />
                </div>
                <input 
                  type="number"
                  min="0"
                  value={price === 0 ? '' : price}
                  onChange={(e) => setPrice(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black text-primary focus:border-accent/30 focus:bg-white outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-orange-600/60 uppercase tracking-widest ml-1">Discounted Price (৳)</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-400">
                  <DollarSign size={18} />
                </div>
                <input 
                  type="number"
                  min="0"
                  value={salePrice === 0 ? '' : salePrice}
                  onChange={(e) => setSalePrice(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  className="w-full pl-12 pr-6 py-4 bg-orange-50 border-2 border-orange-200 rounded-2xl font-black text-orange-600 focus:border-orange-400 focus:bg-white outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Savings</div>
              <div className="text-lg font-black text-primary">৳{discountAmount.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
              <div className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Discount</div>
              <div className="flex items-center gap-1">
                <div className="text-lg font-black text-green-700">{discountPercentage}</div>
                <Percent size={14} className="text-green-600" />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSaving || salePrice >= price}
            className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:shadow-none"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Confirm & Activate Offer
          </button>
        </form>
      </div>
    </div>
  );
};
