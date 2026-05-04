import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, Menu, User, Bell } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { MegaMenu } from './MegaMenu.tsx';
import { Breadcrumbs } from './Breadcrumbs.tsx';
import { useAuthStore } from '../../store/authStore';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) setIsMobileSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    if (!isMobileSearchOpen) setIsMenuOpen(false);
  };
  const { totalItems } = useCart();
  const wishlistItems = useWishlist((state) => state.items);

  useEffect(() => {
    fetchNotifications();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      const url = user?.id ? `/api/v1/notifications?userId=${user.id}` : '/api/v1/notifications';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setNotifications((prev) => {
          // Send web notifications for any newly arrived unread notifications
          const prevIds = prev.map(p => p.id);
          const newUnread = (data.items || []).filter((n: any) => !n.isRead && !prevIds.includes(n.id));
          if (newUnread.length > 0 && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            newUnread.forEach((n: any) => {
              new Notification(n.title, { body: n.message });
            });
          }
          return data.items || [];
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markRead = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/notifications/${id}/read`, { method: 'POST' });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };



  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Main Navbar */}
      <div className="glass shadow-lg border-b-2 border-[#FF4500] rounded-b-[2rem] w-full">
        <div className="container mx-auto px-4">
          <div className="flex h-14 md:h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden text-primary p-2 hover:bg-white/50 rounded-xl transition-colors cursor-pointer"
                onClick={toggleMenu}
              >
                <Menu size={20} />
              </button>
              <div 
                onClick={() => navigate('/')}
                className="flex items-center gap-2.5 group cursor-pointer select-none"
              >
                <div className="h-8 md:h-10 flex items-center group-hover:scale-110 transition-transform duration-300">
                  <img src="/logo.png" alt="PlayPen House" className="h-full w-auto object-contain rounded-xl shadow-sm" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-bold text-primary tracking-tight leading-none font-garamond">PlayPen</span>
                  <span className="text-[10px] md:text-xs font-bold text-accent tracking-[0.25em] uppercase leading-none mt-1 font-garamond">House</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex flex-1 max-w-2xl px-8 relative group justify-center">
              {location.pathname.startsWith('/account') ? (
                <div className="flex items-center justify-center animate-in fade-in duration-300">
                  <Breadcrumbs className="bg-transparent border-0 shadow-none hover:bg-transparent" />
                </div>
              ) : (
                <>
                  <button className="text-primary text-sm font-bold hover:text-accent py-4 px-4 cursor-pointer flex items-center gap-1 transition-colors group/btn">
                    Categories
                    <div className="w-1 h-1 rounded-full bg-accent scale-0 group-hover/btn:scale-100 transition-transform" />
                  </button>
                  <MegaMenu />
                </>
              )}
            </div>

            <div className="hidden md:flex flex-1 max-w-md relative">
              <form onSubmit={handleSearch} className="w-full relative group">
                <input
                  type="text"
                  placeholder="Search baby products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200/50 bg-white/50 px-4 py-1.5 pl-10 text-xs focus:border-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all shadow-sm"
                />
                <Search className="absolute left-3.5 top-2.5 text-muted group-focus-within:text-accent transition-colors" size={14} />
              </form>
            </div>

            <div className="flex items-center gap-3 lg:gap-4">
              {/* Mobile Search Toggle */}
              <button 
                onClick={toggleSearch}
                className="md:hidden text-primary hover:text-accent p-2 hover:bg-white/50 rounded-xl transition-all cursor-pointer"
              >
                <Search size={20} />
              </button>

              <div className="relative">
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative text-primary hover:text-accent p-1.5 hover:bg-white/50 rounded-xl transition-all cursor-pointer flex"
                >
                  <Bell size={20} />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white shadow-lg border-2 border-white">
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 flex flex-col gap-3">
                    <h3 className="text-sm font-bold text-primary border-b pb-2 flex justify-between items-center">
                      <span>Notifications</span>
                      {notifications.length > 0 && (
                        <span className="text-xs font-normal text-muted">{notifications.length} total</span>
                      )}
                    </h3>
                    <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-muted text-center py-4">No notifications yet.</p>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            className={`p-3 rounded-xl border border-gray-50 flex flex-col gap-1 cursor-pointer hover:bg-gray-50/80 transition-colors ${!n.isRead ? 'bg-accent/5 font-semibold' : ''}`}
                            onClick={() => {
                              markRead(n.id);
                              setIsNotifOpen(false);
                            }}
                          >
                            <span className="text-xs font-bold text-primary">{n.title}</span>
                            <span className="text-[11px] text-gray-600 leading-normal font-normal">{n.message}</span>
                            {n.createdAt && (
                              <span className="text-[9px] text-muted mt-0.5 font-normal">{new Date(n.createdAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link to="/account" className="hidden lg:flex text-primary hover:text-accent p-1.5 hover:bg-white/50 rounded-xl transition-all cursor-pointer">
                <User size={20} />
              </Link>
              <Link to="/wishlist" className="relative text-primary hover:text-accent p-1.5 hover:bg-white/50 rounded-xl transition-all cursor-pointer hidden sm:flex">
                <Heart size={20} />
                {wishlistItems.length > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white shadow-lg border-2 border-white">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative bg-primary text-white p-2 rounded-xl hover:bg-primary-light transition-all cursor-pointer shadow-lg shadow-primary/20 flex items-center gap-2 group">
                <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
                <span className="hidden lg:inline text-xs font-bold">Cart</span>
                {totalItems > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white shadow-sm border border-white/20">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
          
          {/* Mobile Search - Toggleable */}
          {isMobileSearchOpen && (
            <div className="md:hidden pb-3 px-2 animate-in slide-in-from-top-2 duration-300">
              <form onSubmit={handleSearch} className="w-full relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-accent bg-white px-4 py-2 pl-10 text-sm focus:outline-none shadow-lg shadow-accent/5"
                />
                <Search className="absolute left-3.5 top-3 text-accent" size={16} />
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
