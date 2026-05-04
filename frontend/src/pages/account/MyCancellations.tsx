import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { getReturns } from '../../services/api';
import type { ReturnRequest } from '../../types';
import {
  XCircle, Package, Clock,
  CheckCircle2, AlertTriangle, Calendar, Ban
} from 'lucide-react';

export const MyCancellations: React.FC = () => {
  const { user } = useAuthStore();
  const [cancellations, setCancellations] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchCancellations();
  }, [user?.id]);

  const fetchCancellations = async () => {
    try {
      const data = await getReturns(user!.id!, 'cancellation');
      setCancellations(data);
    } catch {
      setCancellations([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'completed') return { icon: CheckCircle2, cls: 'return-status--approved', label: status };
    if (s === 'rejected') return { icon: Ban, cls: 'return-status--rejected', label: status };
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
