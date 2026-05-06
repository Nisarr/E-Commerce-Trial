import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Box,
  ShoppingBag,
  CreditCard,
  PartyPopper,
  Ticket,
  Settings,
  LogOut,
  ChevronLeft,
  ShoppingBasket,
  Bell,
  TrendingUp,
  Sparkles,
  Gift,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface SidebarProps {
  activeTab: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, isOpen, onClose }) => {
  const { isAdminModalOpen } = useUIStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    orders: 0,
    returns: 0,
    reviews: 0,
    notifications: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const adminKey = localStorage.getItem('admin_key') || 'adm_sk_72e829fc89d4e37decb405dace50ba5c';
        const res = await fetch('/api/v1/bulk/admin/stats', {
          headers: { 'Authorization': `Bearer ${adminKey}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/adm');
  };

  const sections = [
    {
      title: 'GENERAL',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'banners', icon: Sparkles, label: 'Banners' },
        { id: 'products', icon: Package, label: 'Products' },
        { id: 'special-offers', icon: PartyPopper, label: 'Special Offers' },
        { id: 'best-selling', icon: TrendingUp, label: 'Best Selling' },
        { id: 'new-arrivals', icon: Sparkles, label: 'New Arrivals' },
        { id: 'categories', icon: ClipboardList, label: 'Category' },
        { id: 'inventory', icon: Box, label: 'Inventory' },
        { id: 'orders', icon: ShoppingBag, label: 'Orders' },
        { id: 'customers', icon: CreditCard, label: 'Customers' },
        { id: 'notifications', icon: Bell, label: 'Notifications' },
        { id: 'reviews', icon: PartyPopper, label: 'Reviews' },
        { id: 'returns', icon: Box, label: 'Returns' },
        { id: 'coupons', icon: Ticket, label: 'Coupons' },
        { id: 'popup', icon: Gift, label: 'Popup Manager' },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[70] md:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <aside 
        className={`bg-[var(--adm-bg)]/95 backdrop-blur-xl border-2 border-[#ff6b6b]/30 flex flex-col transition-all duration-500 fixed md:sticky top-4 z-[80] md:z-[60] shadow-[0_8px_32px_rgba(255,107,107,0.08)] flex-shrink-0 my-4 ml-4 rounded-[2.5rem] h-[calc(100vh-2rem)] admin-theme-transition ${
          isAdminModalOpen ? 'hidden' : ''
        } ${
          isCollapsed ? 'md:w-24' : 'md:w-64'
        } ${
          isOpen ? 'translate-x-0 w-[280px]' : '-translate-x-[120%] md:translate-x-0'
        }`}
      >
        {/* Brand Logo & Collapse Toggle */}
        <div className={`p-5 pb-2 relative flex flex-col ${isCollapsed ? 'md:items-center' : ''}`}>
          <div className={`flex items-center h-14 bg-[var(--adm-card-bg)] border border-[#ff6b6b]/10 shadow-sm rounded-[1.25rem] transition-all duration-300 relative ${isCollapsed ? 'md:w-14 md:justify-center px-0' : 'w-full px-4 gap-3'}`}>
            <div className="w-9 h-9 bg-[#ff6b6b]/10 rounded-xl flex items-center justify-center text-[#ff6b6b] flex-shrink-0">
              <ShoppingBasket size={22} strokeWidth={2.5} />
            </div>
            {(!isCollapsed || isOpen) && (
              <>
                <h1 className="text-lg font-black text-[var(--adm-text-primary)] tracking-tighter animate-in fade-in slide-in-from-left-2 duration-300 flex-grow">PlayHouse</h1>
                <button 
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="hidden md:flex w-7 h-7 bg-[var(--adm-bg)] border border-[var(--adm-border)] rounded-lg items-center justify-center text-[var(--adm-text-secondary)] hover:text-[#ff6b6b] hover:border-[#ff6b6b]/30 transition-all shadow-sm"
                >
                  <ChevronLeft size={14} strokeWidth={3} className={isCollapsed ? 'rotate-180' : ''} />
                </button>
                <button 
                  onClick={onClose}
                  className="md:hidden w-7 h-7 bg-[var(--adm-bg)] border border-[var(--adm-border)] rounded-lg flex items-center justify-center text-[var(--adm-text-secondary)] hover:text-[#ff6b6b] transition-all shadow-sm"
                >
                  <ChevronLeft size={14} strokeWidth={3} />
                </button>
              </>
            )}
          </div>
          
          {isCollapsed && !isOpen && (
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="mt-3 w-9 h-9 bg-[var(--adm-card-bg)] border border-[#ff6b6b]/10 rounded-xl flex items-center justify-center text-[var(--adm-text-secondary)] hover:text-[#ff6b6b] shadow-sm transition-all hidden md:flex"
            >
              <ChevronLeft size={18} strokeWidth={3} className="rotate-180" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-grow overflow-y-auto overflow-x-hidden px-5 space-y-8 py-4 custom-scrollbar">
          {sections.map((section, sIndex) => (
            <div key={sIndex} className="space-y-3">
              {(!isCollapsed || isOpen) && (
                <h3 className="px-2 text-[10px] font-black text-[var(--adm-text-secondary)] uppercase tracking-[0.2em]">
                  {section.title}
                </h3>
              )}
              <div className="space-y-2">
                {section.items.map((item) => {
                  const isActive = item.id === activeTab;
                  return (
                    <Link
                      key={item.id}
                      to={`/adm/${item.id}`}
                      onClick={() => {
                        if (window.innerWidth < 768) onClose();
                      }}
                      className={`w-full flex items-center rounded-2xl font-bold text-[13px] transition-all duration-300 group relative border shadow-sm ${
                        isCollapsed && !isOpen ? 'md:justify-center p-3' : 'px-4 py-3.5 gap-3'
                      } ${
                        isActive 
                          ? 'bg-[var(--adm-card-bg)] text-[#ff6b6b] border-[#ff6b6b]/40 shadow-md scale-[1.02]' 
                          : 'bg-[var(--adm-card-bg)]/70 border-[var(--adm-border)] text-[var(--adm-text-secondary)] hover:bg-[var(--adm-card-bg)] hover:text-[#ff6b6b] hover:border-[#ff6b6b]/40 hover:scale-[1.01]'
                      }`}
                    >
                      {isActive && (!isCollapsed || isOpen) && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#ff6b6b] rounded-r-full shadow-[2px_0_10px_rgba(255,107,107,0.4)]" />
                      )}
                      
                      <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform ${isActive ? 'text-[#ff6b6b]' : 'text-[#64748b] group-hover:text-[#ff6b6b]'}`} />
                      
                      {(!isCollapsed || isOpen) && (
                        <span className="flex-grow text-left">{item.label}</span>
                      )}

                      {/* Notification Badges */}
                      {(!isCollapsed || isOpen) && (
                        <>
                          {item.id === 'orders' && stats.orders > 0 && (
                            <span className="bg-[#ff6b6b] text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm animate-pulse">{stats.orders}</span>
                          )}
                          {item.id === 'returns' && stats.returns > 0 && (
                            <span className="bg-[#ff6b6b] text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm animate-pulse">{stats.returns}</span>
                          )}
                          {item.id === 'reviews' && stats.reviews > 0 && (
                            <span className="bg-[#ff6b6b] text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm animate-pulse">{stats.reviews}</span>
                          )}
                          {item.id === 'notifications' && stats.notifications > 0 && (
                            <span className="bg-[#ff6b6b] text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm animate-pulse">{stats.notifications}</span>
                          )}
                        </>
                      )}

                      {/* Collapsed Badge */}
                      {isCollapsed && !isOpen && (
                        <>
                          {((item.id === 'orders' && stats.orders > 0) || 
                            (item.id === 'returns' && stats.returns > 0) || 
                            (item.id === 'reviews' && stats.reviews > 0) || 
                            (item.id === 'notifications' && stats.notifications > 0)) && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-[#ff6b6b] rounded-full border-2 border-white shadow-sm" />
                          )}
                        </>
                      )}

                      {/* Tooltip for collapsed state */}
                      {isCollapsed && !isOpen && (
                        <div className="absolute left-full ml-4 px-3 py-2 bg-[#3e4b5b] text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none md:group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 whitespace-nowrap shadow-2xl z-[100] border border-white/10">
                          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-y-[6px] border-y-transparent border-r-[6px] border-r-[var(--adm-text-primary)]" />
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Cache & Logout */}
        <div className="p-5 pt-2 space-y-2">
          <button 
            onClick={async () => {
              if (isRefreshing) return;
              setIsRefreshing(true);
              const toastId = toast.loading('Refreshing system cache...');
              try {
                const adminKey = localStorage.getItem('admin_key') || 'adm_sk_72e829fc89d4e37decb405dace50ba5c';
                const res = await fetch('/api/v1/system/refresh-cache', { 
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${adminKey}` }
                });
                if (res.ok) {
                  toast.success('Cache updated successfully!', { id: toastId });
                } else {
                  const data = await res.json();
                  toast.error(data.message || 'Failed to update cache', { id: toastId });
                }
              } catch (err) {
                console.error(err);
                toast.error('Network error while updating cache', { id: toastId });
              } finally {
                setIsRefreshing(false);
              }
            }}
            disabled={isRefreshing}
            className={`flex items-center rounded-2xl font-bold text-[13px] transition-all duration-500 group border shadow-sm hover:scale-[1.02] ${
              isRefreshing 
                ? 'bg-amber-50 border-amber-200 text-amber-400 cursor-not-allowed' 
                : 'bg-[var(--adm-card-bg)]/70 border-[var(--adm-border)] text-amber-600 hover:bg-[var(--adm-card-bg)] hover:shadow-md'
            } ${
              isCollapsed && !isOpen ? 'md:justify-center p-3' : 'w-full px-4 py-3.5 gap-3'
            }`}
          >
            {isRefreshing ? (
              <Loader2 size={18} strokeWidth={2.5} className="animate-spin" />
            ) : (
              <RefreshCw size={18} strokeWidth={2.5} className="group-hover:rotate-180 transition-transform duration-500" />
            )}
            {(!isCollapsed || isOpen) && (
              <span className="relative">
                {isRefreshing ? 'Refreshing...' : 'Update Cache'}
                {!isRefreshing && (
                  <span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                )}
              </span>
            )}
          </button>

          <button 
            onClick={handleLogout}
            className={`flex items-center rounded-2xl font-bold text-[13px] text-red-500 hover:bg-[var(--adm-card-bg)] hover:shadow-md transition-all duration-300 group border shadow-sm bg-[var(--adm-card-bg)]/70 border-[var(--adm-border)] hover:scale-[1.02] ${
              isCollapsed && !isOpen ? 'md:justify-center p-3' : 'w-full px-4 py-3.5 gap-3'
            }`}
          >
            <LogOut size={18} strokeWidth={2.5} />
            {(!isCollapsed || isOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
