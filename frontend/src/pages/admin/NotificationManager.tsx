import React, { useState, useEffect } from 'react';
import { Bell, Send, Users, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface Customer {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
}

export const NotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  // Form state
  const [recipientId, setRecipientId] = useState<string>(''); // empty means "All Users"
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const fetchCustomers = React.useCallback(async () => {
    try {
      const res = await fetch('/api/v1/users?limit=100');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  const fetchNotifications = React.useCallback(async () => {
    setLoadingNotifs(true);
    try {
      const res = await fetch('/api/v1/notifications?all=true');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoadingNotifs(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchCustomers();
      await fetchNotifications();
    };
    init();
  }, [fetchCustomers, fetchNotifications]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      setStatus({ type: 'error', message: 'Please provide both title and message.' });
      return;
    }

    setSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ADMIN_SECRET_123',
        },
        body: JSON.stringify({
          userId: recipientId || null, // null means broadcast
          title,
          message,
          type,
        }),
      });

      if (res.ok) {
        setStatus({ type: 'success', message: 'Notification sent successfully!' });
        setTitle('');
        setMessage('');
        setType('info');
        setRecipientId('');
        fetchNotifications(); // Refresh history
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error || 'Failed to send notification.' });
      }
    } catch (err: unknown) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'An error occurred while sending.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-primary flex items-center gap-2 font-garamond">
          <Bell size={24} className="text-accent" /> Notification & Offers Center
        </h2>
        <p className="text-muted font-medium text-sm">Send updates, offers, and custom notifications to your users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Send Broadcast / Custom Form */}
        <div className="md:col-span-7 space-y-8">
          <div className="bg-white rounded-[2rem] shadow-xl shadow-primary/5 border border-gray-100 p-8">
            <form onSubmit={handleSend} className="space-y-6">
              <h3 className="text-lg font-black text-primary mb-2 flex items-center gap-2">
                <Send size={18} className="text-accent" /> Compose Notification
              </h3>

              {status.type && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 text-sm font-medium animate-in zoom-in-95 ${
                    status.type === 'success'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {status.type === 'success' ? (
                    <CheckCircle className="shrink-0 mt-0.5" size={16} />
                  ) : (
                    <AlertCircle className="shrink-0 mt-0.5" size={16} />
                  )}
                  <span>{status.message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Recipient Target
                  </label>
                  <select
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-primary focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
                  >
                    <option value="">All Users (Broadcast)</option>
                    {loadingCustomers ? (
                      <option disabled>Loading customers...</option>
                    ) : (
                      customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.fullName || c.username} (@{c.username})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Notification Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-primary focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
                  >
                    <option value="info">General Info</option>
                    <option value="offer">Promotion / Offer</option>
                    <option value="order_status">Order Tracking Status</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Message Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Special Weekend Offer!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-primary focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  placeholder="Write your notification message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} /> Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Send Notification Now
                  </>
                )}
              </button>
            </form>
          </div>

          {/* History List */}
          <div className="bg-white rounded-[2rem] shadow-xl shadow-primary/5 border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-black text-primary flex items-center gap-2">
                <Bell size={18} className="text-accent" /> Notification History
              </h3>
              <span className="text-xs font-bold text-muted bg-gray-50 px-3 py-1 rounded-full">
                {notifications.length} Sent
              </span>
            </div>
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto custom-scrollbar">
              {loadingNotifs ? (
                <div className="p-8 text-center text-muted font-medium">Loading history...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-muted font-medium">No notifications sent yet.</div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="p-6 hover:bg-gray-50 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter rounded-md ${
                          n.type === 'offer' ? 'bg-orange-100 text-orange-600' :
                          n.type === 'order_status' ? 'bg-purple-100 text-purple-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {n.type}
                        </span>
                        <h4 className="font-bold text-primary group-hover:text-accent transition-colors">{n.title}</h4>
                      </div>
                      <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md whitespace-nowrap">
                        {n.createdAt ? new Date(n.createdAt).toLocaleString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: 'numeric', 
                          minute: 'numeric',
                          hour12: true 
                        }) : 'N/A'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-2">{n.message}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users size={10} className="text-primary" />
                      </div>
                      <span className="text-[10px] font-bold text-primary/60">
                        Target: {n.userId ? `User ID: ${n.userId.slice(0, 8)}...` : 'All Users (Broadcast)'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Help & Stats */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-xl shadow-primary/5 border border-gray-100 p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-lg font-black text-primary flex items-center gap-2">
                <Users size={18} className="text-accent" /> Engagement Strategies
              </h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                  <strong className="text-primary block text-xs uppercase tracking-widest mb-2">📢 Global Broadcasts</strong>
                  <p className="text-xs leading-relaxed font-medium">Use "All Users" to announce new store collections, seasonal sales, or important site updates. These appear for everyone.</p>
                </div>
                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100/50">
                  <strong className="text-primary block text-xs uppercase tracking-widest mb-2">🎯 Personalized Offers</strong>
                  <p className="text-xs leading-relaxed font-medium">Target individual users with specialized discount codes or account-specific alerts to drive conversion.</p>
                </div>
                <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100/50">
                  <strong className="text-primary block text-xs uppercase tracking-widest mb-2">📦 Order Updates</strong>
                  <p className="text-xs leading-relaxed font-medium">While automated, you can manually notify users about shipping delays or custom order messages here.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/30">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
             <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <Bell size={18} className="text-accent" /> Quick Tip
             </h3>
             <p className="text-sm font-medium opacity-80 leading-relaxed">
               Notifications are a powerful tool. Try to keep titles catchy and messages concise to ensure users actually read them!
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
