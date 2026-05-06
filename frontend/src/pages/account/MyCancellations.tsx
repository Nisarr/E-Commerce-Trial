import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';

import {
  XCircle, Package, Clock,
  CheckCircle2, AlertTriangle, Calendar, Ban
} from 'lucide-react';

export const MyCancellations: React.FC = () => {
  const { user } = useAuthStore();
  const { data: userData, loading, fetchUserData } = useUserStore();
  const cancellationsReqs = userData?.cancellations?.items || [];
  const orders = userData?.orders?.items || [];
  
  // Find orders with 'Cancelled' status that aren't already in cancellation requests
  const cancelledOrders = orders
    .filter(o => o.status?.toLowerCase() === 'cancelled')
    .filter(o => !cancellationsReqs.some(c => c.orderId === o.id))
    .map(o => ({
      id: `order-${o.id}`,
      orderId: o.id,
      userId: o.userId || '',
      reason: 'Order Cancelled',
      details: 'This order was cancelled.',
      status: 'Cancelled',
      type: 'cancellation',
      adminNotes: null,
      createdAt: o.createdAt
    }));

  const cancellations = [...cancellationsReqs, ...cancelledOrders].sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  useEffect(() => {
    if (user?.id) {
      fetchUserData(user.id, user.username, user.email);
    }
  }, [user, fetchUserData]);

  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'completed') return { icon: CheckCircle2, cls: 'return-status--approved', label: status };
    if (s === 'rejected') return { icon: Ban, cls: 'return-status--rejected', label: status };
    if (s === 'cancelled') return { icon: XCircle, cls: 'return-status--rejected', label: status };
    return { icon: Clock, cls: 'return-status--pending', label: status };
  };

  if (loading) {
    return (
      <div className="my-returns">
        <div className="skeleton-dashboard-card shimmer-skeleton" style={{ height: '60px', borderRadius: '0.75rem', marginBottom: '1.25rem' }} />
        <div className="skeleton-dashboard-card shimmer-skeleton" style={{ height: '200px', borderRadius: '1.25rem' }} />
      </div>
    );
  }

  return (
    <div className="my-returns">
      <div className="address-book-header">
        <div>
          <h2>My Cancellations</h2>
          <p>{cancellations.length} cancellation{cancellations.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {cancellations.length === 0 ? (
        <div className="address-empty">
          <XCircle size={48} />
          <p>No cancelled orders found.</p>
        </div>
      ) : (
        <div className="returns-list">
          {cancellations.map((c) => {
            const statusConf = getStatusConfig(c.status);
            return (
              <div key={c.id} className="return-card">
                <div className="return-card-header">
                  <div className="return-card-order">
                    <Package size={16} />
                    <span>Order: {c.orderId.slice(0, 8)}...</span>
                  </div>
                  <span className={`return-status ${statusConf.cls}`}>
                    <statusConf.icon size={12} /> {statusConf.label}
                  </span>
                </div>
                <div className="return-card-body">
                  <div className="return-card-reason">
                    <AlertTriangle size={14} />
                    <span><strong>Reason:</strong> {c.reason}</span>
                  </div>
                  {c.details && <p className="return-card-details">{c.details}</p>}
                  {c.adminNotes && (
                    <div className="return-card-admin-note">
                      <strong>Admin Response:</strong> {c.adminNotes}
                    </div>
                  )}
                </div>
                <div className="return-card-footer">
                  <span className="return-card-date">
                    <Calendar size={12} />
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    }) : 'N/A'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
