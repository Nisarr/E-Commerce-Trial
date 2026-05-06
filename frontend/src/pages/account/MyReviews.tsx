import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { deleteReview } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Star, Trash2, MessageSquare, Package,
  AlertCircle, CheckCircle2, ShieldCheck, Calendar
} from 'lucide-react';

export const MyReviews: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: userData, loading, fetchUserData } = useUserStore();
  const reviews = userData?.reviews?.items || [];
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchUserData(user.id, user.username);
    }
  }, [user, fetchUserData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review? This action cannot be undone.')) return;
    try {
      await deleteReview(id);
      if (user?.id) fetchUserData(user.id, user.username, true);
      setSuccess('Review deleted successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to delete review.');
    }
  };

  const renderStars = (rating: number) => (
    <div className="review-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={14} fill={s <= rating ? '#f59e0b' : 'none'} color={s <= rating ? '#f59e0b' : '#d1d5db'} />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="my-reviews">
        <div className="skeleton-dashboard-card shimmer-skeleton" style={{ height: '60px', borderRadius: '0.75rem', marginBottom: '1.25rem' }} />
        <div className="skeleton-dashboard-card shimmer-skeleton" style={{ height: '200px', borderRadius: '1.25rem' }} />
      </div>
    );
  }

  return (
    <div className="my-reviews">
      <div className="address-book-header">
        <div>
          <h2>My Reviews</h2>
          <p>{reviews.length} review{reviews.length !== 1 ? 's' : ''} written</p>
        </div>
      </div>

      {success && <div className="profile-alert profile-alert--success"><CheckCircle2 size={16} /> {success}</div>}
      {error && <div className="profile-alert profile-alert--error"><AlertCircle size={16} /> {error}</div>}

      {reviews.length === 0 ? (
        <div className="address-empty">
          <MessageSquare size={48} />
          <p>You haven't written any reviews yet.</p>
          <button onClick={() => navigate('/shop')} className="address-add-btn">
            <Package size={18} /> Browse Products
          </button>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-card-top">
                <div className="review-card-meta">
                  {renderStars(review.rating)}
                  {review.isVerified ? (
                    <span className="review-verified"><ShieldCheck size={12} /> Verified Purchase</span>
                  ) : null}
                </div>
                <div className="review-card-date">
                  <Calendar size={12} />
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  }) : 'N/A'}
                </div>
              </div>

              {review.title && <h4 className="review-card-title">{review.title}</h4>}
              {review.content && <p className="review-card-content">{review.content}</p>}

              {review.images && (() => {
                try {
                  const imgs = JSON.parse(review.images);
                  if (Array.isArray(imgs) && imgs.length > 0) {
                    return (
                      <div className="review-card-images">
                        {imgs.map((img: string, i: number) => (
                          <img key={i} src={img} alt={`Review image ${i + 1}`} />
                        ))}
                      </div>
                    );
                  }
                } catch { return null; }
                return null;
              })()}

              <div className="review-card-footer">
                <span className="review-card-product-id">Product: {review.productId.slice(0, 8)}...</span>
                <button onClick={() => handleDelete(review.id)} className="address-delete-btn">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
