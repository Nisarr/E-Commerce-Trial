import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  List, 
  Image as ImageIcon, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeTab: 'banners' | 'categories' | 'products' | 'dashboard' | 'settings';
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

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'categories', icon: List, label: 'Categories' },
    { id: 'banners', icon: ImageIcon, label: 'Banners' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside 
      className={`bg-white border-r border-gray-100 flex flex-col min-h-screen transition-all duration-500 ease-in-out relative group ${
        isCollapsed ? 'w-24' : 'w-72'
      }`}
    >
      {/* Collapse Toggle Button - Attractive & Premium */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-10 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-xl hover:bg-primary hover:text-white transition-all z-50 text-gray-400"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className={`p-6 border-b border-gray-50 flex items-center transition-all ${
        isCollapsed ? 'justify-center' : 'justify-between'
      }`}>
        {!isCollapsed && <h2 className="text-xl font-black text-primary tracking-tighter">ADMIN</h2>}
        {isCollapsed && <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black">A</div>}
      </div>

      <nav className="flex-grow p-4 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id as any)}
            className={`w-full flex items-center rounded-2xl font-bold transition-all group/item ${
              isCollapsed ? 'justify-center p-3' : 'px-4 py-3.5 gap-4'
            } ${
              item.id === activeTab 
                ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' 
                : 'text-gray-400 hover:bg-primary/5 hover:text-primary'
            }`}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon size={22} className={`transition-transform group-hover/item:scale-110 ${item.id === activeTab ? 'text-white' : ''}`} />
            {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-primary text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover/item:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-50">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </nav>

      <div className={`p-4 mt-auto border-t border-gray-50 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <button 
          onClick={handleLogout}
          className={`flex items-center rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all group/logout ${
            isCollapsed ? 'p-4' : 'w-full px-4 py-4 gap-4'
          }`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut size={22} className="group-hover/logout:-translate-x-1 transition-transform" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
