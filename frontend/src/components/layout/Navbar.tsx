import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Bell } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { MegaMenu } from './MegaMenu.tsx';
import { Breadcrumbs } from './Breadcrumbs.tsx';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useUserStore } from '../../store/userStore';
import type { Product } from '../../types';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { activeProductTitle } = useUIStore();
  const { data: userData, startPolling } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Use notifications from userStore if logged in, otherwise from homeStore
  const notifications = userData?.notifications?.latest || [];
  const unreadCount = userData?.notifications?.unreadCount || 0;

  // Start intelligent polling when logged in
  useEffect(() => {
    if (user?.id) {
      const stop = startPolling(user.id!, user.username, user.email);
      return () => stop();
    }
  }, [user?.id, user?.username, user?.email, startPolling]);

  const toggleSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };
  const { totalItems } = useCart();
  const wishlistItems = useWishlist((state) => state.items);

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/v1/notifications/${id}/read`, { method: 'POST' });
      // Refresh user data to get updated count
      if (user?.id) useUserStore.getState().fetchUserData(user.id!, user.username, user.email, true);
    } catch (err) {
      console.error(err);
    }
  };

  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          // Dynamic import or direct import if available
          const { searchProducts } = await import('../../services/api');
          const results = await searchProducts(searchQuery);
          setSuggestions(results);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSuggestions([]);
      setIsMobileSearchOpen(false);
    }
  };



  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Main Navbar */}
      <div className="bg-white border-b-2 border-[#FF4500] rounded-b-[2rem] w-full">
        <div className="container mx-auto px-4">
          <div className="flex h-14 md:h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-4">
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
              {location.pathname !== '/' && !location.pathname.startsWith('/adm') ? (
                <div className="flex items-center justify-center animate-in fade-in duration-300">
                  <Breadcrumbs 
                    label={activeProductTitle || undefined} 
                    className="bg-transparent border-0 shadow-none hover:bg-transparent" 
                  />
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
                {isSearching ? (
                  <div className="absolute left-3.5 top-2.5 h-3.5 w-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="absolute left-3.5 top-2.5 text-muted group-focus-within:text-accent transition-colors" size={14} />
                )}
              </form>

              {/* Desktop Suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  {suggestions.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => {
                        navigate(`/product/${p.slug}`);
                        setSearchQuery('');
                        setSuggestions([]);
                      }}
                      className="p-3 hover:bg-gray-50 flex items-center gap-3 cursor-pointer transition-colors border-b last:border-0"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                        <img src={JSON.parse(p.images)[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-xs font-bold text-primary truncate">{p.title}</span>
                        <span className="text-[10px] text-accent font-black">৳{p.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  {unreadCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white shadow-lg border-2 border-white">
                      {unreadCount}
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
                              if (n.type === 'order_status' && n.orderId) {
                                navigate(`/account/orders?id=${n.orderId}`);
                              } else {
                                navigate('/account/notifications');
                              }
                            }}
                          >
                            <span className="text-xs font-bold text-primary">{n.title}</span>
                            <span className="text-[11px] text-gray-600 leading-normal font-normal">{n.message}</span>
                            {n.createdAt && (
                              <span className="text-[9px] text-muted mt-0.5 font-normal">
                                {new Date(n.createdAt).toLocaleString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: 'numeric',
                                  hour12: true 
                                })}
                              </span>
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
              <Link to="/cart" className="relative text-primary hover:text-accent p-1.5 hover:bg-white/50 rounded-xl transition-all cursor-pointer hidden lg:flex items-center gap-2 group">
                <div className="relative">
                  <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                  {totalItems > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white shadow-lg border-2 border-white">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline text-xs font-bold">Cart</span>
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
                {isSearching ? (
                  <div className="absolute left-3.5 top-3 h-4 w-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="absolute left-3.5 top-3 text-accent" size={16} />
                )}
              </form>

              {/* Mobile Suggestions */}
              {suggestions.length > 0 && (
                <div className="mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                  {suggestions.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => {
                        navigate(`/product/${p.slug}`);
                        setSearchQuery('');
                        setSuggestions([]);
                        setIsMobileSearchOpen(false);
                      }}
                      className="p-3 flex items-center gap-3 active:bg-gray-50 border-b last:border-0"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                        <img src={JSON.parse(p.images)[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-xs font-bold text-primary truncate">{p.title}</span>
                        <span className="text-[10px] text-accent font-black">৳{p.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
