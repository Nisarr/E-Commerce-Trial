
import React, { useState } from 'react';
import { X, Star, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { submitReview } from '../../services/api';
import { uploadImage } from '../../services/imgbb';

interface ReviewModalProps {
  productId: string;
  productTitle: string;
  userId: string;
  username: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ 
  productId, productTitle, userId, username, onClose, onSuccess 
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (images.length + files.length > 4) {
      setError('Maximum 4 images allowed');
      return;
    }

    setUploading(true);
    setError('');
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        return await uploadImage(file);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (err) {
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) {
      setError('Please share your experience');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await submitReview({
        productId,
        userId,
        username,
        rating,
        title,
        content,
        images
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-12 text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Review Submitted!</h2>
          <p className="text-gray-500 font-medium leading-relaxed">
            Thank you for your feedback. Your review is currently awaiting moderation and will be visible shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="relative p-8 md:p-12">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100 hover:text-gray-900 transition-all"
          >
            <X size={20} />
          </button>

          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Share Your Experience</span>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">{productTitle}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rate your experience</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="transition-transform active:scale-90"
                    >
                      <Star 
                        size={32} 
                        className={`${(hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-100'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Content */}
              <div className="space-y-4">
                <input 
                  type="text"
                  placeholder="Review Title (Optional)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl font-bold text-sm outline-none transition-all"
                />
                <textarea 
                  placeholder="Describe your experience with the product..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl font-bold text-sm outline-none transition-all resize-none"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add Photos (Max 4)</label>
                <div className="flex gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                      <img src={img} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {images.length < 4 && (
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 hover:border-primary hover:text-primary cursor-pointer transition-all">
                      {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>

              {error && <p className="text-xs font-bold text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}

              <button 
                type="submit"
                disabled={submitting || uploading}
                className="w-full py-5 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-primary-dark hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
              >
                {submitting ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
