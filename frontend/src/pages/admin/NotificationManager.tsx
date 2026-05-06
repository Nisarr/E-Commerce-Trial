import React, { useState, useEffect } from 'react';
import { Bell, Send, Users, AlertCircle, CheckCircle, RefreshCw, Search, Trash2, Copy, Info } from 'lucide-react';

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

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      const res = await fetch(`/api/v1/notifications/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ADMIN_SECRET_123' }
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const handleCopy = (n: any) => {
    setTitle(n.title);
    setMessage(n.message);
    setType(n.type);
    setRecipientId(n.userId || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         n.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || n.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Compact Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 md:px-0">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#3e4b5b] flex items-center gap-3 font-garamond">
            <div className="p-2 bg-[#ff6b6b]/10 rounded-xl text-[#ff6b6b]">
              <Bell size={24} />
            </div>
            Notification Manager
          </h2>
          <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest mt-1">Lifecycle Engagement & Broadcast Hub</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-3 overflow-hidden">
            {customers.slice(0, 5).map((c, i) => (
              <img 
                key={c.id} 
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white" 
                src={`https://ui-avatars.com/api/?name=${c.username}&background=${['ff6b6b', '4ecdc4', 'ffe66d'][i % 3]}&color=fff`} 
                alt="" 
              />
            ))}
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Reach {loadingCustomers ? '...' : customers.length}+ Users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Compact Compose Form (Sticky) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-200 overflow-hidden">
            <div className="p-6 md:p-8 bg-gray-50/50 border-b border-gray-100">
              <h3 className="text-lg font-black text-[#3e4b5b] flex items-center gap-2">
                <Send size={18} className="text-[#ff6b6b]" /> Compose
              </h3>
            </div>
            
            <form onSubmit={handleSend} className="p-6 md:p-8 space-y-5">
              {status.type && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold animate-in zoom-in-95 ${
                  status.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{status.message}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Recipient</label>
                  <select
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-2xl text-[13px] font-bold text-[#3e4b5b] focus:border-[#ff6b6b]/20 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="">All Active Users (Broadcast)</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.fullName || c.username} (@{c.username})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'info', icon: Info, label: 'General' },
                      { id: 'offer', icon: Copy, label: 'Offer' },
                      { id: 'order_status', icon: RefreshCw, label: 'Order' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                          type === t.id 
                            ? 'bg-[#ff6b6b]/5 border-[#ff6b6b] text-[#ff6b6b]' 
                            : 'bg-white border-gray-50 text-gray-400 hover:border-gray-200'
                        }`}
                      >
                        <t.icon size={16} />
                        <span className="text-[9px] font-black uppercase tracking-tighter">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Title</label>
                  <input
                    type="text"
                    placeholder="Enter short, catchy title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-2xl text-[13px] font-bold text-[#3e4b5b] focus:border-[#ff6b6b]/20 focus:bg-white transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Message</label>
                  <textarea
                    rows={3}
                    placeholder="Type your message content..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-2xl text-[13px] font-medium text-gray-600 focus:border-[#ff6b6b]/20 focus:bg-white transition-all outline-none resize-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#3e4b5b] hover:bg-[#ff6b6b] text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
              >
                {submitting ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
                {submitting ? 'Broadcasting...' : 'Blast Notification'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Smart History Explorer */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-200 overflow-hidden flex flex-col h-full min-h-[700px]">
            {/* History Header & Search */}
            <div className="p-6 md:p-8 bg-gray-50/30 border-b border-gray-50 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-[#3e4b5b] flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-xl text-gray-400">
                    <RefreshCw size={18} />
                  </div>
                  Recent History
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-white bg-[#ff6b6b] px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md shadow-[#ff6b6b]/20">
                    {filteredNotifications.length} Results
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff6b6b] transition-colors" size={16} />
                  <input 
                    type="text"
                    placeholder="Search history by title or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl text-[13px] font-bold text-[#3e4b5b] focus:border-[#ff6b6b]/20 transition-all outline-none shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border-2 border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'info', label: 'General' },
                    { id: 'offer', label: 'Offers' },
                    { id: 'order_status', label: 'Orders' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilterType(f.id)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        filterType === f.id ? 'bg-[#3e4b5b] text-white shadow-md' : 'text-gray-400 hover:text-[#ff6b6b]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loadingNotifs ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="h-32 bg-gray-50 rounded-3xl animate-pulse" />
                  ))
                ) : filteredNotifications.length === 0 ? (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto text-gray-200">
                      <Search size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Matches Found</p>
                      <p className="text-xs text-gray-400 font-medium mt-1">Try adjusting your search or filters</p>
                    </div>
                  </div>
                ) : (
                  filteredNotifications.map((n) => (
                    <div key={n.id} className="group p-5 bg-white rounded-3xl border-2 border-gray-100 hover:border-[#ff6b6b]/30 hover:shadow-xl hover:shadow-[#ff6b6b]/5 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-tighter rounded-lg border ${
                            n.type === 'offer' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                            n.type === 'order_status' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                            'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {n.type.replace('_', ' ')}
                          </span>
                          <span className="text-[9px] font-bold text-gray-400">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-[14px] font-black text-[#3e4b5b] mb-1 group-hover:text-[#ff6b6b] transition-colors line-clamp-1">{n.title}</h4>
                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed line-clamp-2">{n.message}</p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                            <Users size={12} />
                          </div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                            {n.userId ? 'Direct' : 'Broadcast'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => handleCopy(n)}
                            className="p-2 text-gray-400 hover:text-[#3e4b5b] transition-colors"
                            title="Resend / Draft"
                          >
                            <Copy size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(n.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete Permanently"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
