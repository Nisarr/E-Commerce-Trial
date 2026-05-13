import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, Sparkles } from 'lucide-react';
import { premiumAction, getAuthHeaders } from '../premiumAction';

export const BannerPreview: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/v1/banners', { headers: getAuthHeaders() })
      .then(r => r.json()).then(d => setBanners(d.items || [])).catch(() => {});
  }, []);

  return (
    <div className="bg-[var(--adm-card-bg)] md:rounded-[2rem] md:shadow-xl md:border border-[var(--adm-border)] overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-[var(--adm-border)]">
        <div>
          <h2 className="text-2xl font-black text-[var(--adm-text-primary)] flex items-center gap-2"><Sparkles size={24} /> Banner Manager</h2>
          <p className="text-[var(--adm-text-secondary)] text-sm font-medium">{banners.length} banner{banners.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => premiumAction('Creating banners')} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl font-bold text-sm shadow-lg shadow-accent/20">+ Add Banner</button>
      </div>
      <table className="w-full text-left hidden md:table">
        <thead className="bg-[var(--adm-bg)]/50 border-b border-[var(--adm-border)]">
          <tr>
            <th className="px-6 py-4 font-black text-[var(--adm-text-primary)] text-xs uppercase tracking-widest">Details</th>
            <th className="px-6 py-4 font-black text-[var(--adm-text-primary)] text-xs uppercase tracking-widest">Position</th>
            <th className="px-6 py-4 font-black text-[var(--adm-text-primary)] text-xs uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 font-black text-[var(--adm-text-primary)] text-xs uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {banners.length === 0 ? (
            <tr><td colSpan={4} className="px-6 py-12 text-center text-[var(--adm-text-secondary)] font-bold">No banners found.</td></tr>
          ) : banners.map((b: any) => (
            <tr key={b.id} className="hover:bg-[var(--adm-bg)]/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-14 rounded-xl overflow-hidden shadow-sm border border-[var(--adm-border)] bg-[var(--adm-bg)]">
                    <img src={b.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-black text-[var(--adm-text-primary)] text-sm">Order: {b.order}</div>
                    <div className="text-[10px] text-[var(--adm-text-secondary)] font-bold truncate max-w-[200px]">{b.link || 'No link'}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4"><span className="px-3 py-1 bg-primary/5 text-[var(--adm-text-primary)] rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/10">{b.position}</span></td>
              <td className="px-6 py-4"><span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">Active</span></td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  <button onClick={() => premiumAction('Editing banners')} className="p-2 text-[var(--adm-text-secondary)] hover:text-accent hover:bg-accent/5 rounded-lg transition-all"><Edit3 size={18} /></button>
                  <button onClick={() => premiumAction('Deleting banners')} className="p-2 text-[var(--adm-text-secondary)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-100">
        {banners.map((b: any) => (
          <div key={b.id} className="p-4 space-y-3">
            <div className="aspect-[21/9] rounded-2xl overflow-hidden border border-[var(--adm-border)]"><img src={b.image} alt="" className="w-full h-full object-cover" /></div>
            <div className="flex gap-2">
              <button onClick={() => premiumAction('Editing banners')} className="flex-1 py-2 bg-[var(--adm-bg)] rounded-xl text-[10px] font-black text-center border"><Edit3 size={14} className="inline mr-1" />Edit</button>
              <button onClick={() => premiumAction('Deleting banners')} className="flex-1 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black text-center border border-red-100"><Trash2 size={14} className="inline mr-1" />Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
