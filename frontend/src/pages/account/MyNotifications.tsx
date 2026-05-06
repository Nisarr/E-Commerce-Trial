import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { useNavigate } from 'react-router-dom';

export const MyNotifications: React.FC = () => {
  const { user } = useAuthStore();
  const { fetchUserData } = useUserStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchAllNotifications = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/notifications?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNotifications();
  }, [user?.id]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/v1/notifications/${id}/read`, { method: 'POST' });
      // Update local state
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: 1 } : n));
      // Refresh global count
      if (user?.id) fetchUserData(user.id, user.username, user.email, true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = (n: any) => {
    if (!n.isRead) markAsRead(n.id);
    
    if (n.type === 'order_status' && n.orderId) {
      navigate(`/account/orders?id=${n.orderId}`);
    }
  };

  return (
    <div className="account-page-content animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-primary flex items-center gap-3 font-garamond">
            <Bell size={28} className="text-accent" /> My Notifications
          </h2>
          <p className="text-muted font-medium mt-1">Updates on your orders and special offers</p>
        </div>
        <button 
          onClick={fetchAllNotifications}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-muted"
          title="Refresh"
        >
          <Clock size={20} />
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center text-muted font-bold">Loading your notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
              <Bell size={32} />
            </div>
            <p className="text-muted font-bold">You don't have any notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => handleAction(n)}
                className={`p-6 transition-all hover:bg-gray-50 group flex gap-4 cursor-pointer ${!n.isRead ? 'bg-accent/5' : ''}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm ${
                  !n.isRead ? 'bg-accent text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {n.type === 'offer' ? <ExternalLink size={20} /> : <Bell size={20} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold text-primary truncate ${!n.isRead ? 'text-lg' : 'text-base'}`}>
                      {n.title}
                    </h3>
                    <span className="text-[10px] font-black text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-50 whitespace-nowrap ml-4">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      }) : 'N/A'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-3">
                    {!n.isRead && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                        className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-accent-dark flex items-center gap-1.5"
                      >
                        <CheckCircle size={12} /> Mark as Read
                      </button>
                    )}
                    {n.orderId && (
                      <button 
                        onClick={() => handleAction(n)}
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-accent flex items-center gap-1.5"
                      >
                        <ExternalLink size={12} /> View Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
        <h4 className="text-sm font-black text-primary mb-2">Notification Settings</h4>
        <p className="text-xs text-gray-500 font-medium leading-relaxed">
          We notify you about order status updates, wallet transactions, and special promotional offers. 
          Make sure to check back often to never miss a deal!
        </p>
      </div>
    </div>
  );
};
