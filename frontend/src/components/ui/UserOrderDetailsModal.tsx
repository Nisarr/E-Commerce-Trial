import React from 'react';
import { X, Package, Truck, CheckCircle, Clock, Ban, Loader2, AlertTriangle } from 'lucide-react';
import { Invoice } from './Invoice';
import { cancelOrder } from '../../services/api';
import toast from 'react-hot-toast';

import type { Order } from '../../types';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onOrderUpdated?: () => void;
}

export const UserOrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, onOrderUpdated }) => {
  const [showInvoice, setShowInvoice] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');
  const [cancelError, setCancelError] = React.useState('');

  if (!order) return null;

  const canCancel = order.status?.toLowerCase() === 'pending';

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return <CheckCircle size={24} className="text-green-500" />;
      case 'shipped':
      case 'out for delivery': return <Truck size={24} className="text-blue-500" />;
      case 'processing': return <Package size={24} className="text-accent" />;
      case 'cancelled': return <Ban size={24} className="text-red-500" />;
      default: return <Clock size={24} className="text-gray-400" />;
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError('');
    try {
      await cancelOrder(order.id, cancelReason || 'Cancelled by user');
      toast.success('Order cancelled successfully');
      // Refresh the parent's order list
      onOrderUpdated?.();
      onClose();
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Failed to cancel order.';
      setCancelError(msg);
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black font-garamond text-primary">Order Details</h2>
            <p className="text-sm text-muted font-medium mt-1">ID: {order.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto">
          {/* Order Info & Invoice Button */}
          <div className="flex flex-wrap justify-between items-end gap-4 mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <span className="text-lg font-black text-primary capitalize">{order.status}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total</p>
              <span className="text-xl font-black text-accent">৳{order.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowInvoice(true)}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
              >
                View Invoice
              </button>
              {canCancel && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center gap-1.5"
                >
                  <Ban size={16} /> Cancel
                </button>
              )}
            </div>
          </div>

          {/* Cancel Confirmation */}
          {showCancelConfirm && (
            <div className="mb-6 p-5 bg-red-50 rounded-2xl border border-red-200 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2 text-red-600 mb-3">
                <AlertTriangle size={18} />
                <h4 className="font-black text-sm uppercase tracking-wider">Confirm Cancellation</h4>
              </div>
              <p className="text-sm text-red-700/80 mb-3">Are you sure you want to cancel this order? This action cannot be undone.</p>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-2.5 mb-3 rounded-xl border border-red-200 bg-white text-sm text-primary font-medium focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                <option value="">Select a reason...</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Found a better price">Found a better price</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Delivery too slow">Delivery too slow</option>
                <option value="Other">Other</option>
              </select>
              {cancelError && (
                <p className="text-xs font-bold text-red-600 mb-3">{cancelError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowCancelConfirm(false); setCancelError(''); }}
                  className="flex-1 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm text-muted hover:bg-gray-50 transition-colors"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {cancelling ? <><Loader2 className="animate-spin" size={16} /> Cancelling...</> : 'Yes, Cancel Order'}
                </button>
              </div>
            </div>
          )}

          {/* Tracking Timeline */}
          <h3 className="text-lg font-black text-primary mb-6">Tracking History</h3>
          <div className="relative border-l-2 border-gray-100 ml-3 mb-10 space-y-6">
            {order.trackings?.map((track, idx) => (
              <div key={idx} className="relative pl-8">
                <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-4 ${
                  track.status?.toLowerCase() === 'cancelled' ? 'border-red-500' : 'border-accent'
                }`} />
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-primary">{track.status}</h4>
                    <span className="text-xs font-bold text-gray-400">
                      {track.createdAt ? new Date(track.createdAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  {track.message && <p className="text-sm text-gray-600">{track.message}</p>}
                  {track.location && (
                    <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-1">
                      📍 {track.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {(!order.trackings || order.trackings.length === 0) && (
              <p className="pl-8 text-sm text-gray-500">No tracking information available yet.</p>
            )}
          </div>

          {/* Items */}
          <h3 className="text-lg font-black text-primary mb-4">Items Ordered</h3>
          <div className="space-y-3">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  {item.productImage ? (
                    <img src={item.productImage} alt={item.productName} className="w-12 h-12 rounded-lg object-cover bg-white" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                      <Package size={20} />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-primary">{item.productName || `Product ID: ${item.productId.slice(0, 8)}`}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity} × ৳{item.price.toLocaleString()}</p>
                  </div>
                </div>
                <p className="font-bold text-primary">৳{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showInvoice && (
        <Invoice order={order} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
};
