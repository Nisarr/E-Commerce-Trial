import React, { useState, useEffect } from 'react';
import { Eye, X, Ban, RefreshCw, Loader2, Copy, Check, Save, ExternalLink, MapPin, Phone, Mail, Package, CreditCard, Hash, MessageSquare, Settings, Lock, Unlock } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Invoice } from '../../components/ui/Invoice';
import { MessageModal } from '../../components/ui/MessageModal';
import toast from 'react-hot-toast';
import { ModalSkeleton } from '../../components/ui/ShimmerSkeleton';
import { useUIStore } from '../../store/uiStore';
import type { Order } from '../../types';


export const OrderManager: React.FC = () => {
  const { setIsAdminModalOpen } = useUIStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('q') || '';
  const statusFilter = searchParams.get('status') || 'All';
  
  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [trackingForm, setTrackingForm] = useState({ status: 'Processing', message: '', location: '' });
  const [editForm, setEditForm] = useState({ shippingAddress: '', customerPhone: '', internalNote: '', courierId: '', courierLink: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewingMessage, setViewingMessage] = useState<{ status: string; message: string; createdAt?: string | Date } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isAdminEditing, setIsAdminEditing] = useState(false);

  // Using the admin key from local storage or config
  const adminKey = localStorage.getItem('admin_key') || 'adm_sk_72e829fc89d4e37decb405dace50ba5c';

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/v1/orders', {
        headers: { 'Authorization': `Bearer ${adminKey}` }
      });
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

  const fetchOrderDetails = async (id: string) => {
    setLoadingDetails(true);
    setSelectedOrder({ id } as Order); // Placeholder for modal to open instantly
    try {
      const res = await fetch(`/api/v1/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${adminKey}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
        setEditForm({
          shippingAddress: data.shippingAddress || '',
          customerPhone: data.customerPhone || '',
          internalNote: data.internalNote || '',
          courierId: data.courierId || '',
          courierLink: data.courierLink || ''
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        toast.success('Order updated successfully');
        await fetchOrderDetails(selectedOrder.id);
        fetchOrders();
      } else {
        toast.error('Failed to update order');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied to clipboard');
  };

  const getStatusStep = (status: string) => {
    const steps = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    const index = steps.findIndex(s => s.toLowerCase() === status.toLowerCase());
    return index === -1 ? 0 : index;
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchOrders();
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    setIsAdminModalOpen(!!selectedOrder || showInvoice);
  }, [selectedOrder, showInvoice, setIsAdminModalOpen]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const res = await fetch(`/api/v1/orders/${selectedOrder.id}/trackings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify(trackingForm)
      });

      if (res.ok) {
        await fetchOrderDetails(selectedOrder.id);
        fetchOrders();
        setTrackingForm({ status: 'Processing', message: '', location: '' });
      }
    } catch (error) {
      console.error("Failed to update tracking:", error);
    }
  };

  const handleUpdateAdminControls = async () => {
    if (!selectedOrder) return;
    setAdminActionLoading(true);
    try {
      const res = await fetch(`/api/v1/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify({
          courierId: editForm.courierId,
          courierLink: editForm.courierLink,
          internalNote: editForm.internalNote
        })
      });

      if (res.ok) {
        toast.success('Admin controls updated');
        await fetchOrderDetails(selectedOrder.id);
        setIsAdminEditing(false);
      } else {
        const err = await res.json();
        throw new Error(err.message || 'Update failed');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || !window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/orders/${selectedOrder.id}/cancel`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify({ reason: 'Cancelled by Administrator' })
      });
      if (res.ok) {
        toast.success('Order cancelled successfully');
        await fetchOrderDetails(selectedOrder.id);
        fetchOrders();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to cancel order');
      }
    } catch (error) {
      toast.error('Network error while cancelling');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopenOrder = async () => {
    if (!selectedOrder || !window.confirm('Re-open this order? System will check and consume stock.')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/orders/${selectedOrder.id}/reopen`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify({ reason: 'Re-opened by Administrator' })
      });
      if (res.ok) {
        toast.success('Order re-opened successfully');
        await fetchOrderDetails(selectedOrder.id);
        fetchOrders();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to re-open order');
      }
    } catch (error) {
      toast.error('Network error while re-opening');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    All: orders.length,
    Pending: orders.filter(o => o.status === 'Pending').length,
    Processing: orders.filter(o => o.status === 'Processing').length,
    Shipped: orders.filter(o => o.status === 'Shipped' || o.status === 'Out for Delivery').length,
    Delivered: orders.filter(o => o.status === 'Delivered').length,
    Cancelled: orders.filter(o => o.status === 'Cancelled').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-garamond text-[var(--adm-text-primary)]">Orders & Invoices</h1>
          <p className="text-[var(--adm-text-secondary)] font-medium">Manage customer orders and trackings</p>
        </div>
        {searchTerm && (
          <button 
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.delete('q');
              setSearchParams(newParams);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
          >
            <X size={14} strokeWidth={3} /> Clear Search
          </button>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              if (status === 'All') newParams.delete('status');
              else newParams.set('status', status);
              setSearchParams(newParams);
            }}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border flex items-center gap-2
              ${statusFilter === status 
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                : 'bg-[var(--adm-card-bg)] text-[var(--adm-text-secondary)] border-[var(--adm-border)] hover:border-[var(--adm-border)]'
              }`}
          >
            {status}
            <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${statusFilter === status ? 'bg-[var(--adm-card-bg)]/20' : 'bg-gray-100'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="bg-[var(--adm-card-bg)] md:rounded-2xl md:shadow-sm md:border border-[var(--adm-border)] overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--adm-bg)] border-b border-[var(--adm-border)]">
                <th className="p-4 font-bold text-[var(--adm-text-secondary)] text-sm tracking-wider uppercase">Invoice ID</th>
                <th className="p-4 font-bold text-[var(--adm-text-secondary)] text-sm tracking-wider uppercase">Customer</th>
                <th className="p-4 font-bold text-[var(--adm-text-secondary)] text-sm tracking-wider uppercase">Date</th>
                <th className="p-4 font-bold text-[var(--adm-text-secondary)] text-sm tracking-wider uppercase">Status</th>
                <th className="p-4 font-bold text-[var(--adm-text-secondary)] text-sm tracking-wider uppercase text-right">Total</th>
                <th className="p-4 font-bold text-[var(--adm-text-secondary)] text-sm tracking-wider uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="p-4">
                      <div className="h-12 w-full rounded-xl skeleton" />
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--adm-text-secondary)]">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-[var(--adm-border)] hover:bg-[var(--adm-bg)]/50 transition-colors">
                    <td className="p-4 font-bold text-[var(--adm-text-primary)]">{order.invoiceId}</td>
                    <td className="p-4 text-[var(--adm-text-secondary)] font-medium">{order.customerName}</td>
                    <td className="p-4 text-[var(--adm-text-secondary)]">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wide
                        ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'Shipped' || order.status === 'Out for Delivery' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-[var(--adm-text-primary)]">৳{(order.totalAmount).toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => fetchOrderDetails(order.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 space-y-3">
                <div className="h-6 w-1/3 bg-gray-100 rounded skeleton" />
                <div className="h-4 w-1/2 bg-gray-100 rounded skeleton" />
                <div className="flex justify-between">
                  <div className="h-5 w-20 bg-gray-100 rounded skeleton" />
                  <div className="h-5 w-16 bg-gray-100 rounded skeleton" />
                </div>
              </div>
            ))
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-[var(--adm-text-secondary)]">No orders found.</div>
          ) : (
            filteredOrders.map((order) => (
              <div 
                key={order.id} 
                className="p-4 active:bg-[var(--adm-bg)] transition-colors space-y-3"
                onClick={() => fetchOrderDetails(order.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-[var(--adm-text-primary)] text-sm">{order.invoiceId}</h3>
                    <p className="text-xs text-[var(--adm-text-secondary)] font-medium">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded-lg uppercase tracking-widest
                    ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'Shipped' || order.status === 'Out for Delivery' ? 'bg-purple-100 text-purple-700' :
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-[var(--adm-text-secondary)] font-bold">{order.customerName}</p>
                    <p className="text-[10px] text-[var(--adm-text-secondary)] font-medium">৳{(order.totalAmount).toLocaleString()}</p>
                  </div>
                  <button className="p-2 text-blue-600 bg-blue-50 rounded-lg">
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-[var(--adm-card-bg)] rounded-[2rem] md:rounded-[2.5rem] w-full max-w-6xl h-[85vh] md:h-auto md:max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-300 mb-18 md:mb-0">
            {/* Header */}
            <div className="px-5 md:px-8 py-5 md:py-6 border-b border-[var(--adm-border)] flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[var(--adm-bg)]/50 gap-4 flex-shrink-0">
              <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-[var(--adm-text-primary)] flex-shrink-0">
                  <Package size={20} className="md:hidden" />
                  <Package size={24} className="hidden md:block" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg md:text-2xl font-black font-garamond text-[var(--adm-text-primary)] flex items-center gap-2 truncate">
                    Order {selectedOrder.invoiceId}
                    <button 
                      onClick={() => copyToClipboard(selectedOrder.invoiceId, 'inv')}
                      className="p-1 hover:bg-gray-200 rounded-md transition-colors flex-shrink-0"
                    >
                      {copiedId === 'inv' ? <Check size={14} className="text-green-600" /> : <Copy size={12} className="text-[var(--adm-text-secondary)]" />}
                    </button>
                  </h2>
                  <p className="text-[8px] md:text-[10px] font-black text-[var(--adm-text-secondary)] uppercase tracking-widest truncate">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
                  </p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="sm:hidden ml-auto p-2 hover:bg-gray-200 rounded-full text-[var(--adm-text-secondary)]">
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                {selectedOrder.status && (
                  <>
                    {selectedOrder.status?.toLowerCase() !== 'cancelled' ? (
                      <button 
                        onClick={handleCancelOrder}
                        disabled={actionLoading}
                        className="px-3 md:px-5 py-2 md:py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5 md:gap-2 text-[10px] md:text-sm shadow-sm whitespace-nowrap flex-shrink-0"
                      >
                        {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Ban className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                        <span className="hidden xs:inline">Cancel Order</span><span className="xs:hidden">Cancel</span>
                      </button>
                    ) : (
                      <button 
                        onClick={handleReopenOrder}
                        disabled={actionLoading}
                        className="px-3 md:px-5 py-2 md:py-2.5 bg-green-50 text-green-600 rounded-xl font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-1.5 md:gap-2 text-[10px] md:text-sm shadow-sm whitespace-nowrap flex-shrink-0"
                      >
                        {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                        <span className="hidden xs:inline">Re-open Order</span><span className="xs:hidden">Re-open</span>
                      </button>
                    )}
                  </>
                )}
                <button 
                  onClick={() => {
                    if (isEditing) handleUpdateOrder();
                    else setIsEditing(true);
                  }}
                  className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-bold transition-all flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm shadow-sm whitespace-nowrap flex-shrink-0 ${
                    isEditing ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20' : 'bg-[var(--adm-card-bg)] border border-[var(--adm-border)] text-[var(--adm-text-primary)] hover:bg-[var(--adm-bg)]'
                  }`}
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : isEditing ? <><Save className="w-3.5 h-3.5 md:w-4 md:h-4" /> Save</> : <><Settings className="w-3.5 h-3.5 md:w-4 md:h-4" /> Edit</>}
                </button>
                <button 
                  onClick={() => setShowInvoice(true)}
                  className="px-3 md:px-5 py-2 md:py-2.5 bg-[var(--adm-card-bg)] border border-[var(--adm-border)] text-[var(--adm-text-primary)] rounded-xl font-bold hover:bg-[var(--adm-bg)] transition-all flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm shadow-sm whitespace-nowrap flex-shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" /> Invoice
                </button>
                <button onClick={() => setSelectedOrder(null)} className="hidden sm:flex p-2 md:p-2.5 hover:bg-[var(--adm-card-bg)] rounded-full transition-colors text-[var(--adm-text-secondary)] border border-transparent hover:border-[var(--adm-border)] shadow-sm">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-5 md:p-8 overflow-y-auto flex-grow bg-[var(--adm-card-bg)] custom-scrollbar pb-8 md:pb-8">
              {loadingDetails ? (
                <ModalSkeleton />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* ... contents ... */}
                
                {/* Left Section: Details (7 cols) */}
                <div className="lg:col-span-7 space-y-8">
                  
                  {/* Progress Stepper */}
                  <div className="bg-[var(--adm-bg)]/50 rounded-2xl md:rounded-[2rem] p-4 md:p-6 border border-[var(--adm-border)] overflow-x-auto scrollbar-hide">
                    <div className="flex justify-between items-center min-w-[400px] mb-2 sm:mb-8">
                      {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, i) => {
                        const currentStep = getStatusStep(selectedOrder.status);
                        const isCompleted = i < currentStep || selectedOrder.status === 'Delivered';
                        const isActive = i === currentStep;
                        return (
                          <div key={step} className="flex flex-col items-center gap-2 flex-1 relative">
                            {i < 3 && (
                              <div className={`absolute top-4 left-1/2 w-full h-[2px] ${i < currentStep ? 'bg-primary' : 'bg-gray-200'}`} />
                            )}
                            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${
                              isCompleted ? 'bg-primary text-white' : isActive ? 'bg-accent text-white scale-110 shadow-lg' : 'bg-gray-200 text-[var(--adm-text-secondary)]'
                            }`}>
                              {isCompleted ? <Check strokeWidth={3} className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <span className="text-[10px] md:text-xs font-black">{i + 1}</span>}
                            </div>
                            <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-[var(--adm-text-primary)]' : 'text-[var(--adm-text-secondary)]'}`}>{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div className="bg-[var(--adm-card-bg)] rounded-2xl md:rounded-[2rem] p-5 md:p-6 border border-[var(--adm-border)] shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-[9px] md:text-xs font-black text-[var(--adm-text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Phone className="text-[var(--adm-text-primary)] w-3 h-3 md:w-3.5 md:h-3.5" /> Contact
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-[var(--adm-bg)] rounded-lg md:rounded-xl flex items-center justify-center text-[var(--adm-text-secondary)] flex-shrink-0">
                              <span className="font-bold text-sm md:text-base">{selectedOrder.customerName.charAt(0)}</span>
                            </div>
                            <div className="min-w-0">
                              <button 
                                onClick={() => {
                                  const newParams = new URLSearchParams(searchParams);
                                  newParams.set('q', selectedOrder.customerName);
                                  setSearchParams(newParams);
                                  setSelectedOrder(null);
                                }}
                                className="font-bold text-[var(--adm-text-primary)] hover:text-accent transition-colors text-left text-sm md:text-base truncate block w-full"
                              >
                                {selectedOrder.customerName}
                              </button>
                              <div className="flex items-center gap-1.5 truncate">
                                <Mail size={10} className="text-[var(--adm-text-secondary)] flex-shrink-0" />
                                <span className="text-[10px] md:text-xs text-[var(--adm-text-secondary)] truncate">{selectedOrder.customerEmail || 'No email'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-[var(--adm-border)] flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <Phone className="text-[var(--adm-text-secondary)] flex-shrink-0 w-3 h-3 md:w-3.5 md:h-3.5" />
                            <input 
                              type="text"
                              value={isEditing ? editForm.customerPhone : selectedOrder.customerPhone}
                              onChange={(e) => setEditForm({...editForm, customerPhone: e.target.value})}
                              disabled={!isEditing}
                              className={`text-xs md:text-sm font-bold text-[var(--adm-text-primary)] bg-transparent outline-none truncate w-full ${isEditing ? 'border-b border-primary' : ''}`}
                            />
                          </div>
                          <button 
                            onClick={() => copyToClipboard(selectedOrder.customerPhone, 'phone')}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                          >
                            {copiedId === 'phone' ? <Check size={14} className="text-green-600" /> : <Copy className="text-[var(--adm-text-secondary)] w-3 h-3 md:w-3.5 md:h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-[var(--adm-card-bg)] rounded-2xl md:rounded-[2rem] p-5 md:p-6 border border-[var(--adm-border)] shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[9px] md:text-xs font-black text-[var(--adm-text-secondary)] uppercase tracking-widest flex items-center gap-2">
                          <MapPin className="text-[var(--adm-text-primary)] w-3 h-3 md:w-3.5 md:h-3.5" /> Shipping Address
                        </h3>
                        <button 
                          onClick={() => copyToClipboard(isEditing ? editForm.shippingAddress : selectedOrder.shippingAddress, 'addr')}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {copiedId === 'addr' ? <Check size={14} className="text-green-600" /> : <Copy className="text-[var(--adm-text-secondary)] w-3 h-3 md:w-3.5 md:h-3.5" />}
                        </button>
                      </div>
                      <textarea 
                        value={isEditing ? editForm.shippingAddress : selectedOrder.shippingAddress}
                        onChange={(e) => setEditForm({...editForm, shippingAddress: e.target.value})}
                        disabled={!isEditing}
                        className={`w-full text-xs md:text-sm text-[var(--adm-text-secondary)] bg-transparent outline-none resize-none min-h-[60px] md:min-h-[80px] leading-relaxed ${isEditing ? 'border-2 border-primary/20 rounded-xl p-3 bg-primary/5' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="bg-[var(--adm-card-bg)] rounded-2xl md:rounded-[2rem] p-5 md:p-6 border border-[var(--adm-border)] shadow-sm overflow-x-auto">
                    <h3 className="text-[9px] md:text-xs font-black text-[var(--adm-text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                      <CreditCard className="text-[var(--adm-text-primary)] w-3 h-3 md:w-3.5 md:h-3.5" /> Payment
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 min-w-max">
                      <div className={`px-3 md:px-4 py-2 md:py-3 rounded-xl md:rounded-2xl flex items-center gap-3 border ${
                        selectedOrder.paymentMethod === 'bkash' ? 'bg-[#e2136e]/5 border-[#e2136e]/20 text-[#e2136e]' :
                        selectedOrder.paymentMethod === 'nagad' ? 'bg-[#f7941d]/5 border-[#f7941d]/20 text-[#f7941d]' :
                        'bg-primary/5 border-primary/20 text-[var(--adm-text-primary)]'
                      }`}>
                        <span className="font-black uppercase text-xs md:text-sm">{selectedOrder.paymentMethod || 'COD'}</span>
                      </div>
                      {selectedOrder.paymentPhone && (
                        <div className="px-3 md:px-4 py-2 md:py-3 bg-[var(--adm-bg)] rounded-xl md:rounded-2xl border border-[var(--adm-border)] flex items-center gap-3">
                          <div className="text-[8px] md:text-[10px] font-black text-[var(--adm-text-secondary)] uppercase tracking-widest">Sender</div>
                          <span className="font-mono font-bold text-xs md:text-sm text-[var(--adm-text-primary)]">{selectedOrder.paymentPhone}</span>
                          <button onClick={() => copyToClipboard(selectedOrder.paymentPhone!, 'payp')} className="text-[var(--adm-text-secondary)] hover:text-[var(--adm-text-primary)]">
                            {copiedId === 'payp' ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      )}
                      {selectedOrder.paymentTrxId && (
                        <div className="px-3 md:px-4 py-2 md:py-3 bg-[var(--adm-bg)] rounded-xl md:rounded-2xl border border-[var(--adm-border)] flex items-center gap-3">
                          <div className="text-[8px] md:text-[10px] font-black text-[var(--adm-text-secondary)] uppercase tracking-widest">TRXID</div>
                          <span className="font-mono font-bold text-xs md:text-sm text-[var(--adm-text-primary)]">{selectedOrder.paymentTrxId}</span>
                          <button onClick={() => copyToClipboard(selectedOrder.paymentTrxId!, 'payt')} className="text-[var(--adm-text-secondary)] hover:text-[var(--adm-text-primary)]">
                            {copiedId === 'payt' ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="bg-[var(--adm-card-bg)] rounded-2xl md:rounded-[2.5rem] border border-[var(--adm-border)] overflow-hidden shadow-sm">
                    <div className="px-5 md:px-6 py-4 bg-[var(--adm-bg)] border-b border-[var(--adm-border)] flex justify-between items-center">
                      <h3 className="text-[9px] md:text-xs font-black text-[var(--adm-text-secondary)] uppercase tracking-widest">Order Items</h3>
                      <span className="text-[10px] md:text-xs font-bold text-[var(--adm-text-primary)]">{selectedOrder.items?.length} Items</span>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="p-3 md:p-4 flex items-center justify-between hover:bg-[var(--adm-bg)]/50 transition-colors gap-3">
                          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg md:rounded-xl flex items-center justify-center text-[var(--adm-text-secondary)] flex-shrink-0 p-0.5">
                              {item.productImage ? <img src={item.productImage} className="w-full h-full object-cover rounded-md md:rounded-lg" /> : <Package size={18} />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[var(--adm-text-primary)] text-xs md:text-sm truncate">{item.productName || `ID: ${item.productId.slice(0,8)}`}</p>
                              <p className="text-[10px] md:text-xs text-[var(--adm-text-secondary)] font-medium">৳{item.price.toLocaleString()} × {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-black text-[var(--adm-text-primary)] text-sm md:text-base whitespace-nowrap">৳{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-5 md:px-6 py-4 bg-[var(--adm-bg)]/50 flex justify-between items-center border-t border-[var(--adm-border)]">
                      <span className="font-bold text-[var(--adm-text-secondary)] text-sm">Grand Total</span>
                      <span className="text-lg md:text-xl font-black text-[var(--adm-text-primary)]">৳{selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                </div>

                {/* Right Section: Actions & Timeline (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Status Control */}
                  <div className="bg-primary text-white rounded-2xl md:rounded-[2rem] p-5 md:p-6 shadow-xl shadow-primary/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--adm-card-bg)]/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
                    <h3 className="text-[9px] md:text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 opacity-80">
                      <Hash className="w-3 h-3 md:w-3.5 md:h-3.5" /> Quick Actions
                    </h3>
                    
                    <form onSubmit={handleStatusUpdate} className="space-y-4 relative z-10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-70">Update Status</label>
                          <select 
                            value={trackingForm.status}
                            onChange={(e) => setTrackingForm({...trackingForm, status: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--adm-card-bg)]/10 border border-white/20 text-white outline-none focus:bg-[var(--adm-card-bg)] focus:text-[var(--adm-text-primary)] transition-all text-xs md:text-sm font-bold appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-line-cap='round' stroke-line-join='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                          >
                            <option value="Pending" className="text-[var(--adm-text-primary)]">Pending</option>
                            <option value="Processing" className="text-[var(--adm-text-primary)]">Processing</option>
                            <option value="Shipped" className="text-[var(--adm-text-primary)]">Shipped</option>
                            <option value="Out for Delivery" className="text-[var(--adm-text-primary)]">Out for Delivery</option>
                            <option value="Delivered" className="text-[var(--adm-text-primary)]">Delivered</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-70">Message to Customer</label>
                          <input 
                            type="text"
                            value={trackingForm.message}
                            onChange={(e) => setTrackingForm({...trackingForm, message: e.target.value})}
                            placeholder="e.g. Dispatched from Warehouse"
                            className="w-full px-4 py-3 rounded-xl bg-[var(--adm-card-bg)]/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:bg-[var(--adm-card-bg)] focus:text-[var(--adm-text-primary)] transition-all text-xs md:text-sm font-medium"
                          />
                        </div>
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-3 md:py-3.5 bg-accent text-white rounded-xl font-black uppercase tracking-widest hover:bg-[var(--adm-card-bg)] hover:text-accent transition-all shadow-lg text-[10px] md:text-xs"
                      >
                        Update & Notify
                      </button>
                    </form>
                  </div>

                  <div className="bg-[var(--adm-card-bg)] rounded-2xl md:rounded-[2rem] p-5 md:p-6 border border-[var(--adm-border)] shadow-sm space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[9px] md:text-xs font-black text-[var(--adm-text-secondary)] uppercase tracking-widest flex items-center gap-2">
                        <Lock className={`w-3 h-3 md:w-3.5 md:h-3.5 ${isAdminEditing ? "text-accent" : "text-[var(--adm-text-primary)]"}`} /> Admin Controls
                      </h3>
                      {!isAdminEditing ? (
                        <button 
                          onClick={() => setIsAdminEditing(true)}
                          className="px-2 md:px-3 py-1 md:py-1.5 bg-[var(--adm-bg)] text-[var(--adm-text-secondary)] rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-[var(--adm-border)] flex items-center gap-1 md:gap-1.5"
                        >
                          <Unlock size={10} /> Unlock
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setIsAdminEditing(false)}
                            className="px-2 py-1 text-[var(--adm-text-secondary)] hover:text-[var(--adm-text-secondary)] text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleUpdateAdminControls}
                            disabled={adminActionLoading}
                            className="px-2 md:px-3 py-1 md:py-1.5 bg-primary text-white rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-1 md:gap-1.5 shadow-md shadow-primary/20"
                          >
                            {adminActionLoading ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
                            Save
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        <div className="flex-1">
                          <label className="block text-[9px] md:text-[10px] font-black text-[var(--adm-text-secondary)] uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <Hash className="text-[var(--adm-text-primary)] w-2.5 h-2.5 md:w-3 md:h-3" /> Courier Tracking ID
                          </label>
                          <input 
                            type="text"
                            placeholder="e.g. PATHAO-123456"
                            value={isAdminEditing ? editForm.courierId : selectedOrder.courierId || ''}
                            onChange={(e) => setEditForm({...editForm, courierId: e.target.value})}
                            disabled={!isAdminEditing}
                            className={`w-full px-3 md:px-4 py-2 md:py-2.5 rounded-xl border border-[var(--adm-border)] bg-[var(--adm-bg)] text-xs md:text-sm font-bold outline-none focus:border-primary transition-all ${isAdminEditing ? 'bg-[var(--adm-card-bg)] shadow-sm ring-2 ring-primary/5' : ''}`}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[9px] md:text-[10px] font-black text-[var(--adm-text-secondary)] uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <ExternalLink className="text-[var(--adm-text-primary)] w-2.5 h-2.5 md:w-3 md:h-3" /> Tracking Link (URL)
                          </label>
                          <input 
                            type="text"
                            placeholder="https://track.pathao.com/..."
                            value={isAdminEditing ? editForm.courierLink : selectedOrder.courierLink || ''}
                            onChange={(e) => setEditForm({...editForm, courierLink: e.target.value})}
                            disabled={!isAdminEditing}
                            className={`w-full px-3 md:px-4 py-2 md:py-2.5 rounded-xl border border-[var(--adm-border)] bg-[var(--adm-bg)] text-xs md:text-sm font-bold outline-none focus:border-primary transition-all ${isAdminEditing ? 'bg-[var(--adm-card-bg)] shadow-sm ring-2 ring-primary/5' : ''}`}
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[var(--adm-border)]">
                        <label className="block text-[9px] md:text-[10px] font-black text-[var(--adm-text-secondary)] uppercase tracking-widest mb-1.5 flex items-center gap-2">
                          <MessageSquare className="text-[var(--adm-text-primary)] w-2.5 h-2.5 md:w-3 md:h-3" /> Internal Note (Admin Only)
                        </label>
                        <textarea 
                          placeholder="Private notes about this order..."
                          value={isAdminEditing ? editForm.internalNote : selectedOrder.internalNote || ''}
                          onChange={(e) => setEditForm({...editForm, internalNote: e.target.value})}
                          disabled={!isAdminEditing}
                          className={`w-full px-3 md:px-4 py-2 md:py-2.5 rounded-xl border border-[var(--adm-border)] bg-[var(--adm-bg)] text-xs md:text-sm outline-none focus:border-primary resize-none h-20 md:h-24 transition-all ${isAdminEditing ? 'bg-[var(--adm-card-bg)] shadow-sm ring-2 ring-primary/5' : ''}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Timeline */}
                  <div className="bg-[var(--adm-card-bg)] rounded-2xl md:rounded-[2rem] p-5 md:p-6 border border-[var(--adm-border)] shadow-sm flex flex-col h-[280px] md:h-[320px]">
                    <h3 className="text-[9px] md:text-xs font-black text-[var(--adm-text-secondary)] uppercase tracking-widest mb-6 flex-shrink-0">Activity Log</h3>
                    <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow">
                      <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100 pb-4">
                        {selectedOrder.trackings?.map((track, idx) => (
                          <div key={idx} className="relative pl-8">
                            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-all ${
                              idx === 0 ? 'bg-primary scale-110' : 'bg-gray-200'
                            }`}>
                              <div className="w-1.5 h-1.5 rounded-full bg-[var(--adm-card-bg)]" />
                            </div>
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0 pr-2">
                                <p className={`font-black text-xs md:text-sm uppercase tracking-tight truncate ${idx === 0 ? 'text-[var(--adm-text-primary)]' : 'text-[var(--adm-text-secondary)]'}`}>
                                  {track.status}
                                </p>
                                {track.message && (
                                  <button 
                                    onClick={() => setViewingMessage({ status: track.status, message: track.message!, createdAt: track.createdAt })}
                                    className="mt-1.5 inline-flex items-center gap-1.5 text-[8px] md:text-[9px] font-bold text-[var(--adm-text-primary)] px-2 py-0.5 bg-primary/5 rounded-md hover:bg-primary/10 transition-colors border border-primary/10"
                                  >
                                    <MessageSquare size={10} />
                                    <span>View MSG</span>
                                  </button>
                                )}
                              </div>
                              <span className="text-[8px] md:text-[10px] font-bold text-[var(--adm-text-secondary)] bg-[var(--adm-bg)] px-2 py-0.5 rounded-full whitespace-nowrap">
                                {track.createdAt ? new Date(track.createdAt).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                              </span>
                            </div>
                            {track.location && (
                              <p className="text-[9px] md:text-[10px] text-[var(--adm-text-primary)]/60 mt-1 font-bold flex items-center gap-1 truncate">
                                <MapPin size={10} /> {track.location}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      {(!selectedOrder.trackings || selectedOrder.trackings.length === 0) && (
                        <p className="text-xs text-[var(--adm-text-secondary)] font-medium opacity-60">No activity logged yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

      {showInvoice && selectedOrder && (
        <Invoice order={selectedOrder} onClose={() => setShowInvoice(false)} />
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
