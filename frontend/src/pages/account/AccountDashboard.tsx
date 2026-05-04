import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserOrderDetailsModal } from '../../components/ui/UserOrderDetailsModal';
import {
  Package, Heart, ShoppingCart, Star,
  ArrowRight, MapPin, TrendingUp
} from 'lucide-react';

export const AccountDashboard: React.FC = () => {
  const { user } = useAuthStore();
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
          <div className="dashboard-stat">
            <TrendingUp size={18} />
            <div>
              <span className="dashboard-stat-value">{orders.length}</span>
              <span className="dashboard-stat-label">Orders</span>
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
                  <span className="dashboard-order-total">${(order.totalAmount + 15).toFixed(2)}</span>
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
