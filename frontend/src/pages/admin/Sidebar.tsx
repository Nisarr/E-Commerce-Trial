import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Box,
  ShoppingBag,
  CreditCard,
  PartyPopper,
  ReceiptText,
  Settings,
  LogOut,
  ChevronLeft,
  ShoppingBasket,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/adm');
  };

  const sections = [
    {
      title: 'GENERAL',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'products', icon: Package, label: 'Products', hasSub: true },
        { id: 'categories', icon: ClipboardList, label: 'Category', hasSub: true },
        { id: 'inventory', icon: Box, label: 'Inventory', hasSub: true },
        { id: 'orders', icon: ShoppingBag, label: 'Orders', hasSub: true },
        { id: 'purchases', icon: CreditCard, label: 'Purchases', hasSub: true },
        { id: 'attributes', icon: PartyPopper, label: 'Attributes', hasSub: true },
        { id: 'invoices', icon: ReceiptText, label: 'Invoices', hasSub: true },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ]
    }
  ];

  return (
    <aside 
      className={`bg-[#f8f9fa]/60 backdrop-blur-3xl border-2 border-[#ff6b6b]/20 flex flex-col transition-all duration-500 sticky top-4 z-[60] shadow-[0_8px_32px_rgba(255,107,107,0.05)] flex-shrink-0 my-4 ml-4 rounded-[2.5rem] h-[calc(100vh-2rem)] ${
        isCollapsed ? 'w-24' : 'w-64'
      }`}
    >
      {/* Brand Logo & Collapse Toggle */}
      <div className={`p-5 pb-2 relative flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
        <div className={`flex items-center h-14 bg-white border border-[#ff6b6b]/10 shadow-sm rounded-[1.25rem] transition-all duration-300 relative ${isCollapsed ? 'w-14 justify-center px-0' : 'w-full px-4 gap-3'}`}>
          <div className="w-9 h-9 bg-[#ff6b6b]/10 rounded-xl flex items-center justify-center text-[#ff6b6b] flex-shrink-0">
            <ShoppingBasket size={22} strokeWidth={2.5} />
          </div>
          {!isCollapsed && (
            <>
              <h1 className="text-lg font-black text-[#3e4b5b] tracking-tighter animate-in fade-in slide-in-from-left-2 duration-300 flex-grow">PlayHouse</h1>
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-7 h-7 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#ff6b6b] hover:border-[#ff6b6b]/30 transition-all shadow-sm"
              >
                <ChevronLeft size={14} strokeWidth={3} />
              </button>
            </>
          )}
        </div>
        
        {isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mt-3 w-9 h-9 bg-white border border-[#ff6b6b]/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#ff6b6b] shadow-sm transition-all"
          >
            <ChevronLeft size={18} strokeWidth={3} className="rotate-180" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-grow overflow-y-auto overflow-x-hidden px-5 space-y-8 py-4 hover:overflow-visible transition-all custom-scrollbar">
        {sections.map((section, sIndex) => (
          <div key={sIndex} className="space-y-3">
            {!isCollapsed && (
              <h3 className="px-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                {section.title}
              </h3>
            )}
            <div className="space-y-2">
              {section.items.map((item) => {
                const isActive = item.id === activeTab;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id as any)}
                    className={`w-full flex items-center rounded-2xl font-bold text-[13px] transition-all duration-300 group relative border shadow-sm ${
                      isCollapsed ? 'justify-center p-3' : 'px-4 py-3.5 gap-3'
                    } ${
                      isActive 
                        ? 'bg-white text-[#ff6b6b] border-[#ff6b6b]/20 shadow-md scale-[1.02]' 
                        : 'bg-white/40 border-white/40 text-[#8692a0] hover:bg-white hover:text-[#3e4b5b] hover:scale-[1.01]'
                    }`}
                  >
                    {isActive && !isCollapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#ff6b6b] rounded-r-full shadow-[2px_0_10px_rgba(255,107,107,0.4)]" />
                    )}
                    
                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform ${isActive ? 'text-[#ff6b6b]' : 'text-[#8692a0] group-hover:text-[#3e4b5b]'}`} />
                    
                    {!isCollapsed && (
                      <>
                        <span className="flex-grow text-left">{item.label}</span>
                        {item.hasSub && (
                          <ChevronDown size={14} className={`opacity-40 transition-transform ${isActive ? 'rotate-180' : ''}`} />
                        )}
                      </>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-[#3e4b5b] text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 whitespace-nowrap shadow-2xl z-[100] border border-white/10">
                        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-y-[6px] border-y-transparent border-r-[6px] border-r-[#3e4b5b]" />
                        {item.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="p-5 pt-2">
        <button 
          onClick={handleLogout}
          className={`flex items-center rounded-2xl font-bold text-[13px] text-red-500 hover:bg-white hover:shadow-md transition-all duration-300 group border shadow-sm bg-white/40 border-white/40 hover:scale-[1.02] ${
            isCollapsed ? 'justify-center p-3' : 'w-full px-4 py-3.5 gap-3'
          }`}
        >
          <LogOut size={18} strokeWidth={2.5} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
