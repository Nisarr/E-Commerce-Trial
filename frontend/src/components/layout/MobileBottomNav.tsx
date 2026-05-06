import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, ShoppingBag } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/category/all') {
      return location.pathname === '/category/all' || location.pathname === '/shop';
    }
    return location.pathname === path;
  };
  
  const navItems = [
    { icon: <Home size={22} />, label: 'Home', path: '/' },
    { icon: <Search size={22} />, label: 'Shop', path: '/category/all' },
    { icon: <ShoppingBag size={22} />, label: 'Cart', path: '/cart' },
    { icon: <Heart size={22} />, label: 'Wishlist', path: '/wishlist' },
    { icon: <User size={22} />, label: 'Profile', path: '/account' },
  ];


  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full z-50">
      <div className="bg-white border-t-2 border-[#FF4500] rounded-t-[2rem] shadow-[0_-8px_30px_rgb(0,0,0,0.08)] px-4 pb-safe h-18 flex justify-around items-center">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center relative w-full py-3 transition-all duration-300 ${
                active ? 'text-[#FF4500]' : 'text-gray-400 dark:text-gray-500'
              }`}
            >

              <div className={`transition-all duration-300 ${active ? '-translate-y-1 scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-bold tracking-tight mt-1 transition-all duration-300 ${active ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );


};
