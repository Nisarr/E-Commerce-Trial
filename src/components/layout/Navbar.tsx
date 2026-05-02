import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, Menu, User } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { MegaMenu } from './MegaMenu.tsx';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const [logoClicks, setLogoClicks] = useState(0);
  
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const newClicks = logoClicks + 1;
    setLogoClicks(newClicks);
    
    if (newClicks === 5) {
      navigate('/adm');
      setLogoClicks(0);
    } else if (newClicks === 1) {
      // Reset clicks after 2 seconds of inactivity
      setTimeout(() => setLogoClicks(0), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Main Navbar */}
      <div className="glass rounded-b-[1.5rem] shadow-lg border-t-0 mx-2 md:mx-4 mt-1">
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
                onClick={handleLogoClick}
                className="flex items-center gap-2.5 group cursor-pointer select-none"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg shadow-sm p-1 group-hover:scale-110 transition-transform duration-300">
                  <img src="/logo.png" alt="PlayPen House" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-bold text-primary tracking-tight leading-none font-garamond">PlayPen</span>
                  <span className="text-[10px] md:text-xs font-bold text-accent tracking-[0.25em] uppercase leading-none mt-1 font-garamond">House</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex flex-1 max-w-2xl px-8 relative group justify-center">
              <button className="text-primary text-sm font-bold hover:text-accent py-4 px-4 cursor-pointer flex items-center gap-1 transition-colors group/btn">
                Categories
                <div className="w-1 h-1 rounded-full bg-accent scale-0 group-hover/btn:scale-100 transition-transform" />
              </button>
              <MegaMenu />
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
