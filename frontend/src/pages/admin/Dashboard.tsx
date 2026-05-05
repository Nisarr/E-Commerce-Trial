import React, { useEffect, useState, useCallback } from 'react';
import { 
  ShoppingBag, Users, Target, DollarSign,
  AlertTriangle, Calendar, ChevronDown, X
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  counts: { products: number; categories: number; users: number; orders: number; reviews: number; totalSold: number };
  revenue: number;
  ordersByStatus: Record<string, number>;
  recentOrders: any[];
  lowStockProducts: any[];
  monthlyRevenue: { month: string; total: number; count: number }[];
}

interface DashboardProps {
  stats: { products: number; categories: number; banners: number };
}

type TimelinePreset = '7d' | '1m' | '2m' | '3m' | '4m' | '6m' | '1y' | 'custom' | 'lifetime';

const TIMELINE_OPTIONS: { id: TimelinePreset; label: string }[] = [
  { id: '7d', label: '7 Days' },
  { id: '1m', label: '1 Month' },
  { id: '2m', label: '2 Months' },
  { id: '3m', label: '3 Months' },
  { id: '4m', label: '4 Months' },
  { id: '6m', label: '6 Months' },
  { id: '1y', label: '1 Year' },
  { id: 'lifetime', label: 'Lifetime' },
  { id: 'custom', label: 'Custom Range' },
];

function getDateRange(preset: TimelinePreset): { from: number | null; to: number | null } {
  if (preset === 'lifetime') return { from: null, to: null };
  if (preset === 'custom') return { from: null, to: null };

  const now = Date.now();
  const msDay = 86400000;
  const map: Record<string, number> = {
    '7d': 7 * msDay,
    '1m': 30 * msDay,
    '2m': 60 * msDay,
    '3m': 90 * msDay,
    '4m': 120 * msDay,
    '6m': 180 * msDay,
    '1y': 365 * msDay,
  };
  return { from: now - (map[preset] || 0), to: now };
}

export const AdminDashboard: React.FC<DashboardProps> = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<TimelinePreset>('lifetime');
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [activeRange, setActiveRange] = useState<{ from: number | null; to: number | null }>({ from: null, to: null });

  const fetchDashboard = useCallback(async (range: { from: number | null; to: number | null }) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (range.from) params.set('from', range.from.toString());
      if (range.to) params.set('to', range.to.toString());
      const qs = params.toString();
      const res = await fetch(`/api/v1/dashboard/stats${qs ? `?${qs}` : ''}`);
      const json = await res.json();
      setData(json);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(activeRange);
  }, [activeRange, fetchDashboard]);

  const handleTimelineSelect = (preset: TimelinePreset) => {
    setTimeline(preset);
    if (preset === 'custom') {
      // Don't fetch yet — wait for user to submit custom dates
      setIsTimelineOpen(false);
      return;
    }
    const range = getDateRange(preset);
    setActiveRange(range);
    setIsTimelineOpen(false);
  };

  const applyCustomRange = () => {
    if (!customFrom || !customTo) return;
    const from = new Date(customFrom).getTime();
    const to = new Date(customTo).setHours(23, 59, 59, 999);
    setActiveRange({ from, to });
  };

  const getActiveLabel = () => {
    const option = TIMELINE_OPTIONS.find(o => o.id === timeline);
    if (timeline === 'custom' && customFrom && customTo) {
      return `${customFrom} — ${customTo}`;
    }
    return option?.label || 'Lifetime';
  };

  // Initial fallback if data is null while loading
  const counts = data?.counts || { products: 0, categories: 0, users: 0, orders: 0, reviews: 0, totalSold: 0 };
  const revenue = data?.revenue || 0;
  const ordersByStatus = data?.ordersByStatus || {};
  const recentOrders = data?.recentOrders || [];
  const lowStockProducts = data?.lowStockProducts || [];
  const monthlyRevenue = data?.monthlyRevenue || [];

  const pendingOrders = ordersByStatus['Pending'] || 0;
  const processingOrders = ordersByStatus['Processing'] || 0;
  const deliveredOrders = ordersByStatus['Delivered'] || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome + Timeline Selector */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#3e4b5b] tracking-tight">Welcome Back, Admin!</h2>
          <p className="text-sm font-medium text-gray-400 mt-1">Here's what's happening with your store today.</p>
        </div>

        {/* Timeline Picker */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setIsTimelineOpen(!isTimelineOpen)}
            className="flex items-center gap-2.5 px-5 py-3 bg-white border-2 border-gray-100 rounded-2xl shadow-sm hover:border-[#ff6b6b]/30 hover:shadow-md transition-all group"
          >
            <Calendar size={16} className="text-[#ff6b6b]" />
            <span className="text-[12px] font-black text-[#3e4b5b] uppercase tracking-wider">{getActiveLabel()}</span>
            <ChevronDown size={14} className={`text-gray-400 group-hover:text-[#ff6b6b] transition-all ${isTimelineOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Secondary loading indicator removed as per user request */}

          {isTimelineOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsTimelineOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2">
                  <div className="px-3 py-2 mb-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Select Period</span>
                  </div>
                  {TIMELINE_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      onClick={() => handleTimelineSelect(option.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all ${
                        timeline === option.id
                          ? 'bg-[#ff6b6b]/10 text-[#ff6b6b] font-black'
                          : 'text-[#3e4b5b] hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {timeline === 'custom' && (
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-[#ff6b6b]/20 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <Calendar size={18} className="text-[#ff6b6b] flex-shrink-0" />
          <div className="flex items-center gap-3 flex-grow">
            <div className="flex-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">From</label>
              <input
                type="date"
                value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[12px] font-bold text-[#3e4b5b] outline-none focus:border-[#ff6b6b]/30 focus:bg-white transition-all"
              />
            </div>
            <span className="text-gray-300 font-bold mt-4">—</span>
            <div className="flex-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">To</label>
              <input
                type="date"
                value={customTo}
                onChange={e => setCustomTo(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[12px] font-bold text-[#3e4b5b] outline-none focus:border-[#ff6b6b]/30 focus:bg-white transition-all"
              />
            </div>
          </div>
          <button
            onClick={applyCustomRange}
            disabled={!customFrom || !customTo}
            className="px-5 py-2.5 bg-[#ff6b6b] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff5252] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm mt-3"
          >
            Apply
          </button>
          <button
            onClick={() => { setTimeline('lifetime'); setActiveRange({ from: null, to: null }); setCustomFrom(''); setCustomTo(''); }}
            className="p-2 text-gray-400 hover:text-[#ff6b6b] transition-colors mt-3"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Total Revenue" 
            value={`৳${(revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
            icon={DollarSign} 
            color="orange" 
            subtitle={`${counts.orders} orders`} 
            to="/adm/orders" 
            loading={loading}
          />
          <StatCard 
            label="Products" 
            value={counts.products.toLocaleString()} 
            icon={ShoppingBag} 
            color="coral" 
            subtitle={`${counts.categories} categories • ${counts.totalSold} sold`} 
            to="/adm/products" 
            loading={loading}
          />
          <StatCard 
            label="Customers" 
            value={counts.users.toLocaleString()} 
            icon={Users} 
            color="red" 
            subtitle={`${counts.reviews} reviews`} 
            to="/adm/customers" 
            loading={loading}
          />
          <StatCard 
            label="Pending Orders" 
            value={(pendingOrders + processingOrders).toString()} 
            icon={Target} 
            color="orange" 
            subtitle={`${deliveredOrders} delivered`} 
            to="/adm/orders" 
            loading={loading}
          />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-[#3e4b5b]">Monthly Revenue</h3>
            <ChartLegend label="Revenue" color="#ff6b6b" />
          </div>
          <div className="h-64 w-full relative">
            {loading ? (
              <div className="absolute inset-0 flex flex-col justify-between py-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-0.5 w-full bg-gray-50 skeleton" />
                ))}
                <div className="flex items-end justify-around h-48 px-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="w-10 bg-gray-100 rounded-t-lg skeleton" style={{ height: `${20 * i}%` }} />
                  ))}
                </div>
              </div>
            ) : monthlyRevenue.length > 0 ? (
              <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
                {/* Grid */}
                {[0, 1, 2, 3].map(i => (
                  <line key={i} x1="0" y1={i * 50} x2="600" y2={i * 50} stroke="#f1f5f9" strokeWidth="1" />
                ))}
                {(() => {
                  const maxVal = Math.max(...monthlyRevenue.map(m => m.total), 1);
                  const barW = Math.min(50, 500 / monthlyRevenue.length);
                  return monthlyRevenue.map((m, i) => {
                    const x = (600 / (monthlyRevenue.length)) * i + barW;
                    const h = (m.total / maxVal) * 170;
                    const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                    const [, mm] = m.month.split('-');
                    const monthLabel = MONTH_NAMES[parseInt(mm) - 1] || mm;
                    return (
                      <g key={i}>
                        <rect x={x - barW / 2} y={200 - h} width={barW} height={h} rx={6} fill="#ff6b6b" className="opacity-70 hover:opacity-100 transition-opacity cursor-pointer" />
                        <text x={x} y={200 - h - 8} textAnchor="middle" className="text-[10px] font-bold fill-[#3e4b5b]">
                          ৳{Math.round(m.total)}
                        </text>
                        <text x={x} y={218} textAnchor="middle" className="text-[9px] font-bold fill-gray-400 uppercase">
                          {monthLabel}
                        </text>
                      </g>
                    );
                  });
                })()}
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm font-bold">No revenue data yet</div>
            )}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-[#3e4b5b] mb-2">Order Status</h3>
          <p className="text-xs font-medium text-gray-400 mb-6">Breakdown of all orders</p>
          <div className="flex-grow space-y-4">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-3 w-20 bg-gray-100 rounded skeleton" />
                      <div className="h-3 w-12 bg-gray-100 rounded skeleton" />
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full skeleton" />
                  </div>
                ))}
              </div>
            ) : Object.entries(ordersByStatus).map(([status, count]) => {
              const total = counts.orders || 1;
              const pct = Math.round(((count as number) / total) * 100);
              const colorMap: Record<string, string> = {
                'Pending': '#f59e0b', 'Processing': '#3b82f6', 'Shipped': '#8b5cf6',
                'Delivered': '#22c55e', 'Cancelled': '#ef4444',
              };
              const barColor = colorMap[status] || '#9ca3af';
              return (
                <div key={status}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[12px] font-bold text-[#3e4b5b]">{status}</span>
                    <span className="text-[11px] font-black text-gray-400">{count as number} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(ordersByStatus).length === 0 && (
              <p className="text-sm text-gray-400 font-medium text-center py-8">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-[#3e4b5b] flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" /> Low Stock
            </h3>
            <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg">{lowStockProducts.length} items</span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 w-full bg-gray-50 rounded-xl skeleton" />
              ))}
            </div>
          ) : lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-400 font-medium text-center py-6">All products are well stocked! 🎉</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <Link 
                  key={p.id} 
                  to={`/adm/products/${p.id}/buyers`}
                  className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl border border-amber-100 hover:bg-amber-100/50 transition-all cursor-pointer group"
                >
                  <span className="text-[12px] font-bold text-[#3e4b5b] truncate max-w-[160px] group-hover:text-accent transition-colors">{p.title}</span>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${
                    (p.stock ?? 0) === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {p.stock ?? 0} left
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-[#3e4b5b]">Recent Orders</h3>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-14 w-full bg-gray-50 rounded-xl skeleton" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 font-medium text-center py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-50">
                    <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice</th>
                    <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                    <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-all">
                      <td className="py-3 text-[12px] font-black text-[#3e4b5b]">{order.invoiceId}</td>
                      <td className="py-3 text-[12px] font-bold text-gray-500">{order.customerName}</td>
                      <td className="py-3">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                          order.status === 'Delivered' ? 'bg-green-50 text-green-600' :
                          order.status === 'Cancelled' ? 'bg-red-50 text-red-500' :
                          order.status === 'Shipped' ? 'bg-purple-50 text-purple-600' :
                          order.status === 'Processing' ? 'bg-blue-50 text-blue-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-[12px] font-black text-[#3e4b5b]">৳{(order.totalAmount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: any; color: string; subtitle?: string; to?: string; loading?: boolean }> = ({ label, value, icon: Icon, color, subtitle, to, loading }) => {
  const colorMap: any = {
    orange: 'bg-[#ff6b6b]/10 text-[#ff6b6b]',
    coral: 'bg-[#ff9f43]/10 text-[#ff9f43]',
    red: 'bg-[#ee5253]/10 text-[#ee5253]',
  };

  const content = (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${loading ? 'bg-gray-100 skeleton' : colorMap[color] || 'bg-gray-100 text-gray-500'}`}>
          {loading ? <div className="w-5 h-5" /> : <Icon size={20} />}
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-6 w-24 bg-gray-100 rounded skeleton" />
          <div className="h-3 w-16 bg-gray-100 rounded skeleton" />
        </div>
      ) : (
        <>
          <h4 className="text-xl font-black text-[#3e4b5b] tracking-tight mb-0.5">{value}</h4>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        </>
      )}
      {subtitle && (
        loading ? (
          <div className="h-3 w-20 bg-gray-50 rounded mt-2 skeleton" />
        ) : (
          <p className="text-[10px] font-medium text-gray-400 mt-1">{subtitle}</p>
        )
      )}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff6b6b]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </>
  );

  const className = "bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden block cursor-pointer";

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
};

const ChartLegend: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <div className="flex items-center gap-2">
    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
  </div>
);
