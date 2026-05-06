import React, { useState, useEffect } from 'react';
import { Bell, Send, Users, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface Customer {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
}

export const NotificationManager: React.FC = () => {
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

  useEffect(() => {
    const init = async () => {
      await fetchCustomers();
    };
    init();
  }, [fetchCustomers]);

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-primary flex items-center gap-2">
          <Bell size={24} className="text-accent" /> Notification & Offers Center
        </h2>
        <p className="text-muted font-medium text-sm">Send updates, offers, and custom notifications to your users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Send Broadcast / Custom Form */}
        <div className="md:col-span-2 bg-white rounded-[2rem] shadow-xl shadow-primary/5 border border-gray-100 p-6">
          <form onSubmit={handleSend} className="space-y-4">
            <h3 className="text-lg font-black text-primary mb-2 flex items-center gap-2">
              <Send size={18} className="text-accent" /> Compose Notification
            </h3>

            {status.type && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 text-sm font-medium ${
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

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Recipient
              </label>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              >
                <option value="">All Users (Broadcast / Offer Alert)</option>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Special Weekend Offer!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                >
                  <option value="info">General Info</option>
                  <option value="offer">Promotion / Offer</option>
                  <option value="order_status">Order Tracking Status</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Message Content
              </label>
              <textarea
                rows={4}
                placeholder="Write your notification message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-accent hover:bg-accent-light text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

        {/* Quick Help & Stats */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-primary/5 border border-gray-100 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-black text-primary flex items-center gap-2">
              <Users size={18} className="text-accent" /> Context Help
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                <strong className="text-primary block">Broadcasts:</strong> Selecting "All Users" triggers a notification for every customer visiting the storefront. This is highly effective for new arrivals, store-wide discount coupons, or events.
              </p>
              <p>
                <strong className="text-primary block">Individual Alerts:</strong> Pick a specific customer from the dropdown to notify them regarding specialized account status, special VIP discounts, or direct inquiries.
              </p>
              <p>
                <strong className="text-primary block">Live Browser Delivery:</strong> Unread notifications appear immediately to users via both in-app bell indicators and web desktop push-like alerts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
