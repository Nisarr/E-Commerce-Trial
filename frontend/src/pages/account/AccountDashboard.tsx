import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserOrderDetailsModal } from '../../components/ui/UserOrderDetailsModal';
import {
  Package, Heart, ShoppingCart, Star,
  ArrowRight, MapPin, Clock, CheckCircle, Ban
} from 'lucide-react';
import type { Order } from '../../types';

export const AccountDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { data: userData, loading, fetchUserData } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const orders = userData?.orders?.items || [];
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status?.toLowerCase() === 'pending').length;
  const deliveredOrders = orders.filter(o => o.status?.toLowerCase() === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.status?.toLowerCase() === 'cancelled').length;

  useEffect(() => {
    if (user?.id) {
      fetchUserData(user.id, user.username, user.email, !!location.state?.orderPlaced);
    }
  }, [user, fetchUserData, location.state?.orderPlaced]);

  const handleOrderClick = async (orderId: string) => {
    // We can still fetch details for a specific order if needed, 
    // or we could have included them in the bulk if they are small.
    // For now, keeping the individual fetch for details is fine.
    try {
      const res = await fetch(`/api/v1/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
      }
    } catch (_error) {
      console.error("Failed to fetch order details:", _error);
    }
  };

  const quickLinks = [
    { icon: Package, label: 'My Orders', description: 'Track & manage orders', to: '/account/orders', color: '#4F46E5' },
    { icon: Heart, label: 'My Wishlist', description: 'Saved items', to: '/wishlist', color: '#EC4899' },
    { icon: MapPin, label: 'Addresses', description: 'Manage delivery addresses', to: '/account/addresses', color: '#10B981' },
    { icon: Star, label: 'My Reviews', description: 'Products you reviewed', to: '/account/reviews', color: '#F59E0B' },
  ];

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'delivered') return 'dashboard-status--delivered';
    if (s === 'shipped' || s === 'out for delivery') return 'dashboard-status--shipped';
    if (s === 'processing') return 'dashboard-status--processing';
    if (s === 'cancelled') return 'dashboard-status--cancelled';
    return 'dashboard-status--pending';
  };

  return (
    <div className="account-dashboard">
      {/* Order success banner */}
      {location.state?.orderPlaced && (
        <div className="dashboard-success-banner">
          <ShoppingCart size={20} />
          <span>Thank you! Your order has been placed successfully.</span>
        </div>
      )}

      {/* Welcome Card */}
      <div className="dashboard-welcome">
        <div>
          <h1 className="dashboard-welcome-title">Welcome back, {user?.username}!</h1>
          <p className="dashboard-welcome-subtitle">Here's a snapshot of your account activity.</p>
        </div>
        <div className="dashboard-welcome-stats">
          {/* Desktop Stats (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-6">
            <div className="dashboard-stat">
              <Clock size={18} className="text-orange-500" />
              <div>
                <span className="dashboard-stat-value">{pendingOrders}</span>
                <span className="dashboard-stat-label">Pending</span>
              </div>
            </div>
            <div className="dashboard-stat border-l border-white/10 pl-4">
              <CheckCircle size={18} className="text-green-500" />
              <div>
                <span className="dashboard-stat-value">{deliveredOrders}</span>
                <span className="dashboard-stat-label">Delivered</span>
              </div>
            </div>
            <div className="dashboard-stat border-l border-white/10 pl-4">
              <Ban size={18} className="text-red-400" />
              <div>
                <span className="dashboard-stat-value">{cancelledOrders}</span>
                <span className="dashboard-stat-label">Cancelled</span>
              </div>
            </div>
          </div>

          {/* Mobile Stat (Visible only on Mobile) */}
          <div className="md:hidden flex items-center gap-4 bg-white/10 px-5 py-3 rounded-2xl border border-white/10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <span className="text-2xl font-black block leading-none">{totalOrders}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Total Orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="dashboard-quick-links">
        {quickLinks.map((link) => (
          <button
            key={link.to}
            onClick={() => navigate(link.to)}
            className="dashboard-quick-link"
          >
            <div className="dashboard-quick-link-icon" style={{ backgroundColor: `${link.color}15`, color: link.color }}>
              <link.icon size={22} />
            </div>
            <div className="dashboard-quick-link-text">
              <h3>{link.label}</h3>
              <p>{link.description}</p>
            </div>
            <ArrowRight size={16} className="dashboard-quick-link-arrow" />
          </button>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="dashboard-orders-section">
        <div className="dashboard-orders-header">
          <h2>Recent Orders</h2>
          {!loading && orders.length > 0 && (
            <button onClick={() => navigate('/account/orders')} className="dashboard-view-all">
              View All <ArrowRight size={14} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="dashboard-orders-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-order-card shimmer-skeleton" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="dashboard-orders-empty">
            <Package size={48} />
            <p>You haven't placed any orders yet.</p>
            <button onClick={() => navigate('/shop')}>
              Start Shopping <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="dashboard-orders-list">
            {orders.slice(0, 5).map((order) => (
              <button
                key={order.id}
                onClick={() => handleOrderClick(order.id)}
                className="dashboard-order-card"
              >
                <div className="dashboard-order-info">
                  <div className="dashboard-order-top">
                    <span className="dashboard-order-invoice">#{order.invoiceId}</span>
                    <span className={`dashboard-status ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="dashboard-order-date">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="dashboard-order-amount">
                  <span className="dashboard-order-total">৳{order.totalAmount.toLocaleString()}</span>
                  <ArrowRight size={16} className="dashboard-order-arrow" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <UserOrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};
