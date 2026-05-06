import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { UserOrderDetailsModal } from '../../components/ui/UserOrderDetailsModal';
import { Package, ArrowRight, Search, Filter, Ban, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cancelOrder } from '../../services/api';
import toast from 'react-hot-toast';
import type { Order } from '../../types';

const STATUS_FILTERS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export const OrderHistory: React.FC = () => {
  const { user } = useAuthStore();
  const { data: userData, loading, fetchUserData } = useUserStore();
  const location = useLocation();
  const orderPlaced = location.state?.orderPlaced;
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const orders = userData?.orders?.items || [];

  useEffect(() => {
    if (user?.id) {
      fetchUserData(user.id, user.username, !!orderPlaced);
    }
  }, [user, fetchUserData, orderPlaced]);

  const refreshData = () => {
    if (user?.id) fetchUserData(user.id, user.username, true);
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
  const handleCancelOrder = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation(); // Don't open the modal
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancellingId(orderId);
    try {
      await cancelOrder(orderId, 'Cancelled from order history');
      toast.success('Order cancelled successfully');
      refreshData();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
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
                <div className="flex flex-col items-end gap-2">
                  <span className="dashboard-order-total">৳{(order.totalAmount).toLocaleString()}</span>
                  {order.status?.toLowerCase() === 'pending' && (
                    <button
                      onClick={(e) => handleCancelOrder(e, order.id)}
                      disabled={cancellingId === order.id}
                      className="text-[10px] font-black text-red-500 hover:text-red-700 flex items-center gap-1 uppercase tracking-tighter bg-red-50 px-2 py-1 rounded-lg border border-red-100 transition-colors"
                    >
                      {cancellingId === order.id ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        <Ban size={10} />
                      )}
                      Cancel
                    </button>
                  )}
                </div>
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
            refreshData();
          }}
        />
      )}
    </div>
  );
};
