import { Bell, ChevronDown, Moon, Search, Plus, Menu } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface AdminNavbarProps {
  onAdd?: () => void;
  addLabel?: string;
  onMenuToggle?: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ onAdd, addLabel, onMenuToggle }) => {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const handleSearch = (val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set('q', val);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  return (
    <header className="sticky top-0 z-40 pt-4 px-4 md:px-8 pb-4 bg-[#f4f7fa]/80 backdrop-blur-xl">
      <div className="h-16 bg-white/70 backdrop-blur-3xl border border-[#FF4500]/20 shadow-[0_8px_32px_rgba(0,0,0,0.03)] rounded-[2rem] px-4 md:px-6 flex items-center justify-between transition-all hover:bg-white/80">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={onMenuToggle}
            className="p-2.5 text-[#3e4b5b] hover:bg-white rounded-xl transition-all md:hidden border border-transparent hover:border-[#ff6b6b]/10"
          >
            <Menu size={20} strokeWidth={2.5} />
          </button>

          <div className="hidden lg:flex items-center bg-white/50 backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/60 shadow-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-[#ff6b6b]/20 transition-all w-80 group">
            <Search size={16} className="text-gray-400 group-focus-within:text-[#ff6b6b] transition-colors" />
            <input 
              type="text" 
              placeholder="Search records..." 
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-transparent border-none outline-none px-3 text-[13px] font-medium text-[#3e4b5b] placeholder:text-gray-400 w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {onAdd && (
            <button 
              onClick={onAdd}
              className="flex items-center gap-2 bg-[#ff6b6b] hover:bg-[#ff5252] text-white px-4 md:px-5 py-2 md:py-2.5 rounded-full font-bold text-[11px] md:text-[12px] uppercase tracking-widest shadow-[0_8px_16px_rgba(255,107,107,0.2)] transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={16} strokeWidth={3} />
              <span className="hidden sm:inline">{addLabel || 'Add New'}</span>
            </button>
          )}
          
          <div className="flex items-center gap-1 md:gap-2">
            <NavIcon icon={Moon} />
            <NavIcon icon={Bell} badge />
          </div>

          <div className="h-8 w-px bg-gray-200/60 mx-1 md:mx-2 rounded-full" />

          <div className="flex items-center gap-2 md:gap-3 pl-1 cursor-pointer group hover:bg-white/60 p-1 md:p-1.5 md:pr-4 rounded-full transition-all border border-transparent hover:border-white hover:shadow-sm">
            <div className="w-8 md:w-9 h-8 md:h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ring-2 ring-transparent group-hover:ring-[#ff6b6b]/20 transition-all">
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.username || 'Admin'}&background=ff6b6b&color=fff&bold=true`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-[13px] font-bold text-[#3e4b5b] leading-none group-hover:text-[#ff6b6b] transition-colors">{user?.username || 'Admin User'}</p>
              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Workspace</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 group-hover:text-[#ff6b6b] transition-all ml-0.5 hidden md:block" />
          </div>
        </div>
      </div>
    </header>
  );
};

const NavIcon: React.FC<{ icon: React.ElementType, badge?: boolean }> = ({ icon: Icon, badge }) => (
  <button className="relative p-2 text-gray-400 hover:text-[#ff6b6b] hover:bg-white rounded-full transition-all border border-transparent hover:border-white hover:shadow-sm group">
    <Icon size={18} strokeWidth={2.5} className="transition-transform group-hover:scale-110" />
    {badge && (
      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff6b6b] rounded-full border-2 border-white animate-pulse shadow-sm" />
    )}
  </button>
);
