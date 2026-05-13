import React, { useState, useEffect } from 'react';
import { Tag, Trash2, Plus, Package } from 'lucide-react';
import { premiumAction } from '../premiumAction';

export const SpecialOfferPreview: React.FC = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/v1/products?tag=special-offer&limit=100').then(r => r.json()).then(d => setOffers(d.items || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const parseImgs = (p: any) => { try { return typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []); } catch { return []; } };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div><h2 className="text-3xl font-black text-primary tracking-tight mb-2">Special Offers</h2><p className="text-muted font-medium">Manage products featured in the homepage countdown section.</p></div>
        <button onClick={() => premiumAction('Adding special offers')} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs bg-orange-500 text-white shadow-lg shadow-orange-200"><Plus size={18} /> Add Products</button>
      </div>
      <div className="bg-white md:rounded-[2.5rem] md:shadow-xl md:border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8 space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 w-full rounded-2xl skeleton" />)}</div> : (
          <table className="w-full text-left hidden md:table">
            <thead className="bg-gray-50/50 border-b border-gray-100"><tr>
              <th className="px-8 py-5 font-black text-primary text-[10px] uppercase tracking-[0.2em]">Active Special Offers</th>
              <th className="px-8 py-5 font-black text-primary text-[10px] uppercase tracking-[0.2em]">Price</th>
              <th className="px-8 py-5 font-black text-primary text-[10px] uppercase tracking-[0.2em] text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {offers.length === 0 ? <tr><td colSpan={3} className="px-8 py-20 text-center"><div className="flex flex-col items-center gap-4"><div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-200"><Tag size={32} /></div><p className="font-black text-primary uppercase tracking-widest text-sm">No special offers active</p></div></td></tr>
              : offers.map((p: any) => {
                const imgs = parseImgs(p);
                return (
                  <tr key={p.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-5"><div className="flex items-center gap-5"><div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden shadow-sm"><img src={imgs[0]||'/placeholder.jpg'} alt="" className="w-full h-full object-cover" /></div><div><div className="font-bold text-primary text-base">{p.title}</div><span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-[9px] font-black uppercase">OFFER ACTIVE</span></div></div></td>
                    <td className="px-8 py-5"><span className="text-base font-black text-primary">৳{p.salePrice || p.price}</span>{p.salePrice && p.salePrice < p.price && <span className="text-xs text-muted line-through font-bold ml-2">৳{p.price}</span>}</td>
                    <td className="px-8 py-5"><div className="flex justify-end"><button onClick={() => premiumAction('Removing offers')} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /> Remove</button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="bg-orange-50/50 rounded-3xl p-6 border-2 border-dashed border-orange-200 flex items-center gap-6">
        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0"><Package size={24} /></div>
        <div><h4 className="font-black text-primary text-xs uppercase tracking-widest">Display Logic</h4><p className="text-xs text-muted font-medium mt-1">The homepage countdown section displays the <span className="font-bold text-orange-600">4 most recently added</span> special offers.</p></div>
      </div>
    </div>
  );
};
