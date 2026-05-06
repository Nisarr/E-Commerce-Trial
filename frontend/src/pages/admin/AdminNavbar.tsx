import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, ChevronDown, Moon, Sun, Search, Plus, Menu } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

interface AdminNavbarProps {
  onAdd?: () => void;
  addLabel?: string;
  onMenuToggle?: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ onAdd, addLabel, onMenuToggle }) => {
  const { user } = useAuthStore();
  const { isAdminModalOpen, adminTheme, toggleAdminTheme } = useUIStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/v1/notifications?all=true');
      if (res.ok) {
        const data = await res.json();
        const items = data.items || [];
        setNotifications(items.slice(0, 5)); // Show latest 5
        setUnreadCount(items.filter((n: any) => n.isRead === 0).length);
      }
    } catch (err) {
      console.error('Failed to fetch admin notifications', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/v1/notifications/${id}/read`, { method: 'POST' });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (isAdminModalOpen) return null;

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
    <header className={`sticky top-0 ${isNotifOpen ? 'z-[100]' : 'z-40'}`}>
      <div className="pt-4 px-4 md:px-8 pb-4 bg-[var(--adm-bg)]/80 backdrop-blur-xl admin-theme-transition">
        <div className="h-16 bg-[var(--adm-nav-bg)] backdrop-blur-3xl border border-[#FF4500]/20 shadow-[0_8px_32px_rgba(0,0,0,0.03)] rounded-[2rem] px-4 md:px-6 flex items-center justify-between transition-all hover:bg-[var(--adm-nav-bg)]/90">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={onMenuToggle}
            className="p-2.5 text-[var(--adm-text-primary)] hover:bg-[var(--adm-card-bg)] rounded-xl transition-all md:hidden border border-transparent hover:border-[#ff6b6b]/10"
          >
            <Menu size={20} strokeWidth={2.5} />
          </button>

          <div className="hidden lg:flex items-center bg-[var(--adm-card-bg)]/50 backdrop-blur-sm rounded-full px-5 py-2.5 border border-[var(--adm-border)] shadow-sm focus-within:bg-[var(--adm-card-bg)] focus-within:ring-2 focus-within:ring-[#ff6b6b]/20 transition-all w-80 group">
            <Search size={16} className="text-[var(--adm-text-secondary)] group-focus-within:text-[#ff6b6b] transition-colors" />
            <input 
              type="text" 
              placeholder="Search records..." 
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-transparent border-none outline-none px-3 text-[13px] font-medium text-[var(--adm-text-primary)] placeholder:text-[var(--adm-text-secondary)] w-full"
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
            <NavIcon 
              icon={adminTheme === 'light' ? Moon : Sun} 
              onClick={toggleAdminTheme}
            />
            <div className="relative">
              <NavIcon 
                icon={Bell} 
                badge={unreadCount > 0} 
                onClick={() => setIsNotifOpen(!isNotifOpen)} 
              />
              {isNotifOpen && createPortal(
                <>
                  <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-lg" onClick={() => setIsNotifOpen(false)} />
                  <div className="fixed top-24 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-[var(--adm-card-bg)] rounded-[2.5rem] shadow-[0_20px_70px_rgba(0,0,0,0.3)] border-2 border-[#ff6b6b]/40 p-6 z-[101] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between border-b border-[var(--adm-border)] pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#ff6b6b]/10 rounded-2xl flex items-center justify-center text-[#ff6b6b]">
                          <Bell size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-[var(--adm-text-primary)] leading-none">Notifications</h3>
                          <p className="text-[10px] font-bold text-[var(--adm-text-secondary)] uppercase tracking-widest mt-1">System Updates</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-[#ff6b6b] bg-[#ff6b6b]/10 px-3 py-1 rounded-full uppercase tracking-widest">{notifications.length} Recent</span>
                    </div>

                    <div className="max-h-[60vh] md:max-h-[450px] overflow-y-auto flex flex-col gap-3 custom-scrollbar pr-1">
                      {notifications.length === 0 ? (
                        <div className="py-16 text-center space-y-3">
                          <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto text-gray-200">
                            <Bell size={32} />
                          </div>
                          <p className="text-sm text-gray-400 font-bold">Your notification center is empty</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            className={`p-5 rounded-3xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group ${
                              n.isRead === 0 
                                ? 'bg-[#ff6b6b]/5 border-[#ff6b6b]/20 shadow-sm' 
                                : 'bg-[var(--adm-card-bg)] border-[var(--adm-border)] hover:border-[#ff6b6b]/20'
                            }`}
                            onClick={() => {
                              markAsRead(n.id);
                              setIsNotifOpen(false);
                              navigate('/adm/notifications');
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[14px] font-black text-[var(--adm-text-primary)] group-hover:text-[#ff6b6b] transition-colors">{n.title}</span>
                              {n.isRead === 0 && <span className="w-2.5 h-2.5 bg-[#ff6b6b] rounded-full shadow-[0_0_12px_rgba(255,107,107,0.6)] animate-pulse" />}
                            </div>
                            <p className="text-[12px] text-gray-500 leading-relaxed font-medium mb-3 line-clamp-3">{n.message}</p>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100/50">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                {new Date(n.createdAt).toLocaleString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  hour: 'numeric',
                                  minute: 'numeric',
                                  hour12: true 
                                })}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] font-black text-[#ff6b6b] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                View Details <Plus size={12} strokeWidth={3} />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <button 
                      onClick={() => {
                        setIsNotifOpen(false);
                        navigate('/adm/notifications');
                      }}
                      className="w-full py-4 bg-[var(--adm-bg)] hover:bg-[#ff6b6b] text-[11px] font-black text-center text-[#ff6b6b] hover:text-white uppercase tracking-[0.25em] rounded-2xl transition-all border-2 border-transparent hover:border-[#ff6b6b] shadow-sm active:scale-[0.98]"
                    >
                      Enter Notification Center
                    </button>
                  </div>
                </>
                , document.body
              )}
            </div>
          </div>

          <div className="h-8 w-px bg-[var(--adm-border)] mx-1 md:mx-2 rounded-full" />

          <div className="flex items-center gap-2 md:gap-3 pl-1 cursor-pointer group hover:bg-[var(--adm-card-bg)]/60 p-1 md:p-1.5 md:pr-4 rounded-full transition-all border border-transparent hover:border-[var(--adm-border)] hover:shadow-sm">
            <div className="w-8 md:w-9 h-8 md:h-9 rounded-full bg-[var(--adm-bg)] flex items-center justify-center overflow-hidden border-2 border-[var(--adm-card-bg)] shadow-sm ring-2 ring-transparent group-hover:ring-[#ff6b6b]/20 transition-all">
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.username || 'Admin'}&background=ff6b6b&color=fff&bold=true`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-[13px] font-bold text-[var(--adm-text-primary)] leading-none group-hover:text-[#ff6b6b] transition-colors">{user?.username || 'Admin User'}</p>
              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Workspace</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 group-hover:text-[#ff6b6b] transition-all ml-0.5 hidden md:block" />
          </div>
        </div>
        </div>
      </div>
    </header>
  );
};

const NavIcon: React.FC<{ icon: React.ElementType, badge?: boolean, onClick?: () => void }> = ({ icon: Icon, badge, onClick }) => (
  <button 
    onClick={onClick}
    className="relative p-2 text-[var(--adm-text-secondary)] hover:text-[#ff6b6b] hover:bg-[var(--adm-card-bg)] rounded-full transition-all border border-transparent hover:border-[var(--adm-border)] hover:shadow-sm group"
  >
    <Icon size={18} strokeWidth={2.5} className="transition-transform group-hover:scale-110" />
    {badge && (
      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff6b6b] rounded-full border-2 border-white animate-pulse shadow-sm" />
    )}
  </button>
);
