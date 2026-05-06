import React, { useEffect, useState } from 'react';
import {
  MessageSquare, Star, Loader2, CheckCircle2, Flag, Trash2,
  ShieldCheck, AlertCircle, Search,
  Image as ImageIcon, ExternalLink, ThumbsUp
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

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
  productName?: string;
  helpfulCount?: number;
}

const STATUS_FILTERS = ['All', 'approved', 'pending', 'flagged', 'rejected'];
const STATUS_COLORS: Record<string, string> = {
  approved: 'bg-green-50 text-green-600 border-green-100',
  pending: 'bg-amber-50 text-amber-600 border-amber-100',
  flagged: 'bg-red-50 text-red-600 border-red-100',
  rejected: 'bg-gray-100 text-gray-500 border-gray-200',
};

export const ReviewModeration: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState('');

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/v1/reviews');
      const data = await res.json();
      setReviews(data.items || []);
    } catch { 
      setReviews([]); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSetStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/v1/reviews/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setSuccess(`Review ${status}`);
      setTimeout(() => setSuccess(''), 2000);
      await fetchReviews();
    } catch {
      alert('Failed to update status');
    } finally { 
      setActionLoading(null); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this review?')) return;
    setActionLoading(id);
    try {
      await fetch(`/api/v1/reviews/${id}`, { method: 'DELETE' });
      await fetchReviews();
    } catch {
      alert('Failed to delete review');
    } finally { 
      setActionLoading(null); 
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesStatus = statusFilter === 'All' || (r.status || 'approved') === statusFilter;
    const matchesSearch = !query || 
      r.username.toLowerCase().includes(query.toLowerCase()) ||
      r.content?.toLowerCase().includes(query.toLowerCase()) ||
      r.title?.toLowerCase().includes(query.toLowerCase()) ||
      r.productName?.toLowerCase().includes(query.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <MessageSquare size={28} />
            </div>
            Review Moderation
          </h2>
          <p className="text-gray-400 font-bold text-sm mt-1">Manage and moderate customer feedback</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search reviews..."
              value={query}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams);
                if (e.target.value) newParams.set('q', e.target.value);
                else newParams.delete('q');
                setSearchParams(newParams);
              }}
              className="pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl font-bold text-sm outline-none transition-all w-64 md:w-80"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {STATUS_FILTERS.map((f) => {
          const count = f === 'All' ? reviews.length : reviews.filter(r => (r.status || 'approved') === f).length;
          return (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                statusFilter === f
                  ? 'bg-gray-900 text-white shadow-xl shadow-gray-200 translate-y-[-2px]'
                  : 'bg-white text-gray-400 border-2 border-gray-100 hover:border-gray-200'
              }`}
            >
              {f} <span className={`ml-2 opacity-50`}>{count}</span>
            </button>
          );
        })}
      </div>

      {success && (
        <div className="p-4 bg-green-50 text-green-600 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 border-2 border-green-100 animate-in slide-in-from-top-2">
          <CheckCircle2 size={18} /> {success}
        </div>
      )}

      {/* Review List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-48 w-full rounded-[2.5rem] skeleton" />)
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-900">No reviews found</h3>
            <p className="text-gray-400 font-bold mt-2">Try adjusting your filters or search query</p>
          </div>
        ) : (
          filteredReviews.map((review) => {
            const status = review.status || 'approved';
            let reviewImages: string[] = [];
            try { reviewImages = JSON.parse(review.images || '[]'); } catch { reviewImages = []; }

            return (
              <div key={review.id} className="bg-white rounded-[2.5rem] border-2 border-gray-100 overflow-hidden hover:border-primary/20 transition-all group">
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Header & Content */}
                    <div className="flex-grow space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black text-lg">
                            {review.username[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-gray-900">{review.username}</span>
                              {review.isVerified === 1 && (
                                <span className="flex items-center gap-1 text-[8px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                                  <ShieldCheck size={10} /> Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={12} className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-100'} />
                              ))}
                              <span className="text-[10px] font-black text-gray-400 ml-2 uppercase tracking-widest">
                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] border-2 ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-500'}`}>
                          {status}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {review.productName && (
                          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-lg w-fit">
                            <ImageIcon size={12} /> {review.productName}
                          </div>
                        )}
                        {review.title && <h4 className="text-lg font-black text-gray-900 leading-tight">{review.title}</h4>}
                        <p className="text-sm text-gray-500 font-medium leading-relaxed italic">"{review.content}"</p>
                      </div>

                      <div className="flex items-center gap-6 pt-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <ThumbsUp size={14} /> {review.helpfulCount || 0} Helpful
                        </div>
                      </div>
                    </div>

                    {/* Images & Actions */}
                    <div className="lg:w-72 shrink-0 space-y-6">
                      {/* Images Grid */}
                      {reviewImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                          {reviewImages.map((img, i) => (
                            <a key={i} href={img} target="_blank" rel="noreferrer" className="relative group/img aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm hover:border-primary/30 transition-all">
                              <img src={img} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                <ExternalLink size={20} className="text-white" />
                              </div>
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {actionLoading === review.id ? (
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 animate-pulse">
                            <Loader2 size={16} className="animate-spin" /> PROCESSING...
                          </div>
                        ) : (
                          <>
                            {status !== 'approved' && (
                              <button onClick={() => handleSetStatus(review.id, 'approved')} className="flex-1 bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20" title="Approve">
                                <CheckCircle2 size={18} className="mx-auto" />
                              </button>
                            )}
                            {status !== 'flagged' && (
                              <button onClick={() => handleSetStatus(review.id, 'flagged')} className="flex-1 bg-amber-500 text-white p-3 rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20" title="Flag">
                                <Flag size={18} className="mx-auto" />
                              </button>
                            )}
                            {status !== 'rejected' && (
                              <button onClick={() => handleSetStatus(review.id, 'rejected')} className="flex-1 bg-gray-400 text-white p-3 rounded-xl hover:bg-gray-500 transition-all shadow-lg shadow-gray-400/20" title="Reject">
                                <AlertCircle size={18} className="mx-auto" />
                              </button>
                            )}
                            <button onClick={() => handleDelete(review.id)} className="flex-1 bg-red-50 text-red-500 p-3 rounded-xl hover:bg-red-100 transition-all" title="Delete">
                              <Trash2 size={18} className="mx-auto" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
