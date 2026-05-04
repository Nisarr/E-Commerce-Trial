import React, { useEffect, useState } from 'react';
import {
  MessageSquare, Star, Loader2, CheckCircle2, Flag, Trash2,
  ShieldCheck, AlertCircle, Calendar, Filter
} from 'lucide-react';

interface ReviewRecord {
  id: string;
  productId: string;
  userId: string;
  username: string;
  rating: number;
  title?: string;
  content?: string;
  images?: string;
  isVerified?: number;
  status?: string;
  createdAt?: string;
}

const STATUS_FILTERS = ['All', 'approved', 'pending', 'flagged', 'rejected'];
const STATUS_COLORS: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  flagged: 'bg-red-100 text-red-700',
  rejected: 'bg-gray-200 text-gray-500',
};

export const ReviewModeration: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/v1/reviews');
      const data = await res.json();
      setReviews(data.items || []);
    } catch { setReviews([]); }
    finally { setLoading(false); }
  };

  const handleSetStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await fetch(`/api/v1/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setSuccess(`Review ${status}`);
      setTimeout(() => setSuccess(''), 2000);
      await fetchReviews();
    } catch {} finally { setActionLoading(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this review?')) return;
    setActionLoading(id);
    try {
      await fetch(`/api/v1/reviews/${id}`, { method: 'DELETE' });
      await fetchReviews();
    } catch {} finally { setActionLoading(null); }
  };

  const filteredReviews = reviews.filter((r) =>
    filter === 'All' || (r.status || 'approved') === filter
  );

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={12} fill={s <= rating ? '#f59e0b' : 'none'} color={s <= rating ? '#f59e0b' : '#d1d5db'} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-primary flex items-center gap-2">
            <MessageSquare size={24} /> Review Moderation
          </h2>
          <p className="text-muted font-medium text-sm">{reviews.length} total review{reviews.length !== 1 ? 's' : ''}</p>
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
            {f} {f !== 'All' && `(${reviews.filter(r => (r.status || 'approved') === f).length})`}
          </button>
        ))}
      </div>

      {success && <div className="p-3 bg-green-50 text-green-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-green-100"><CheckCircle2 size={14} /> {success}</div>}

      {/* Reviews */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-primary/5 border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>
        ) : filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <MessageSquare size={48} />
            <p className="mt-4 font-bold">No reviews {filter !== 'All' ? `with status "${filter}"` : 'found'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredReviews.map((review) => {
              const status = review.status || 'approved';
              return (
                <div key={review.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-accent font-black text-xs">{review.username[0]?.toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="font-bold text-primary text-sm">{review.username}</span>
                          {review.isVerified ? (
                            <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] font-black text-green-600"><ShieldCheck size={10} /> Verified</span>
                          ) : null}
                        </div>
                        {renderStars(review.rating)}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-500'}`}>
                          {status}
                        </span>
                      </div>
                      {review.title && <h4 className="font-bold text-primary text-sm mb-1">{review.title}</h4>}
                      {review.content && <p className="text-xs text-muted leading-relaxed">{review.content}</p>}
                      {review.images && (() => {
                        try {
                          const imgs = JSON.parse(review.images);
                          if (Array.isArray(imgs) && imgs.length > 0) {
                            return (
                              <div className="flex gap-2 mt-2">
                                {imgs.map((img: string, i: number) => (
                                  <img key={i} src={img} alt="" className="w-12 h-12 rounded-lg object-cover border" />
                                ))}
                              </div>
                            );
                          }
                        } catch {} return null;
                      })()}
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 font-medium">
                        <span className="flex items-center gap-1"><Calendar size={10} />
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                        <span>Product: {review.productId.slice(0, 8)}...</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {actionLoading === review.id ? (
                        <Loader2 size={16} className="animate-spin text-accent" />
                      ) : (
                        <>
                          {status !== 'approved' && (
                            <button onClick={() => handleSetStatus(review.id, 'approved')}
                              className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Approve">
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          {status !== 'flagged' && (
                            <button onClick={() => handleSetStatus(review.id, 'flagged')}
                              className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors" title="Flag">
                              <Flag size={14} />
                            </button>
                          )}
                          {status !== 'rejected' && (
                            <button onClick={() => handleSetStatus(review.id, 'rejected')}
                              className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors" title="Reject">
                              <AlertCircle size={14} />
                            </button>
                          )}
                          <button onClick={() => handleDelete(review.id)}
                            className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
