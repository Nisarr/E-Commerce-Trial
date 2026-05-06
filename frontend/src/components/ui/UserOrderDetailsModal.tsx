import React from 'react';
import { X, Package, Truck, CheckCircle, Clock, Ban, Loader2, AlertTriangle, MapPin, ExternalLink, Calendar, CreditCard, Hash, MessageSquare } from 'lucide-react';
import { ModalSkeleton } from './ShimmerSkeleton';
import { Invoice } from './Invoice';
import { MessageModal } from './MessageModal';
import { cancelOrder } from '../../services/api';
import toast from 'react-hot-toast';

import type { Order } from '../../types';

interface OrderDetailsModalProps {
  order: Order;
  loading?: boolean;
  onClose: () => void;
  onOrderUpdated?: () => void;
}

export const UserOrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, loading, onClose, onOrderUpdated }) => {
  const [showInvoice, setShowInvoice] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');
  const [cancelError, setCancelError] = React.useState('');
  const [viewingMessage, setViewingMessage] = React.useState<{ status: string; message: string; createdAt?: string | Date } | null>(null);

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
    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] w-full max-w-4xl h-[85vh] md:h-auto md:max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-300 mb-18 md:mb-0">
        
        {/* Header */}
        <div className="px-6 md:px-8 py-5 md:py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-primary">
              <Package size={20} className="md:hidden" />
              <Package size={24} className="hidden md:block" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-black font-garamond text-primary">Order #{order.invoiceId}</h2>
              <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <Calendar size={10} className="md:hidden" />
                <Calendar size={12} className="hidden md:block" />
                <span className="hidden xs:inline">Placed {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                <span className="xs:hidden">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => setShowInvoice(true)}
              className="p-2 md:px-5 md:py-2.5 bg-white border border-gray-200 text-primary rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2 text-sm shadow-sm"
              title="View Invoice"
            >
              <ExternalLink size={16} />
              <span className="hidden md:inline">View Invoice</span>
            </button>
            <button onClick={onClose} className="p-2 md:p-2.5 hover:bg-gray-100 md:hover:bg-white rounded-full transition-colors text-gray-400 border border-transparent hover:border-gray-100 shadow-sm">
              <X size={20} className="md:hidden" />
              <X size={24} className="hidden md:block" />
            </button>
          </div>
        </div>

        <div className="p-5 md:p-8 overflow-y-auto flex-grow bg-white custom-scrollbar pb-8 md:pb-8">
          {loading ? (
            <ModalSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* ... contents ... */}
            
            {/* Left: Info (7 cols) */}
            <div className="md:col-span-7 space-y-8">
              
              {/* Status Banner */}
              <div className={`p-5 md:p-6 rounded-2xl md:rounded-[2rem] border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                order.status?.toLowerCase() === 'delivered' ? 'bg-green-50 border-green-100 text-green-700' :
                order.status?.toLowerCase() === 'cancelled' ? 'bg-red-50 border-red-100 text-red-700' :
                'bg-primary/5 border-primary/10 text-primary'
              }`}>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60">Current Status</p>
                    <p className="text-base md:text-lg font-black capitalize">{order.status}</p>
                  </div>
                </div>
                <div className="text-center sm:text-right w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-current border-opacity-10">
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60">Total Amount</p>
                  <p className="text-lg md:text-xl font-black">৳{order.totalAmount.toLocaleString()}</p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Hash size={14} className="text-primary" /> Items in this order
                </h3>
                <div className="bg-gray-50/50 rounded-2xl md:rounded-[2rem] border border-gray-100 overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="p-3 md:p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm p-1 border border-gray-100 flex-shrink-0">
                            {item.productImage ? (
                              <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover rounded-lg md:rounded-xl" />
                            ) : (
                              <Package size={20} className="text-gray-200" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-primary text-xs md:text-sm truncate">{item.productName || `Product ID: ${item.productId.slice(0, 8)}`}</p>
                            <p className="text-[10px] md:text-xs text-gray-500 font-medium">৳{item.price.toLocaleString()} × {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-black text-primary text-sm md:text-base whitespace-nowrap">৳{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shipping & Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white rounded-2xl md:rounded-[2rem] p-5 md:p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MapPin size={12} className="text-primary" /> Delivery Address
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 font-medium leading-relaxed">{order.shippingAddress}</p>
                </div>
                <div className="bg-white rounded-2xl md:rounded-[2rem] p-5 md:p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CreditCard size={12} className="text-primary" /> Payment Method
                  </h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs md:text-sm font-black text-primary uppercase">{order.paymentMethod || 'COD'}</p>
                      <p className="text-[9px] md:text-[10px] text-gray-400 font-bold mt-1">Status: Paid</p>
                    </div>
                    {order.paymentMethod?.toLowerCase() !== 'cod' && (
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/5 rounded-lg flex items-center justify-center">
                        <CheckCircle size={16} className="text-primary" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cancel Confirmation */}
              {showCancelConfirm && (
                <div className="p-5 md:p-6 bg-red-50 rounded-2xl md:rounded-[2rem] border border-red-100 space-y-4 animate-in zoom-in-95">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-[18px] h-[18px] md:w-5 md:h-5" />
                    <h4 className="font-black text-xs md:text-sm uppercase tracking-wider">Confirm Cancellation</h4>
                  </div>
                  <p className="text-xs md:text-sm text-red-700/80">Are you sure you want to cancel this order? This action cannot be undone.</p>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-red-200 bg-white text-sm font-bold outline-none appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-line-cap='round' stroke-line-join='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
                  >
                    <option value="">Why are you cancelling?</option>
                    <option value="Changed my mind">Changed my mind</option>
                    <option value="Found a better price">Found a better price</option>
                    <option value="Ordered by mistake">Ordered by mistake</option>
                    <option value="Other">Other</option>
                  </select>
                  {cancelError && <p className="text-[9px] md:text-[10px] font-bold text-red-600">{cancelError}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => setShowCancelConfirm(false)} className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-bold text-xs md:text-sm text-gray-500">Keep Order</button>
                    <button onClick={handleCancel} disabled={cancelling} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2">
                      {cancelling ? <Loader2 size={14} className="animate-spin" /> : 'Yes, Cancel'}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Right: Actions & Timeline (5 cols) */}
            <div className="md:col-span-5 space-y-6">
              
              {/* Actions */}
              {canCancel && !showCancelConfirm && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full px-4 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Ban size={14} /> Cancel Order
                  </button>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-gray-50/50 rounded-2xl md:rounded-[2rem] p-5 md:p-6 border border-gray-100 h-auto min-h-[250px] md:h-[280px] flex flex-col">
                <h3 className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex-shrink-0">Tracking Timeline</h3>
                <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow">
                  <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200 pb-4">
                    {order.trackings?.map((track, idx) => (
                      <div key={idx} className="relative pl-8">
                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm transition-all ${
                          idx === 0 ? 'bg-primary scale-110' : 'bg-gray-300'
                        }`} />
                        <div>
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0 pr-2">
                              <p className={`font-black text-xs md:text-sm uppercase tracking-tight truncate ${idx === 0 ? 'text-primary' : 'text-gray-600'}`}>
                                {track.status}
                              </p>
                              {track.message && (
                                <button 
                                  onClick={() => setViewingMessage({ status: track.status, message: track.message!, createdAt: track.createdAt })}
                                  className="mt-1.5 inline-flex items-center gap-1.5 text-[8px] md:text-[9px] font-bold text-primary px-2 py-0.5 bg-primary/5 rounded-md hover:bg-primary/10 transition-colors border border-primary/10"
                                >
                                  <MessageSquare size={10} />
                                  <span>View MSG</span>
                                </button>
                              )}
                            </div>
                            <span className="text-[8px] md:text-[10px] font-bold text-gray-400 whitespace-nowrap bg-white px-1.5 py-0.5 rounded-md border border-gray-100 shadow-sm">
                              {track.createdAt ? new Date(track.createdAt).toLocaleDateString('en-US', { hour: 'numeric', minute: 'numeric' }) : 'N/A'}
                            </span>
                          </div>
                          {track.location && (
                            <p className="text-[9px] md:text-[10px] text-primary/60 mt-1 font-bold flex items-center gap-1">
                              <MapPin size={10} /> {track.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {(!order.trackings || order.trackings.length === 0) && (
                    <p className="text-xs text-gray-500 font-medium opacity-60">No updates yet. Check back soon!</p>
                  )}
                </div>
              </div>

              {/* Courier Info (New Green Card) */}
              {(order.courierId || order.courierLink) && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-2xl md:rounded-[2rem] p-5 md:p-6 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-3 text-emerald-600 flex items-center gap-2">
                    <Truck size={12} /> Delivery Partner Details
                  </h3>
                  <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start gap-4">
                    <div className="flex-1">
                      <p className="text-[8px] md:text-[10px] font-bold text-emerald-700/60 uppercase tracking-tighter">Tracking ID</p>
                      <p className="text-base md:text-lg font-black font-mono text-emerald-900">{order.courierId || 'N/A'}</p>
                    </div>
                    {order.courierLink && (
                      <a 
                        href={order.courierLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-emerald-600 text-white rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                      >
                        <ExternalLink size={14} /> <span className="hidden xs:inline">Track Parcel</span><span className="xs:hidden">Track</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              </div>
            </div>
          )}
        </div>
      </div>

      {showInvoice && (
        <Invoice order={order} onClose={() => setShowInvoice(false)} />
      )}

      {viewingMessage && (
        <MessageModal 
          status={viewingMessage.status}
          message={viewingMessage.message}
          date={viewingMessage.createdAt}
          onClose={() => setViewingMessage(null)}
        />
      )}
    </div>
  );
};
