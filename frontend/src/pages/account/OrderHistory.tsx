import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { UserOrderDetailsModal } from '../../components/ui/UserOrderDetailsModal';
import { Package, ArrowRight, Search, Filter } from 'lucide-react';

const STATUS_FILTERS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export const OrderHistory: React.FC = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.username) fetchOrders();
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

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = activeFilter === 'All' || order.status?.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch = !searchQuery || order.invoiceId?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'delivered') return 'dashboard-status--delivered';
    if (s === 'shipped' || s === 'out for delivery') return 'dashboard-status--shipped';
    if (s === 'processing') return 'dashboard-status--processing';
    if (s === 'cancelled') return 'dashboard-status--cancelled';
    return 'dashboard-status--pending';
  };

  return (
    <div className="order-history">
      <div className="order-history-header">
        <h2>Order History</h2>
        <p>{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Search & Filters */}
      <div className="order-history-controls">
        <div className="order-history-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by Invoice ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="order-history-filters">
          <Filter size={14} />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`order-filter-btn ${activeFilter === f ? 'order-filter-btn--active' : ''}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="order-history-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-order-card shimmer-skeleton" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="order-history-empty">
          <Package size={48} />
          <p>{searchQuery || activeFilter !== 'All' ? 'No orders match your filters.' : 'You haven\'t placed any orders yet.'}</p>
        </div>
      ) : (
        <div className="order-history-list">
          {filteredOrders.map((order) => (
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
                <span className="dashboard-order-total">৳{(order.totalAmount).toLocaleString()}</span>
                <ArrowRight size={16} className="dashboard-order-arrow" />
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedOrder && (
        <UserOrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onOrderUpdated={() => {
            setSelectedOrder(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
};
