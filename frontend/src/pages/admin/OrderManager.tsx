import React, { useState, useEffect } from 'react';
import { Search, Eye, Truck } from 'lucide-react';
import { Invoice } from '../../components/ui/Invoice';

export const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [trackingForm, setTrackingForm] = useState({ status: 'Processing', message: '', location: '' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/v1/orders', {
        headers: { 'Authorization': `Bearer ADMIN_SECRET_123` }
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
    try {
      const res = await fetch(`/api/v1/orders/${id}`, {
        headers: { 'Authorization': `Bearer ADMIN_SECRET_123` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const res = await fetch(`/api/v1/orders/${selectedOrder.id}/trackings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ADMIN_SECRET_123`
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

  const filteredOrders = orders.filter(o => 
    o.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-garamond text-primary">Orders & Invoices</h1>
          <p className="text-gray-500 font-medium">Manage customer orders and trackings</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by Invoice ID or Customer Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-bold text-gray-500 text-sm tracking-wider uppercase">Invoice ID</th>
                <th className="p-4 font-bold text-gray-500 text-sm tracking-wider uppercase">Customer</th>
                <th className="p-4 font-bold text-gray-500 text-sm tracking-wider uppercase">Date</th>
                <th className="p-4 font-bold text-gray-500 text-sm tracking-wider uppercase">Status</th>
                <th className="p-4 font-bold text-gray-500 text-sm tracking-wider uppercase text-right">Total</th>
                <th className="p-4 font-bold text-gray-500 text-sm tracking-wider uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-primary">{order.invoiceId}</td>
                    <td className="p-4 text-gray-600 font-medium">{order.customerName}</td>
                    <td className="p-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wide
                        ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'Shipped' || order.status === 'Out for Delivery' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-primary">৳{(order.totalAmount).toLocaleString()}</td>
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
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-2xl font-black font-garamond text-primary">Manage Order {selectedOrder.invoiceId}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow flex flex-col md:flex-row gap-8">
              {/* Left Column: Order Info */}
              <div className="flex-grow space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-black text-primary">Customer</h3>
                      <p className="font-medium text-gray-700">{selectedOrder.customerName}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.customerEmail}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.customerPhone}</p>
                    </div>
                    <button 
                      onClick={() => setShowInvoice(true)}
                      className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 text-sm"
                    >
                      View Invoice
                    </button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-black text-primary mb-2">Shipping Address</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{selectedOrder.shippingAddress}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-black text-primary mb-2 flex items-center justify-between">
                      Payment Details
                      <span className={`text-xs px-2 py-1 rounded-lg uppercase tracking-wider ${
                        selectedOrder.paymentMethod === 'bkash' ? 'bg-[#e2136e]/10 text-[#e2136e]' :
                        selectedOrder.paymentMethod === 'nagad' ? 'bg-[#f7941d]/10 text-[#f7941d]' :
                        selectedOrder.paymentMethod === 'wallet' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {selectedOrder.paymentMethod || 'COD'}
                      </span>
                    </h3>
                    {selectedOrder.paymentMethod && selectedOrder.paymentMethod !== 'cod' && selectedOrder.paymentMethod !== 'wallet' ? (
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">MFS Number</p>
                          <p className="font-bold text-primary font-mono">{selectedOrder.paymentPhone}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">TrxID</p>
                          <p className="font-bold text-primary font-mono">{selectedOrder.paymentTrxId}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-2">Cash on Delivery / Wallet balance used.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-primary mb-3">Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <span className="font-medium text-primary text-sm">{item.productName || `Product ID: ${item.productId.slice(0,8)}`} x{item.quantity}</span>
                        <span className="font-bold text-accent">৳{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Tracking */}
              <div className="w-full md:w-80 flex-shrink-0 space-y-6">
                <div className="bg-accent/5 rounded-2xl p-6 border border-accent/10">
                  <h3 className="text-lg font-black text-primary mb-4 flex items-center gap-2">
                    <Truck size={20} className="text-accent" /> Update Tracking
                  </h3>
                  <form onSubmit={handleStatusUpdate} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
                      <select 
                        value={trackingForm.status}
                        onChange={(e) => setTrackingForm({...trackingForm, status: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 focus:border-accent outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Pending Verification">Pending Verification (MFS)</option>
                        <option value="Processing">Processing (Payment Verified)</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Message (Optional)</label>
                      <textarea 
                        value={trackingForm.message}
                        onChange={(e) => setTrackingForm({...trackingForm, message: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 focus:border-accent outline-none text-sm"
                        placeholder="e.g. Package arrived at facility"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location (Optional)</label>
                      <input 
                        type="text"
                        value={trackingForm.location}
                        onChange={(e) => setTrackingForm({...trackingForm, location: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 focus:border-accent outline-none text-sm"
                        placeholder="e.g. New York, NY"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-accent text-white rounded-xl font-bold hover:bg-accent/90 transition-colors"
                    >
                      Update Status
                    </button>
                  </form>
                </div>

                <div>
                  <h3 className="font-bold text-primary mb-3">Timeline</h3>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    {selectedOrder.trackings?.map((track: any, idx: number) => (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-white bg-accent text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10" />
                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-primary text-sm">{track.status}</span>
                            <span className="text-[10px] font-bold text-gray-400">{new Date(track.createdAt).toLocaleDateString()}</span>
                          </div>
                          {track.message && <p className="text-xs text-gray-600">{track.message}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInvoice && selectedOrder && (
        <Invoice order={selectedOrder} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
};
