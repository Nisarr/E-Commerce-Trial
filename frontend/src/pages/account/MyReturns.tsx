import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import {
  RotateCcw, Package, Clock,
  CheckCircle2, XCircle, AlertTriangle, Calendar
} from 'lucide-react';

export const MyReturns: React.FC = () => {
  const { user } = useAuthStore();
  const { data: userData, loading, fetchUserData } = useUserStore();
  const returns = userData?.returns?.items || [];

  useEffect(() => {
    if (user?.id) {
      fetchUserData(user.id, user.username, user.email);
    }
  }, [user, fetchUserData]);

  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'completed') return { icon: CheckCircle2, cls: 'return-status--approved', label: status };
    if (s === 'rejected') return { icon: XCircle, cls: 'return-status--rejected', label: status };
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
          <h2>My Returns</h2>
          <p>{returns.length} return request{returns.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {returns.length === 0 ? (
        <div className="address-empty">
          <RotateCcw size={48} />
          <p>No return requests found.</p>
        </div>
      ) : (
        <div className="returns-list">
          {returns.map((ret) => {
            const statusConf = getStatusConfig(ret.status);
            return (
              <div key={ret.id} className="return-card">
                <div className="return-card-header">
                  <div className="return-card-order">
                    <Package size={16} />
                    <span>Order: {ret.orderId.slice(0, 8)}...</span>
                  </div>
                  <span className={`return-status ${statusConf.cls}`}>
                    <statusConf.icon size={12} /> {statusConf.label}
                  </span>
                </div>
                <div className="return-card-body">
                  <div className="return-card-reason">
                    <AlertTriangle size={14} />
                    <span><strong>Reason:</strong> {ret.reason}</span>
                  </div>
                  {ret.details && <p className="return-card-details">{ret.details}</p>}
                  {ret.adminNotes && (
                    <div className="return-card-admin-note">
                      <strong>Admin Response:</strong> {ret.adminNotes}
                    </div>
                  )}
                </div>
                <div className="return-card-footer">
                  <span className="return-card-date">
                    <Calendar size={12} />
                    {ret.createdAt ? new Date(ret.createdAt).toLocaleDateString('en-US', {
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
