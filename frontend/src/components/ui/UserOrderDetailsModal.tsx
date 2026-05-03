import React from 'react';
import { X, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { Invoice } from './Invoice';

interface OrderDetailsModalProps {
  order: any;
  onClose: () => void;
}

export const UserOrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
  const [showInvoice, setShowInvoice] = React.useState(false);

  if (!order) return null;

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return <CheckCircle size={24} className="text-green-500" />;
      case 'shipped':
      case 'out for delivery': return <Truck size={24} className="text-blue-500" />;
      case 'processing': return <Package size={24} className="text-accent" />;
      default: return <Clock size={24} className="text-gray-400" />;
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
              <span className="text-xl font-black text-accent">${(order.totalAmount + 15).toFixed(2)}</span>
            </div>
            <button 
              onClick={() => setShowInvoice(true)}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
            >
              View Invoice
            </button>
          </div>

          {/* Tracking Timeline */}
          <h3 className="text-lg font-black text-primary mb-6">Tracking History</h3>
          <div className="relative border-l-2 border-gray-100 ml-3 mb-10 space-y-6">
            {order.trackings?.map((track: any, idx: number) => (
              <div key={idx} className="relative pl-8">
                <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-4 border-accent" />
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-primary">{track.status}</h4>
                    <span className="text-xs font-bold text-gray-400">
                      {new Date(track.createdAt).toLocaleString()}
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
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="font-bold text-primary">Product ID: {item.productId.slice(0, 8)}...</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
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
