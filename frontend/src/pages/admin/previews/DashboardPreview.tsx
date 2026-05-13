import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, Users, ShoppingCart } from 'lucide-react';
import { premiumAction, getAuthHeaders } from '../premiumAction';

export const DashboardPreview: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/v1/dashboard/stats', { headers: getAuthHeaders() }).then(r => r.json()).then(d => setStats(d)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Total Revenue', value: `৳${(stats.revenue?.total || 0).toLocaleString()}`, icon: DollarSign, color: 'from-green-500 to-emerald-600', growth: stats.growth?.revenue },
    { label: 'Products', value: stats.counts?.products || 0, icon: Package, color: 'from-blue-500 to-indigo-600', growth: null },
    { label: 'Customers', value: stats.counts?.users || 0, icon: Users, color: 'from-purple-500 to-violet-600', growth: stats.growth?.users },
    { label: 'Orders', value: stats.counts?.orders || 0, icon: ShoppingCart, color: 'from-orange-500 to-amber-600', growth: stats.growth?.orders },
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-black text-[var(--adm-text-primary)] flex items-center gap-2"><BarChart3 size={24} /> Analytics Dashboard</h2><p className="text-[var(--adm-text-secondary)] text-sm font-medium">Real-time business insights</p></div>
        <button onClick={() => premiumAction('Exporting analytics')} className="px-5 py-2.5 bg-accent text-white rounded-xl font-bold text-sm shadow-lg">Export Report</button>
      </div>
      {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{[1,2,3,4].map(i => <div key={i} className="h-32 rounded-2xl skeleton" />)}</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <div key={i} className="relative overflow-hidden bg-[var(--adm-card-bg)] rounded-2xl border border-[var(--adm-border)] p-6 shadow-lg cursor-pointer hover:shadow-xl transition-all" onClick={() => premiumAction('Viewing analytics details')}>
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 rounded-bl-[3rem]`} />
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg`}><card.icon size={22} className="text-white" /></div>
              <p className="text-[10px] font-black text-[var(--adm-text-secondary)] uppercase tracking-widest">{card.label}</p>
              <p className="text-2xl font-black text-[var(--adm-text-primary)] mt-1">{card.value}</p>
              {card.growth && <p className="text-xs font-bold text-green-500 flex items-center gap-1 mt-2"><TrendingUp size={12} />{card.growth}</p>}
            </div>
          ))}
        </div>
      )}
      <div className="bg-[var(--adm-card-bg)] rounded-2xl border border-[var(--adm-border)] p-8 min-h-[300px] flex items-center justify-center cursor-pointer" onClick={() => premiumAction('Viewing detailed charts')}>
        <div className="text-center"><BarChart3 size={64} className="mx-auto text-[var(--adm-text-secondary)] opacity-20 mb-4" /><p className="text-sm font-black text-[var(--adm-text-secondary)]">Detailed Charts & Graphs</p><p className="text-xs text-[var(--adm-text-secondary)] opacity-60 mt-1">Revenue trends, order analytics, customer insights</p></div>
      </div>
    </div>
  );
};
