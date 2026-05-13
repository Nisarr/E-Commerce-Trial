import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Pencil, Trash2, Calendar, ToggleRight, ToggleLeft } from 'lucide-react';
import { premiumAction } from '../premiumAction';

export const CouponPreview: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/v1/coupons').then(r => r.json()).then(d => setCoupons(d.items || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-primary flex items-center gap-2"><Ticket size={24} /> Coupons & Discounts</h2>
          <p className="text-muted font-medium text-sm">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => premiumAction('Creating coupons')} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl font-bold text-sm hover:bg-accent/90 shadow-lg shadow-accent/20">
          <Plus size={18} /> Add Coupon
        </button>
      </div>
      <div className="bg-white md:rounded-[2rem] md:shadow-xl md:shadow-primary/5 md:border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 w-full rounded-2xl border border-gray-50 skeleton" />)}</div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400"><Ticket size={48} /><p className="mt-4 font-bold">No coupons created yet</p></div>
        ) : (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-4 font-black text-xs uppercase tracking-wider text-gray-400">Code</th>
                <th className="text-left px-4 py-4 font-black text-xs uppercase tracking-wider text-gray-400">Discount</th>
                <th className="text-center px-4 py-4 font-black text-xs uppercase tracking-wider text-gray-400">Usage</th>
                <th className="text-center px-4 py-4 font-black text-xs uppercase tracking-wider text-gray-400">Expires</th>
                <th className="text-center px-4 py-4 font-black text-xs uppercase tracking-wider text-gray-400">Active</th>
                <th className="text-center px-4 py-4 font-black text-xs uppercase tracking-wider text-gray-400">Actions</th>
              </tr></thead>
              <tbody>
                {coupons.map((c: any) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4"><span className="font-black text-primary bg-gray-100 px-3 py-1 rounded-lg text-xs tracking-wider">{c.code}</span>{c.description && <p className="text-xs text-muted mt-1">{c.description}</p>}</td>
                    <td className="px-4 py-4"><span className="font-bold text-accent">{c.type === 'percentage' ? `${c.value}%` : `$${Number(c.value).toFixed(2)}`}</span></td>
                    <td className="px-4 py-4 text-center text-xs font-bold text-muted">{c.usedCount || 0}{c.usageLimit ? ` / ${c.usageLimit}` : ' / ∞'}</td>
                    <td className="px-4 py-4 text-center text-xs text-muted">{c.expiresAt ? <span className="flex items-center justify-center gap-1"><Calendar size={11} />{new Date(c.expiresAt).toLocaleDateString()}</span> : 'Never'}</td>
                    <td className="px-4 py-4 text-center"><button onClick={() => premiumAction('Toggling coupon status')} className="text-gray-400 hover:text-accent">{c.isActive ? <ToggleRight size={24} className="text-green-500" /> : <ToggleLeft size={24} />}</button></td>
                    <td className="px-4 py-4"><div className="flex items-center justify-center gap-2">
                      <button onClick={() => premiumAction('Editing coupons')} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Pencil size={14} /></button>
                      <button onClick={() => premiumAction('Deleting coupons')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={14} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
