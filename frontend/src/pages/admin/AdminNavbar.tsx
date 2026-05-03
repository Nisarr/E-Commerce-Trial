import { Bell, ChevronDown, Moon, Search, Plus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface AdminNavbarProps {
  onAdd?: () => void;
  addLabel?: string;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ onAdd, addLabel }) => {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 pt-4 px-8 pb-4 bg-[#f4f7fa]/80 backdrop-blur-xl">
      <div className="h-16 bg-white/70 backdrop-blur-3xl border border-[#FF4500] shadow-[0_8px_32px_rgba(0,0,0,0.03)] rounded-[2rem] px-6 flex items-center justify-between transition-all hover:bg-white/80">
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-white/50 backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/60 shadow-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-[#ff6b6b]/20 transition-all w-80 group">
            <Search size={16} className="text-gray-400 group-focus-within:text-[#ff6b6b] transition-colors" />
            <input 
              type="text" 
              placeholder="Search records..." 
              className="bg-transparent border-none outline-none px-3 text-[13px] font-medium text-[#3e4b5b] placeholder:text-gray-400 w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {onAdd && (
            <button 
              onClick={onAdd}
              className="hidden md:flex items-center gap-2 bg-[#ff6b6b] hover:bg-[#ff5252] text-white px-5 py-2.5 rounded-full font-bold text-[12px] uppercase tracking-widest shadow-[0_8px_16px_rgba(255,107,107,0.2)] transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={16} strokeWidth={3} />
              {addLabel || 'Add New'}
            </button>
          )}
          
          <div className="flex items-center gap-2">
            <NavIcon icon={Moon} />
            <NavIcon icon={Bell} badge />
          </div>

          <div className="h-8 w-px bg-gray-200/60 mx-2 rounded-full" />

          <div className="flex items-center gap-3 pl-1 cursor-pointer group hover:bg-white/60 p-1.5 pr-4 rounded-full transition-all border border-transparent hover:border-white hover:shadow-sm">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ring-2 ring-transparent group-hover:ring-[#ff6b6b]/20 transition-all">
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.username || 'Admin'}&background=ff6b6b&color=fff&bold=true`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[13px] font-bold text-[#3e4b5b] leading-none group-hover:text-[#ff6b6b] transition-colors">{user?.username || 'Admin User'}</p>
              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Workspace</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 group-hover:text-[#ff6b6b] transition-all ml-1" />
          </div>
        </div>
      </div>
    </header>
  );
};

const NavIcon: React.FC<{ icon: any, badge?: boolean }> = ({ icon: Icon, badge }) => (
  <button className="relative p-2.5 text-gray-400 hover:text-[#ff6b6b] hover:bg-white rounded-full transition-all border border-transparent hover:border-white hover:shadow-sm group">
    <Icon size={18} strokeWidth={2.5} className="transition-transform group-hover:scale-110" />
    {badge && (
      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#ff6b6b] rounded-full border-2 border-white animate-pulse shadow-sm" />
    )}
  </button>
);
