import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Package, Heart, Settings, LogOut, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserOrderDetailsModal } from '../components/ui/UserOrderDetailsModal';

export const Account: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    if (user?.username) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/v1/orders?customerName=${encodeURIComponent(user?.username || '')}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = async (orderId: string) => {
    try {
      const res = await fetch(`/api/v1/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: Package, label: 'My Orders', description: 'Track and manage your orders' },
    { icon: Heart, label: 'My Wishlist', description: 'Items you have saved for later', link: '/wishlist' },
    { icon: Settings, label: 'Profile Settings', description: 'Update your personal information' },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {location.state?.orderPlaced && (
        <div className="mb-8 p-4 bg-green-50 text-green-700 border border-green-200 rounded-2xl font-bold flex items-center justify-center">
          Thank you! Your order has been placed successfully.
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-primary p-8 md:p-12 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30">
              <User size={48} className="text-white" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black font-garamond tracking-tight">Hello, {user?.username}!</h1>
              <p className="text-white/70 font-medium mt-1">Manage your account and view your order history.</p>
            </div>
            <button 
              onClick={handleLogout}
              className="md:ml-auto flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all border border-white/20"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-12">
          <div className="grid md:grid-cols-1 gap-6">
            {menuItems.map((item, i) => (
              <button 
                key={i}
                onClick={() => item.link && navigate(item.link)}
                className="flex items-center gap-6 p-6 rounded-3xl bg-gray-50/50 border border-gray-100 hover:border-accent hover:bg-white transition-all group text-left"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-primary group-hover:text-accent">
                  <item.icon size={24} />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-black text-primary group-hover:text-accent transition-colors">{item.label}</h3>
                  <p className="text-sm text-muted font-medium">{item.description}</p>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>

          <div className="mt-12 p-8 bg-accent/5 rounded-[2rem] border border-accent/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-primary font-garamond">Recent Orders</h3>
              {loading && <Loader2 className="animate-spin text-accent" size={20} />}
            </div>

            {!loading && orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package size={48} className="text-accent/20 mb-4" />
                <p className="text-muted font-bold">You haven't placed any orders yet.</p>
                <button 
                  onClick={() => navigate('/shop')}
                  className="mt-4 text-accent font-black hover:underline underline-offset-4"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <button 
                    key={order.id} 
                    onClick={() => handleOrderClick(order.id)}
                    className="w-full text-left bg-white rounded-2xl p-6 border border-gray-100 hover:border-accent shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-black text-primary text-lg">#{order.invoiceId}</span>
                        <span className="px-2.5 py-1 bg-accent/10 text-accent text-xs font-bold rounded-lg uppercase tracking-wide">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                      <span className="text-xl font-black text-primary">${(order.totalAmount + 15).toFixed(2)}</span>
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors text-gray-400">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedOrder && (
        <UserOrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};
