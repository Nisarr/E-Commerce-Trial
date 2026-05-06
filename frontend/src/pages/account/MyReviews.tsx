import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { deleteReview } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Star, Trash2, MessageSquare, Package,
  AlertCircle, CheckCircle2, ShieldCheck, Calendar,
  ShoppingBag, Sparkles, ThumbsUp, ChevronRight
} from 'lucide-react';
import { ReviewModal } from '../../components/product/ReviewModal';

export const MyReviews: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: userData, loading, fetchUserData } = useUserStore();
  const reviews = userData?.reviews?.items || [];
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{id: string, title: string, orderId: string} | null>(null);

  // Identify products eligible for review
  const deliveredItems = (userData?.orders?.items || []).filter(order => order.status === 'delivered')
    .flatMap(order => (order.items || []).map(item => ({
      ...item,
      orderId: order.id,
      orderDate: order.createdAt
    })));

  // Remove products already reviewed
  const toReview = deliveredItems.filter(item => 
    !reviews.some(r => r.productId === item.productId)
  );

  // Remove duplicates (same product in different orders)
  const uniqueToReview = Array.from(new Map(toReview.map(item => [item.productId, item])).values());

  useEffect(() => {
    if (user?.id) {
      fetchUserData(user.id, user.username, user.email);
    }
  }, [user, fetchUserData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review? This action cannot be undone.')) return;
    try {
      await deleteReview(id);
      if (user?.id) fetchUserData(user.id, user.username, user.email, true);
      setSuccess('Review deleted successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to delete review.');
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  };

  const totalHelpful = reviews.reduce((acc, r) => acc + (r.helpfulCount || 0), 0);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-32 bg-gray-100 rounded-[2rem]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-gray-50 rounded-3xl" />
          <div className="h-40 bg-gray-50 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-10">
      {/* Header & Stats */}
      <div className="relative overflow-hidden bg-white rounded-[2.5rem] p-8 md:p-10 border-2 border-gray-100 shadow-sm group">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <MessageSquare size={24} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">My Feedback</h2>
            </div>
            <p className="text-gray-400 font-medium ml-1">Your contribution helps the community grow.</p>
          </div>

          <div className="flex items-center gap-6 md:gap-10">
            <div className="text-center">
              <div className="text-2xl font-black text-gray-900">{reviews.length}</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reviews</div>
            </div>
            <div className="w-px h-10 bg-gray-100" />
            <div className="text-center">
              <div className="text-2xl font-black text-primary flex items-center justify-center gap-1">
                {calculateAverageRating()} <Star size={16} className="fill-primary" />
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Rating</div>
            </div>
            <div className="w-px h-10 bg-gray-100" />
            <div className="text-center">
              <div className="text-2xl font-black text-gray-900">{totalHelpful}</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Helpful</div>
            </div>
          </div>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-green-50 border-2 border-green-100 p-4 rounded-2xl text-green-700 font-bold text-sm animate-in slide-in-from-top-4">
          <CheckCircle2 size={18} /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border-2 border-red-100 p-4 rounded-2xl text-red-700 font-bold text-sm animate-in slide-in-from-top-4">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Ready to Review Section */}
      {uniqueToReview.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-3">
              <ShoppingBag size={18} className="text-primary" /> Ready to Review
            </h3>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              {uniqueToReview.length} Pending
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {uniqueToReview.map((item) => (
              <div key={item.productId} className="bg-white p-6 rounded-[2rem] border-2 border-gray-100 flex items-center gap-6 group hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 group-hover:scale-105 transition-transform duration-500">
                  <img src={item.productImage || 'https://placehold.co/200x200'} alt={item.productName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow min-w-0 space-y-1">
                  <h4 className="text-sm font-black text-gray-900 truncate group-hover:text-primary transition-colors">{item.productName}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    <Calendar size={12} />
                    Delivered {new Date(item.orderDate || '').toLocaleDateString()}
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedProduct({ 
                        id: item.productId, 
                        title: item.productName || 'Product',
                        orderId: item.orderId
                      });
                      setShowReviewModal(true);
                    }}
                    className="mt-2 flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:gap-3 transition-all"
                  >
                    Post Review <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Reviews List */}
      <div className="space-y-6">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] px-2 flex items-center gap-3">
          <Sparkles size={18} className="text-amber-500" /> My Published Reviews
        </h3>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 p-20 text-center space-y-6">
            <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto">
              <MessageSquare size={32} />
            </div>
            <div className="space-y-2">
              <p className="text-gray-400 font-medium">You haven't shared any experiences yet.</p>
              {uniqueToReview.length === 0 && (
                <button 
                  onClick={() => navigate('/shop')} 
                  className="inline-flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest hover:gap-3 transition-all"
                >
                  <Package size={16} /> Browse Products to Review
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {reviews.map((review) => {
              const reviewImages = JSON.parse(review.images || '[]');
              return (
                <div key={review.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-sm hover:shadow-md transition-all duration-500 group">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-grow space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={14} className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-100'} />
                            ))}
                            {review.isVerified && (
                              <div className="ml-3 flex items-center gap-1.5 text-[9px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                <ShieldCheck size={12} /> Verified
                              </div>
                            )}
                          </div>
                          <h4 className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors">{review.title || 'Review for ' + (review.productName || 'Product')}</h4>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={12} />
                            {new Date(review.createdAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                            review.status === 'approved' ? 'bg-green-50 text-green-600' : 
                            review.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {review.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 leading-relaxed font-medium">
                        {review.content}
                      </p>

                      {reviewImages.length > 0 && (
                        <div className="flex gap-3 pt-2">
                          {reviewImages.map((img: string, i: number) => (
                            <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:scale-110 transition-transform cursor-pointer">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-4 flex items-center justify-between border-t border-gray-50">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <ThumbsUp size={14} /> {review.helpfulCount || 0} Helpful
                          </div>
                          <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                            Product ID: {review.productId.slice(0, 8)}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDelete(review.id)}
                          className="flex items-center gap-2 text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showReviewModal && selectedProduct && user?.id && (
        <ReviewModal 
          productId={selectedProduct.id}
          productTitle={selectedProduct.title}
          userId={user.id}
          username={user.username}
          orderId={selectedProduct.orderId}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setShowReviewModal(false);
            if (user?.id) fetchUserData(user.id, user.username, user.email, true);
            setSuccess('Review submitted! It will appear once approved by our team.');
            setTimeout(() => setSuccess(''), 5000);
          }}
        />
      )}
    </div>
  );
};
