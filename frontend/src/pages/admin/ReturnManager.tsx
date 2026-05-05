import React, { useEffect, useState } from 'react';
import {
  RotateCcw, Loader2, CheckCircle2, XCircle, MessageSquare,
  Filter, Calendar, Package
} from 'lucide-react';

interface ReturnRecord {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  details?: string;
  images?: string;
  status: string;
  type: string;
  adminNotes?: string;
  createdAt?: string;
}

const STATUS_FILTERS = ['All', 'Requested', 'Approved', 'Rejected', 'Completed'];
const STATUS_COLORS: Record<string, string> = {
  Requested: 'bg-amber-100 text-amber-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  Completed: 'bg-blue-100 text-blue-700',
};

export const ReturnManager: React.FC = () => {
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [notesModal, setNotesModal] = useState<ReturnRecord | null>(null);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => { fetchReturns(); }, []);

  const fetchReturns = async () => {
    try {
      const res = await fetch('/api/v1/returns');
      const data = await res.json();
      setReturns(data.items || []);
    } catch { setReturns([]); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (id: string, status: string, notes?: string) => {
    setActionLoading(id);
    try {
      await fetch(`/api/v1/returns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: notes || undefined }),
      });
      setSuccess(`Return ${status.toLowerCase()}`);
      setTimeout(() => setSuccess(''), 2000);
      await fetchReturns();
      setNotesModal(null);
      setAdminNote('');
    } catch {} finally { setActionLoading(null); }
  };

  const filteredReturns = returns.filter((r) => filter === 'All' || r.status === filter);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-primary flex items-center gap-2">
            <RotateCcw size={24} /> Returns & Cancellations
          </h2>
          <p className="text-muted font-medium text-sm">{returns.length} request{returns.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-gray-400" />
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-colors ${
              filter === f
                ? 'bg-primary text-white shadow'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {f} {f !== 'All' && `(${returns.filter(r => r.status === f).length})`}
          </button>
        ))}
      </div>

      {success && <div className="p-3 bg-green-50 text-green-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-green-100"><CheckCircle2 size={14} /> {success}</div>}

      {/* Returns List */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-primary/5 border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 w-full rounded-2xl border border-gray-50 skeleton" />
            ))}
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <RotateCcw size={48} />
            <p className="mt-4 font-bold">No {filter !== 'All' ? filter.toLowerCase() : ''} requests found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredReturns.map((r) => (
              <div key={r.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        r.type === 'cancellation' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {r.type}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-500'}`}>
                        {r.status}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                        <Package size={10} /> Order: {r.orderId.slice(0, 8)}...
                      </span>
                    </div>

                    <h4 className="font-bold text-primary text-sm mb-1">Reason: {r.reason}</h4>
                    {r.details && <p className="text-xs text-muted leading-relaxed mb-2">{r.details}</p>}

                    {r.images && (() => {
                      try {
                        const imgs = JSON.parse(r.images);
                        if (Array.isArray(imgs) && imgs.length > 0) {
                          return (
                            <div className="flex gap-2 mb-2">
                              {imgs.map((img: string, i: number) => (
                                <img key={i} src={img} alt="" className="w-12 h-12 rounded-lg object-cover border" />
                              ))}
                            </div>
                          );
                        }
                      } catch {} return null;
                    })()}

                    {r.adminNotes && (
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 mt-2">
                        <p className="text-[10px] font-black text-blue-500 uppercase mb-1">Admin Notes</p>
                        <p className="text-xs text-blue-700">{r.adminNotes}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 font-medium">
                      <span className="flex items-center gap-1"><Calendar size={10} />
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                      <span>User: {r.userId.slice(0, 8)}...</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {r.status === 'Requested' && (
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {actionLoading === r.id ? (
                        <Loader2 size={16} className="animate-spin text-accent" />
                      ) : (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(r.id, 'Approved')}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button
                            onClick={() => { setNotesModal(r); setAdminNote(''); }}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Add notes & respond"
                          >
                            <MessageSquare size={16} />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(r.id, 'Rejected')}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Notes Modal */}
      {notesModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-black text-primary mb-4">Respond to Request</h3>
            <div className="p-3 bg-gray-50 rounded-xl mb-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400">Reason: {notesModal.reason}</p>
              {notesModal.details && <p className="text-xs text-muted mt-1">{notesModal.details}</p>}
            </div>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 bg-gray-50 mb-4"
              placeholder="Add admin notes (visible to customer)..."
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setNotesModal(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-sm text-muted hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(notesModal.id, 'Approved', adminNote)}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 flex items-center justify-center gap-1"
              >
                <CheckCircle2 size={14} /> Approve
              </button>
              <button
                onClick={() => handleStatusUpdate(notesModal.id, 'Rejected', adminNote)}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 flex items-center justify-center gap-1"
              >
                <XCircle size={14} /> Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
