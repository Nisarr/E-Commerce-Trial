import React, { useEffect, useState } from 'react';
import {
  Ticket, Plus, Pencil, Trash2, Loader2, X, Check,
  Percent, DollarSign, Calendar, AlertCircle, CheckCircle2, ToggleLeft, ToggleRight
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount?: number;
  isActive?: number;
  startsAt?: string;
  expiresAt?: string;
}

const EMPTY_FORM: {
  code: string; description: string; type: 'percentage' | 'fixed'; value: number;
  minOrderAmount: number; maxDiscount: number; usageLimit: number; isActive: number;
  startsAt: string; expiresAt: string;
} = {
  code: '', description: '', type: 'percentage', value: 0,
  minOrderAmount: 0, maxDiscount: 0, usageLimit: 0, isActive: 1,
  startsAt: '', expiresAt: '',
};

export const CouponManager: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/v1/coupons');
      const data = await res.json();
      setCoupons(data.items || []);
    } catch { setCoupons([]); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowForm(false);
    setError('');
  };

  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      description: c.description || '',
      type: c.type,
      value: c.value,
      minOrderAmount: c.minOrderAmount || 0,
      maxDiscount: c.maxDiscount || 0,
      usageLimit: c.usageLimit || 0,
      isActive: c.isActive ?? 1,
      startsAt: c.startsAt ? new Date(c.startsAt).toISOString().slice(0, 16) : '',
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 16) : '',
    });
    setEditing(c);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.value) { setError('Code and value are required.'); return; }
    setSaving(true); setError('');
    try {
      const url = editing ? `/api/v1/coupons/${editing.id}` : '/api/v1/coupons';
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          startsAt: form.startsAt || null,
          expiresAt: form.expiresAt || null,
          usageLimit: form.usageLimit || null,
          maxDiscount: form.maxDiscount || null,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Failed'); }
      setSuccess(editing ? 'Coupon updated!' : 'Coupon created!');
      setTimeout(() => setSuccess(''), 3000);
      resetForm();
      await fetchCoupons();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await fetch(`/api/v1/coupons/${id}`, { method: 'DELETE' });
      await fetchCoupons();
    } catch { setError('Failed to delete coupon.'); }
  };

  const handleToggleActive = async (c: Coupon) => {
    try {
      await fetch(`/api/v1/coupons/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: c.isActive ? 0 : 1 }),
      });
      await fetchCoupons();
    } catch {}
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-primary flex items-center gap-2">
            <Ticket size={24} /> Coupons & Discounts
          </h2>
          <p className="text-muted font-medium text-sm">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''}</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl font-bold text-sm hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
          >
            <Plus size={18} /> Add Coupon
          </button>
        )}
      </div>

      {success && <div className="p-3 bg-green-50 text-green-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-green-100"><CheckCircle2 size={14} /> {success}</div>}
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100"><AlertCircle size={14} /> {error}</div>}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-primary">{editing ? 'Edit Coupon' : 'New Coupon'}</h3>
            <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-500 uppercase">Code *</label>
              <input
                type="text" required value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent/20 bg-gray-50"
                placeholder="SAVE10"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-500 uppercase">Description</label>
              <input
                type="text" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 bg-gray-50"
                placeholder="10% off all orders"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-500 uppercase">Type *</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setForm({ ...form, type: 'percentage' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-colors ${form.type === 'percentage' ? 'bg-accent text-white border-accent' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  <Percent size={14} /> Percentage
                </button>
                <button type="button" onClick={() => setForm({ ...form, type: 'fixed' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-colors ${form.type === 'fixed' ? 'bg-accent text-white border-accent' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  <DollarSign size={14} /> Fixed Amount
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-500 uppercase">Value * ({form.type === 'percentage' ? '%' : '$'})</label>
              <input type="number" step="0.01" required value={form.value}
                onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent/20 bg-gray-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-500 uppercase">Min. Order ($)</label>
              <input type="number" step="0.01" value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 bg-gray-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-500 uppercase">Max Discount ($)</label>
              <input type="number" step="0.01" value={form.maxDiscount}
                onChange={(e) => setForm({ ...form, maxDiscount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 bg-gray-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-500 uppercase">Usage Limit</label>
              <input type="number" value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 bg-gray-50"
                placeholder="0 = unlimited"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-500 uppercase">Expires At</label>
              <input type="datetime-local" value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 bg-gray-50"
              />
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-6 py-2.5 border border-gray-200 rounded-xl font-bold text-sm text-muted hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-60 flex items-center gap-2 shadow-lg">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {editing ? 'Update' : 'Create'} Coupon
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupon List */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-primary/5 border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Ticket size={48} />
            <p className="mt-4 font-bold">No coupons created yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-4 font-black text-xs uppercase tracking-wider text-gray-400">Code</th>
                  <th className="text-left px-4 py-4 font-black text-xs uppercase tracking-wider text-gray-400">Discount</th>
                  <th className="text-center px-4 py-4 font-black text-xs uppercase tracking-wider text-gray-400">Usage</th>
                  <th className="text-center px-4 py-4 font-black text-xs uppercase tracking-wider text-gray-400">Expires</th>
                  <th className="text-center px-4 py-4 font-black text-xs uppercase tracking-wider text-gray-400">Active</th>
                  <th className="text-center px-4 py-4 font-black text-xs uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const isExpired = c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();
                  return (
                    <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${isExpired ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4">
                        <span className="font-black text-primary bg-gray-100 px-3 py-1 rounded-lg text-xs tracking-wider">{c.code}</span>
                        {c.description && <p className="text-xs text-muted mt-1">{c.description}</p>}
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-accent">
                          {c.type === 'percentage' ? `${c.value}%` : `$${c.value.toFixed(2)}`}
                        </span>
                        {c.minOrderAmount ? <p className="text-[10px] text-muted">Min: ${c.minOrderAmount}</p> : null}
                      </td>
                      <td className="px-4 py-4 text-center text-xs font-bold text-muted">
                        {c.usedCount || 0}{c.usageLimit ? ` / ${c.usageLimit}` : ' / ∞'}
                      </td>
                      <td className="px-4 py-4 text-center text-xs text-muted">
                        {c.expiresAt ? (
                          <span className="flex items-center justify-center gap-1">
                            <Calendar size={11} />
                            {new Date(c.expiresAt).toLocaleDateString()}
                          </span>
                        ) : 'Never'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button onClick={() => handleToggleActive(c)} className="text-gray-400 hover:text-accent transition-colors">
                          {c.isActive ? <ToggleRight size={24} className="text-green-500" /> : <ToggleLeft size={24} />}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEdit(c)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
