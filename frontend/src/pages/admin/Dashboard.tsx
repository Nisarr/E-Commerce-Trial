import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, Users, Target, DollarSign,
  AlertTriangle, Loader2
} from 'lucide-react';

interface DashboardStats {
  counts: { products: number; categories: number; users: number; orders: number; reviews: number };
  revenue: number;
  ordersByStatus: Record<string, number>;
  recentOrders: any[];
  lowStockProducts: any[];
  monthlyRevenue: { month: string; total: number; count: number }[];
}

interface DashboardProps {
  stats: { products: number; categories: number; banners: number };
}

export const AdminDashboard: React.FC<DashboardProps> = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/dashboard/stats')
      .then(res => res.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-[#ff6b6b]" size={40} />
      </div>
    );
  }

  const { counts, revenue, ordersByStatus, recentOrders, lowStockProducts, monthlyRevenue } = data;
  const pendingOrders = ordersByStatus['Pending'] || 0;
  const processingOrders = ordersByStatus['Processing'] || 0;
  const deliveredOrders = ordersByStatus['Delivered'] || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-black text-[#3e4b5b] tracking-tight">Welcome Back, Admin!</h2>
        <p className="text-sm font-medium text-gray-400 mt-1">Here's what's happening with your store today.</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`$${(revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} icon={DollarSign} color="orange" subtitle={`${counts.orders} orders`} />
        <StatCard label="Products" value={counts.products.toLocaleString()} icon={ShoppingBag} color="coral" subtitle={`${counts.categories} categories`} />
        <StatCard label="Customers" value={counts.users.toLocaleString()} icon={Users} color="red" subtitle={`${counts.reviews} reviews`} />
        <StatCard label="Pending Orders" value={(pendingOrders + processingOrders).toString()} icon={Target} color="orange" subtitle={`${deliveredOrders} delivered`} />
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
            {monthlyRevenue.length > 0 ? (
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
                    return (
                      <g key={i}>
                        <rect x={x - barW / 2} y={200 - h} width={barW} height={h} rx={6} fill="#ff6b6b" className="opacity-70 hover:opacity-100 transition-opacity cursor-pointer" />
                        <text x={x} y={200 - h - 8} textAnchor="middle" className="text-[10px] font-bold fill-[#3e4b5b]">
                          ${Math.round(m.total)}
                        </text>
                        <text x={x} y={218} textAnchor="middle" className="text-[9px] font-bold fill-gray-400 uppercase">
                          {m.month.split('-')[1]}
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
            {Object.entries(ordersByStatus).map(([status, count]) => {
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
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-400 font-medium text-center py-6">All products are well stocked! 🎉</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                  <span className="text-[12px] font-bold text-[#3e4b5b] truncate max-w-[160px]">{p.title}</span>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${
                    (p.stock ?? 0) === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {p.stock ?? 0} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-[#3e4b5b]">Recent Orders</h3>
          </div>
          {recentOrders.length === 0 ? (
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
                      <td className="py-3 text-right text-[12px] font-black text-[#3e4b5b]">${(order.totalAmount || 0).toFixed(2)}</td>
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

const StatCard: React.FC<{ label: string; value: string; icon: any; color: string; subtitle?: string }> = ({ label, value, icon: Icon, color, subtitle }) => {
  const colorMap: any = {
    orange: 'bg-[#ff6b6b]/10 text-[#ff6b6b]',
    coral: 'bg-[#ff9f43]/10 text-[#ff9f43]',
    red: 'bg-[#ee5253]/10 text-[#ee5253]',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${colorMap[color] || 'bg-gray-100 text-gray-500'}`}>
          <Icon size={20} />
        </div>
      </div>
      <h4 className="text-xl font-black text-[#3e4b5b] tracking-tight mb-0.5">{value}</h4>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      {subtitle && <p className="text-[10px] font-medium text-gray-400 mt-1">{subtitle}</p>}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff6b6b]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

const ChartLegend: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <div className="flex items-center gap-2">
    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
  </div>
);
