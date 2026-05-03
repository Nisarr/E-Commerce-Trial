import React from 'react';
import { 
  ShoppingBag, 
  Users, 
  Target, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface DashboardProps {
  stats: {
    products: number;
    categories: number;
    banners: number;
  }
}

export const AdminDashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome & Top Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#3e4b5b] tracking-tight">Welcome Back, Admin!</h2>
          <p className="text-sm font-medium text-gray-400 mt-1">Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
            {['ALL', '1M', '6M', '1Y'].map((t) => (
              <button key={t} className={`px-4 py-1.5 rounded-lg text-[11px] font-black tracking-widest transition-all ${t === 'ALL' ? 'bg-[#ff6b6b] text-white shadow-md shadow-[#ff6b6b]/20' : 'text-gray-400 hover:text-[#3e4b5b]'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Products" 
          value={stats.products.toLocaleString()} 
          trend="+2.5%" 
          up 
          icon={ShoppingBag} 
          color="orange" 
        />
        <StatCard 
          label="New Leads" 
          value="9,526" 
          trend="+8.1%" 
          up 
          icon={Users} 
          color="coral" 
        />
        <StatCard 
          label="Total Categories" 
          value={stats.categories.toString()} 
          trend="-0.3%" 
          icon={Target} 
          color="red" 
        />
        <StatCard 
          label="Revenue" 
          value="$123.6k" 
          trend="+10.6%" 
          up 
          icon={DollarSign} 
          color="orange" 
        />
      </div>


      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm shadow-black/[0.01]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-[#3e4b5b]">Performance</h3>
            <div className="flex items-center gap-6">
              <ChartLegend label="Page Views" color="#ff6b6b" />
              <ChartLegend label="Clicks" color="#22c55e" />
            </div>
          </div>
          
          <div className="h-72 w-full relative mt-4">
            <svg viewBox="0 0 1000 300" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 1, 2, 3].map((i) => (
                <line key={i} x1="0" y1={i * 100} x2="1000" y2={i * 100} stroke="#f1f5f9" strokeWidth="1" />
              ))}
              
              {/* Data Definitions */}
              {(() => {
                const viewData = [45, 72, 58, 85, 62, 70, 55, 60, 95, 78, 85, 92];
                const clickData = [25, 45, 35, 55, 48, 60, 50, 65, 80, 72, 85, 82];
                const getX = (i: number) => i * 83 + 42;
                const getY = (v: number) => 300 - (v * 2.5);

                // Generate path strings
                const generatePath = (data: number[]) => {
                  return data.reduce((path, v, i) => {
                    if (i === 0) return `M ${getX(i)} ${getY(v)}`;
                    const prevX = getX(i - 1);
                    const prevY = getY(data[i - 1]);
                    const currX = getX(i);
                    const currY = getY(v);
                    const cp1x = prevX + (currX - prevX) / 2;
                    const cp2x = prevX + (currX - prevX) / 2;
                    return `${path} C ${cp1x} ${prevY}, ${cp2x} ${currY}, ${currX} ${currY}`;
                  }, "");
                };

                const viewPath = generatePath(viewData);
                const clickPath = generatePath(clickData);

                return (
                  <>
                    {/* Areas */}
                    <path d={`${viewPath} L ${getX(11)} 300 L ${getX(0)} 300 Z`} fill="url(#viewGradient)" />
                    <path d={`${clickPath} L ${getX(11)} 300 L ${getX(0)} 300 Z`} fill="url(#clickGradient)" />

                    {/* Bar Chart (Views) */}
                    {viewData.map((v, i) => (
                      <rect 
                        key={i} 
                        x={getX(i) - 12} 
                        y={getY(v)} 
                        width="24" 
                        height={300 - getY(v)} 
                        fill="#ff6b6b" 
                        rx="6"
                        className="opacity-40 hover:opacity-100 transition-all duration-300 cursor-pointer"
                      />
                    ))}

                    {/* Trend Lines */}
                    <path d={viewPath} fill="none" stroke="#ff6b6b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_4px_8px_rgba(255,107,107,0.3)]" />
                    <path d={clickPath} fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_4px_8px_rgba(34,197,94,0.2)]" />

                    {/* Points */}
                    {clickData.map((v, i) => (
                      <circle 
                        key={i} 
                        cx={getX(i)} 
                        cy={getY(v)} 
                        r="5" 
                        fill="white" 
                        stroke="#22c55e" 
                        strokeWidth="2.5" 
                        className="drop-shadow-md"
                      />
                    ))}
                    {viewData.map((v, i) => (
                      <circle 
                        key={i} 
                        cx={getX(i)} 
                        cy={getY(v)} 
                        r="3" 
                        fill="#ff6b6b" 
                        className="opacity-0 hover:opacity-100 transition-opacity"
                      />
                    ))}
                  </>
                );
              })()}
            </svg>
            
            {/* X-Axis Labels */}
            <div className="flex justify-between mt-6 px-2">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                <span key={m} className="text-[10px] font-bold text-gray-400 uppercase">{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Conversions Circle */}
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm shadow-black/[0.01] flex flex-col">
          <h3 className="text-lg font-black text-[#3e4b5b] mb-2">Conversions</h3>
          <p className="text-xs font-medium text-gray-400 mb-8">Weekly overview of your customer retention.</p>
          
          <div className="flex-grow flex flex-col items-center justify-center relative">
            <svg viewBox="0 0 100 100" className="w-48 h-48 -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle 
                cx="50" cy="50" r="40" 
                fill="none" 
                stroke="#ff6b6b" 
                strokeWidth="10" 
                strokeDasharray="165 251" 
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
              <span className="text-3xl font-black text-[#3e4b5b]">65.2%</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Returning</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">This Week</p>
              <p className="text-xl font-black text-[#3e4b5b]">23.5k</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Week</p>
              <p className="text-xl font-black text-[#3e4b5b]">41.05k</p>
            </div>
          </div>
          
          <button className="w-full mt-8 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-[11px] font-black text-[#3e4b5b] uppercase tracking-widest transition-all">
            View Details
          </button>
        </div>
      </div>

      {/* Bottom Section: Top Pages & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Pages Table */}
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm shadow-black/[0.01]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-[#3e4b5b]">Top Pages</h3>
            <button className="text-[10px] font-black text-[#ff6b6b] uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="space-y-5">
            {[
              { path: '/ecommerce.html', views: 465, rate: '4.4%' },
              { path: '/dashboard.html', views: 426, rate: '20.4%' },
              { path: '/chat.html', views: 254, rate: '12.25%' },
              { path: '/auth-login.html', views: 3369, rate: '5.2%' },
              { path: '/email.html', views: 985, rate: '64.2%' },
            ].map((page, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#ff6b6b]/10 group-hover:text-[#ff6b6b] transition-all">
                    <ExternalLink size={14} />
                  </div>
                  <span className="text-[13px] font-bold text-[#3e4b5b] truncate max-w-[120px]">{page.path}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-[13px] font-black text-[#3e4b5b]">{page.views}</span>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${parseFloat(page.rate) < 10 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                    {page.rate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Placeholder / Stats */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm shadow-black/[0.01]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-[#3e4b5b]">Recent Orders</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#ff6b6b]/10 text-[#ff6b6b] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff6b6b] hover:text-white transition-all">
              Create Order <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-50">
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { id: '#RB5625', name: 'Anna M. Hines', prod: 'Laptop', status: 'Completed', amount: '$1,250.00' },
                  { id: '#RB9652', name: 'Judith H. Fritsche', prod: 'Camera', status: 'Completed', amount: '$850.00' },
                  { id: '#RB5984', name: 'Peter T. Smith', prod: 'Watch', status: 'Processing', amount: '$299.00' },
                  { id: '#RB3625', name: 'Emmanuel J. Delcid', prod: 'Phone', status: 'Completed', amount: '$999.00' },
                ].map((order, i) => (
                  <tr key={i} className="group hover:bg-gray-50/50 transition-all">
                    <td className="py-4 text-[13px] font-black text-[#3e4b5b]">{order.id}</td>
                    <td className="py-4 text-[13px] font-bold text-gray-500">{order.name}</td>
                    <td className="py-4 text-[13px] font-bold text-[#3e4b5b]">{order.prod}</td>
                    <td className="py-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${order.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-right text-[13px] font-black text-[#3e4b5b]">{order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string, trend: string, up?: boolean, icon: any, color: string }> = ({ label, value, trend, up, icon: Icon, color }) => {
  const colorMap: any = {
    orange: 'bg-[#ff6b6b]/10 text-[#ff6b6b]',
    coral: 'bg-[#ff9f43]/10 text-[#ff9f43]',
    red: 'bg-[#ee5253]/10 text-[#ee5253]',
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${colorMap[color] || 'bg-gray-100 text-gray-500'}`}>
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black ${up ? 'text-green-500' : 'text-red-500'}`}>
          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend}
        </div>
      </div>
      <div>
        <h4 className="text-xl font-black text-[#3e4b5b] tracking-tight mb-0.5">{value}</h4>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      </div>
      
      {/* Subtle accent border on hover */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff6b6b]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

const ChartLegend: React.FC<{ label: string, color: string }> = ({ label, color }) => (
  <div className="flex items-center gap-2">
    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
  </div>
);
