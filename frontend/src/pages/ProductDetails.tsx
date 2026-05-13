import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { 
  ShoppingCart, Heart, Star, 
  Sparkles, Share2, Send, Link2,
  ChevronLeft, ChevronRight,
  Truck, ShieldCheck as Shield,
  Play, MessageSquare, 
  HelpCircle, Download,
  ThumbsUp, ChevronDown,
  Info, ArrowRight
} from 'lucide-react';
import { getProductReviews, markReviewHelpful, getProductDetailsBulk, logInteraction } from '../services/api';
import { ReviewModal } from '../components/product/ReviewModal';
import type { Product, Review, ReviewStats } from '../types';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useAuthStore } from '../store/authStore';
import { useRecentlyViewedStore } from '../store/recentlyViewedStore';
import { useUIStore } from '../store/uiStore';
import { RecentlyViewed } from '../components/RecentlyViewed';
import { CountdownTimer } from '../components/product/CountdownTimer';

export const ProductDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'helpful'>('latest');
  const [withPhotosOnly, setWithPhotosOnly] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewRestrictionReason, setReviewRestrictionReason] = useState("");
  
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addItem);
  const setActiveProductTitle = useUIStore((s) => s.setActiveProductTitle);

  const recentlyViewed = useRecentlyViewedStore((s) => s.items);

  useEffect(() => {
    const fetchBulkData = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const historyIds = recentlyViewed.slice(0, 10).map(i => i.id);
        const currentUserId = useAuthStore.getState().user?.id;
        const data = await getProductDetailsBulk(slug, historyIds, currentUserId);
        
        if (data) {
          setProduct(data.product);
          setRelatedProducts(data.relatedProducts);
          setReviews(data.reviews.items);
          setReviewStats(data.reviews.stats);
          setCanReview((data as any).canReview);
          setReviewRestrictionReason((data as any).reviewRestrictionReason);
        }
      } catch {
        console.error('Failed to fetch product data');
      } finally {
        setLoading(false);
      }
    };
    fetchBulkData();
  }, [slug]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?.id) return;
      if (sortBy === 'latest' && !withPhotosOnly) return;

      setLoadingReviews(true);
      try {
        const data = await getProductReviews(product.id, sortBy, withPhotosOnly);
        setReviews(data.items || []);
        setReviewStats(data.stats || null);
      } catch {
        console.error('Failed to fetch reviews');
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [product?.id, sortBy, withPhotosOnly]);

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
      setActiveProductTitle(product.title);
    }
    return () => setActiveProductTitle(null);
  }, [product, addRecentlyViewed, setActiveProductTitle]);

  if (loading) return (
    <div className="bg-white min-h-screen pb-20 animate-in fade-in duration-500">
      <div className="container mx-auto px-4 lg:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="aspect-square rounded-[2rem] skeleton" />
            <div className="flex gap-3 mt-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="w-16 h-16 rounded-xl skeleton" />)}
            </div>
          </div>
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4">
              <div className="h-4 w-32 rounded skeleton" />
              <div className="h-10 w-3/4 rounded-xl skeleton" />
              <div className="h-4 w-1/2 rounded skeleton" />
            </div>
            <div className="h-12 w-48 rounded-xl skeleton" />
            <div className="h-24 w-full rounded-[2rem] skeleton" />
            <div className="flex gap-4">
              <div className="h-12 w-32 rounded-xl skeleton" />
              <div className="h-12 flex-grow rounded-xl skeleton" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-6">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Info size={48} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Product Not Found</h1>
        <p className="text-gray-500 font-medium">The product you are looking for might have been moved or deleted.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-dark transition-all">
          Back to Shop <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );

  const images = JSON.parse(product.images || '[]');
  const isWishlisted = isInWishlist(product.id);
  const discount = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const nextImage = () => {
    if (images.length <= 1) return;
    setActiveImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length <= 1) return;
    setActiveImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="bg-white min-h-screen pb-32 md:pb-20">
      <Helmet>
        <title>{product.title} | PlayPen House</title>
        <meta name="description" content={product.brand || 'Premium Baby PlayPen'} />
      </Helmet>

      <div className="container mx-auto px-4 lg:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Image Section */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-4">
              <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-white border border-gray-100 group">
                <img 
                  src={images[activeImage] || 'https://placehold.co/800x1000'} 
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md text-gray-900 flex items-center justify-center shadow-lg transition-all hover:bg-white hover:scale-110 active:scale-95 z-10 opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 max-md:opacity-100"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md text-gray-900 flex items-center justify-center shadow-lg transition-all hover:bg-white hover:scale-110 active:scale-95 z-10 opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 max-md:opacity-100"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {images.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:hidden z-10">
                    {images.map((_: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${activeImage === i ? 'bg-primary w-6' : 'bg-gray-300/50 hover:bg-gray-300'}`}
                      />
                    ))}
                  </div>
                )}

                {discount > 0 && (
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 glass px-3 py-1.5 md:px-5 md:py-2 rounded-full shadow-xl z-10">
                    <span className="text-primary font-black text-[9px] md:text-xs uppercase tracking-widest">{discount}% OFF PREMIUM</span>
                  </div>
                )}
                <button 
                  onClick={() => {
                  toggleItem(product);
                }}
                  className={`absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl z-10 ${isWishlisted ? 'bg-red-500 text-white scale-110' : 'bg-white/80 text-gray-400 hover:bg-white hover:text-red-500'}`}
                >
                  <Heart size={20} className="md:w-6 md:h-6" fill={isWishlisted ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="hidden md:flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-1">
                {images.map((img: string, i: number) => (
                  <button 
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 relative group ${activeImage === i ? 'border-primary shadow-md shadow-primary/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {activeImage === i && <div className="absolute inset-0 bg-primary/10" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                {product.title}
              </h1>
              <div className="pt-2" />

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${((product.stock || 0) - (product.soldCount || 0)) > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
                    {((product.stock || 0) - (product.soldCount || 0)) > 0 ? `${(product.stock || 0) - (product.soldCount || 0)} In Stock` : 'Out of Stock'}
                  </span>
                </div>
                <div className="h-3 w-px bg-gray-200" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.soldCount || 0} Sold</span>
              </div>

              <div className="flex flex-wrap gap-3">
                {product.deliveryInfo && (
                  <div className="flex items-center gap-2 bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-2">
                    <Truck size={14} className="text-blue-600" />
                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">{product.deliveryInfo}</span>
                  </div>
                )}
                {product.warrantyInfo && (
                  <div className="flex items-center gap-2 bg-green-50/50 border border-green-100 rounded-xl px-4 py-2">
                    <Shield size={14} className="text-green-600" />
                    <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">{product.warrantyInfo}</span>
                  </div>
                )}
              </div>

              {product.offerDeadline && (
                <div className="max-w-sm pt-2">
                  <CountdownTimer deadline={product.offerDeadline} />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex items-baseline gap-2">
                  {product.salePrice ? (
                    <>
                      <span className="text-3xl font-black text-primary tracking-tighter">৳{product.salePrice.toLocaleString()}</span>
                      <span className="text-lg text-gray-300 line-through font-bold">৳{product.price.toLocaleString()}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-black text-gray-900 tracking-tighter">৳{product.price.toLocaleString()}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-gray-400 pb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest mr-1">Share:</span>
                  <button className="hover:text-primary transition-colors"><Share2 size={16} /></button>
                  <button className="hover:text-primary transition-colors"><Send size={16} /></button>
                  <button className="hover:text-primary transition-colors"><Link2 size={16} /></button>
                </div>
              </div>

              {product.trustBadges && (
                <div className="flex flex-wrap gap-4 py-2">
                  {(() => {
                    try {
                      const badges = JSON.parse(product.trustBadges);
                      return badges.map((badge: any, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title={badge.label}>
                          <Shield size={14} className="text-accent" />
                          <span className="text-[8px] font-black text-gray-900 uppercase tracking-[0.15em]">{badge.label}</span>
                        </div>
                      ));
                    } catch { return null; }
                  })()}
                </div>
              )}
              <div className="h-px bg-gray-100/60" />
            </div>

            <div className="grid grid-cols-2 md:flex md:items-center gap-2">
              <div className="flex items-center bg-gray-100/40 rounded-lg p-0.5 border border-gray-100 h-10">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-7 h-7 flex items-center justify-center font-black text-gray-400 hover:text-primary transition-colors"
                >
                  -
                </button>
                <span className="w-5 text-center font-black text-primary text-[10px]">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-7 h-7 flex items-center justify-center font-black text-gray-400 hover:text-primary transition-colors"
                >
                  +
                </button>
              </div>
              
              <button 
                onClick={() => {
                  addItem(product);
                  toast.success('Added to cart successfully!');
                  logInteraction(product.id, 'add_to_cart', useAuthStore.getState().user?.id);
                }}
                className="h-10 bg-primary text-white rounded-lg font-black text-[10px] md:text-[8px] uppercase tracking-widest shadow-md shadow-primary/10 hover:bg-primary-dark transition-all flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap px-4"
              >
                <ShoppingCart size={14} />
                Add to Cart
              </button>
 
              <button 
                onClick={() => {
                  addItem(product);
                  logInteraction(product.id, 'purchase_intent', useAuthStore.getState().user?.id);
                  navigate('/cart');
                }}
                className="col-span-2 md:flex-1 h-10 bg-gray-900 text-white rounded-lg font-black text-[10px] md:text-[8px] uppercase tracking-widest hover:bg-black transition-all shadow-sm whitespace-nowrap"
              >
                Buy Now
              </button>
            </div>

            {reviewStats && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="md:col-span-7 bg-white p-6 rounded-3xl border-2 border-gray-100 flex items-center gap-8 shadow-sm">
                  <div className="text-center border-r border-gray-100 pr-8">
                    <div className="text-4xl font-black text-gray-900 mb-1">{reviewStats.averageRating}</div>
                    <div className="flex items-center justify-center gap-0.5 mb-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} size={12} className={`${i <= Math.round(reviewStats.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{reviewStats.totalReviews} Reviews</div>
                  </div>
                  <div className="flex-grow space-y-1.5">
                    {reviewStats.distribution.slice().reverse().map((d) => (
                      <div key={d.stars} className="flex items-center gap-3">
                        <span className="text-[8px] font-black text-gray-400 w-2">{d.stars}</span>
                        <div className="flex-grow h-1.5 bg-gray-50 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400" style={{ width: `${d.percentage}%` }} />
                        </div>
                        <span className="text-[8px] font-black text-gray-900 w-6">{d.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-5 bg-primary rounded-3xl p-6 text-white relative overflow-hidden shadow-md shadow-primary/20 group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000" />
                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-400" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80">AI Insight</span>
                    </div>
                    <p className="text-[11px] font-bold leading-relaxed opacity-90 italic line-clamp-3">
                      "{Math.round(reviewStats.averageRating * 20)}% of customers highly recommend this for its quality."
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-20 space-y-8">
          <div className="flex justify-center gap-4 md:gap-12 border-b border-gray-100 overflow-x-auto scrollbar-hide">
            {[
              { id: 'description', label: 'Overview' },
              { id: 'specs', label: 'Specifications' },
              { id: 'reviews', label: `Client Reviews (${reviewStats?.totalReviews ?? 0})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'description' | 'specs' | 'reviews')}
                className={`pb-6 text-[10px] md:text-sm font-black uppercase tracking-[0.1em] md:tracking-[0.3em] transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-primary' : 'text-gray-300 hover:text-gray-500'}`}
              >
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
              </button>
            ))}
          </div>

          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === 'description' && (
              <div className="bg-white rounded-[2.5rem] border-2 border-gray-200/60 p-8 md:p-12 shadow-xl shadow-gray-100/50 animate-in fade-in zoom-in-95 duration-500">
                <div className="space-y-8 text-center md:text-left">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">The Perfect Blend of Safety and Fun</h2>
                  <div className="text-lg text-gray-500 leading-relaxed font-medium whitespace-pre-wrap">
                    {product.overview || `Experience peace of mind with our ${product.title}. Designed with the modern parent in mind, this ${product.brand || 'premium playpen'} offers a secure, spacious, and stylish environment for your baby to explore, play, and rest.`}
                  </div>

                  {product.highlights && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                      {(() => {
                        try {
                          const highlights = JSON.parse(product.highlights);
                          return highlights.map((h: any, i: number) => (
                            <div key={i} className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 text-center hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
                              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                                <Sparkles size={20} />
                              </div>
                              <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2">{h.title}</h3>
                              <p className="text-[9px] text-gray-500 font-bold leading-tight">{h.description}</p>
                            </div>
                          ));
                        } catch { return null; }
                      })()}
                    </div>
                  )}

                  {product.howItWorks && (
                    <div className="pt-10 space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="h-px bg-gray-100 flex-grow" />
                        <h3 className="text-xs font-black text-gray-300 uppercase tracking-[0.3em] whitespace-nowrap">How it Works</h3>
                        <div className="h-px bg-gray-100 flex-grow" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {(() => {
                          try {
                            const steps = JSON.parse(product.howItWorks);
                            return steps.map((step: any, i: number) => (
                              <div key={i} className="relative group">
                                {i < steps.length - 1 && (
                                  <div className="hidden md:block absolute top-6 left-full w-full h-px border-t-2 border-dashed border-gray-100 -ml-4 z-0" />
                                )}
                                <div className="relative z-10 space-y-4 text-center">
                                  <div className="w-12 h-12 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center text-primary font-black mx-auto group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                    {i + 1}
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1">{step.title}</h4>
                                    <p className="text-[10px] text-gray-500 font-bold leading-relaxed px-4">{step.description}</p>
                                  </div>
                                </div>
                              </div>
                            ));
                          } catch { return null; }
                        })()}
                      </div>
                    </div>
                  )}

                  {product.videoUrl && (
                    <div className="pt-10">
                      <div className="aspect-video bg-gray-900 rounded-[2.5rem] overflow-hidden relative group cursor-pointer shadow-2xl">
                        <img 
                          src={`https://img.youtube.com/vi/${product.videoUrl.split('v=')[1]?.split('&')[0] || product.videoUrl.split('/').pop()}/maxresdefault.jpg`} 
                          alt="Product Video Thumbnail"
                          className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary shadow-2xl group-hover:scale-110 transition-transform">
                            <Play size={32} fill="currentColor" className="ml-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'specs' && (
              <div className="space-y-8">
                {product.specification ? (
                  <div className="bg-white rounded-[2.5rem] border-2 border-gray-200/60 p-8 md:p-12 shadow-xl shadow-gray-100/50">
                    <div className="text-sm text-gray-600 leading-relaxed font-bold whitespace-pre-wrap">
                      {product.specification}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-[2.5rem] border-2 border-gray-200/60 overflow-hidden shadow-xl shadow-gray-100/50">
                    <table className="w-full text-left">
                      <tbody className="divide-y-2 divide-gray-100">
                        {[
                          ['Material', 'BPA-Free High Density Plastic'],
                          ['Age Range', '6 Months - 3 Years'],
                          ['Assembly', 'Tool-less Setup'],
                          ['Warranty', '1 Year Full Replacement']
                        ].map(([label, value], i) => (
                          <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-8 py-6 text-xs font-black text-primary uppercase tracking-widest w-1/3">{label}</td>
                            <td className="px-8 py-6 text-sm font-bold text-gray-600">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {product.specSheetUrl && (
                  <div className="pt-4 flex justify-end">
                    <a 
                      href={product.specSheetUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-6 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-[10px] font-black text-gray-900 uppercase tracking-widest hover:border-primary hover:text-primary transition-all group"
                    >
                      <Download size={16} className="group-hover:-translate-y-1 transition-transform" />
                      Download Technical Data Sheet (PDF)
                    </a>
                  </div>
                )}

                {product.comparisonData && (
                  <div className="bg-white rounded-[2.5rem] border-2 border-gray-200/60 overflow-hidden shadow-xl shadow-gray-100/50 mt-10">
                    {(() => {
                      try {
                        const comp = JSON.parse(product.comparisonData);
                        return (
                          <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b-2 border-gray-100">
                              <tr>
                                {comp.headers.map((h: string, i: number) => (
                                  <th key={i} className="px-8 py-6 text-xs font-black text-primary uppercase tracking-widest">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-gray-100">
                              {comp.rows.map((row: string[], i: number) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                  {row.map((cell: string, j: number) => (
                                    <td key={j} className={`px-8 py-6 text-sm font-bold ${j === 0 ? 'text-primary' : 'text-gray-600'}`}>{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        );
                      } catch { return null; }
                    })()}
                  </div>
                )}

                {product.faqs && (
                  <div className="space-y-4 mt-10">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3 ml-2">
                      <HelpCircle size={24} className="text-primary" /> Frequently Asked Questions
                    </h3>
                    <div className="space-y-3">
                      {(() => {
                        try {
                          const faqs = JSON.parse(product.faqs);
                          return faqs.map((faq: any, i: number) => (
                            <div key={i} className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden transition-all duration-500">
                              <button 
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full px-8 py-6 flex items-center justify-between text-left group"
                              >
                                <span className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors">{faq.question}</span>
                                <ChevronDown size={20} className={`text-muted/40 transition-transform duration-500 ${openFaq === i ? 'rotate-180 text-primary' : ''}`} />
                              </button>
                              <div className={`px-8 transition-all duration-500 ease-in-out ${openFaq === i ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">{faq.answer}</p>
                              </div>
                            </div>
                          ));
                        } catch { return null; }
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-10">
                {loadingReviews ? (
                  <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 flex gap-10 h-40 skeleton" />
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 h-48 skeleton" />
                    ))}
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="grid grid-cols-1 gap-8">
                    <div className="flex items-center justify-between py-2 ml-2">
                      <div className="flex items-center gap-6">
                        <button 
                          onClick={() => setSortBy('latest')}
                          className={`text-[10px] font-black transition-all pb-1 tracking-widest ${sortBy === 'latest' ? 'text-primary border-b-2 border-primary' : 'text-gray-300 hover:text-gray-500'}`}
                        >
                          LATEST
                        </button>
                        <button 
                          onClick={() => setSortBy('helpful')}
                          className={`text-[10px] font-black transition-all pb-1 tracking-widest ${sortBy === 'helpful' ? 'text-primary border-b-2 border-primary' : 'text-gray-300 hover:text-gray-500'}`}
                        >
                          MOST HELPFUL
                        </button>
                        <button 
                          onClick={() => setWithPhotosOnly(!withPhotosOnly)}
                          className={`text-[10px] font-black transition-all pb-1 tracking-widest ${withPhotosOnly ? 'text-primary border-b-2 border-primary' : 'text-gray-300 hover:text-gray-500'}`}
                        >
                          WITH PHOTOS
                        </button>
                      </div>
                      
                      {canReview ? (
                        <button 
                          onClick={() => setShowReviewModal(true)}
                          className="bg-primary text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-dark hover:-translate-y-0.5 transition-all shadow-md shadow-primary/20"
                        >
                          Write a Review
                        </button>
                      ) : (
                        <div className="group relative">
                          <button 
                            disabled
                            className="bg-gray-100 text-gray-400 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed opacity-60 flex items-center gap-2 border border-gray-200"
                          >
                            <Shield size={12} />
                            Review Locked
                          </button>
                          {reviewRestrictionReason && (
                            <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-gray-900 text-white text-[10px] font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                              <div className="relative">
                                {reviewRestrictionReason}
                                <div className="absolute top-full right-6 w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      {reviews.map((review) => {
                        const reviewImages = JSON.parse(review.images || '[]');
                        return (
                          <div key={review.id} className="bg-white p-8 rounded-[2rem] border-2 border-gray-200/60 shadow-sm hover:shadow-md transition-shadow group/card">
                            <div className="flex gap-8 items-start">
                              <div className="flex-grow space-y-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-sm uppercase">
                                      {review.username[0]}
                                    </div>
                                    <div>
                                      <div className="text-sm font-black text-gray-900">{review.username}</div>
                                      <div className="flex items-center gap-1 mt-0.5">
                                        {[1, 2, 3, 4, 5].map(i => (
                                          <Star key={i} size={10} className={`${i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                        ))}
                                        <span className="text-[9px] font-black text-gray-900 ml-1.5">{Number(review.rating).toFixed(1)}</span>
                                        {review.isVerified === 1 && (
                                          <span className="ml-3 flex items-center gap-1 text-[8px] font-black text-green-500 uppercase tracking-widest">
                                            <Shield size={10} /> Verified Purchase
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                    {new Date(review.createdAt || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </div>
                                </div>

                                {review.title && <h4 className="font-black text-gray-900 text-base">{review.title}</h4>}
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">{review.content}</p>
                                
                                <div className="flex items-center justify-between pt-4">
                                  <button 
                                    onClick={async () => {
                                      try {
                                        await markReviewHelpful(review.id);
                                        setReviews(prev => prev.map(r => r.id === review.id ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r));
                                      } catch (e) { console.error(e); }
                                    }}
                                    className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-primary transition-colors group"
                                  >
                                    <ThumbsUp size={14} className="group-hover:-translate-y-0.5 transition-transform" />
                                    HELPFUL ({review.helpfulCount || 0})
                                  </button>
                                  <button className="text-[10px] font-black text-gray-300 hover:text-gray-500 uppercase tracking-widest">Report</button>
                                </div>
                              </div>

                              <div className="hidden md:flex gap-2 shrink-0 flex-row-reverse">
                                {[...Array(4)].map((_, idx) => {
                                  const img = reviewImages[idx];
                                  if (!img) return null;
                                  return (
                                    <div key={idx} className="w-20 h-28 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-500">
                                      <img src={img} alt="" className="w-full h-full object-cover" />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            
                            {reviewImages.length > 0 && (
                              <div className="flex md:hidden gap-3 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                                {reviewImages.map((img: string, idx: number) => (
                                  <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Sparkles size={24} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">No Reviews Yet</h3>
                    <p className="text-gray-400 font-medium max-w-xs mx-auto mt-2">
                      Be the first to share your experience with this premium product.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-40 container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-12">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">You Might Also Like</h2>
                <div className="h-1 w-12 bg-primary rounded-full" />
              </div>
              <Link to="/shop" className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-3 transition-all">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.length > 0 ? (
                relatedProducts.map((p) => {
                  const pImages = JSON.parse(p.images || '[]');
                  return (
                    <Link key={p.id} to={`/product/${p.slug}`} className="group space-y-4">
                      <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-50 relative border border-gray-100">
                        <img 
                          src={pImages[0] || 'https://placehold.co/400x500'} 
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                      </div>
                      <div className="space-y-1 px-2">
                        <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest line-clamp-1 group-hover:text-primary transition-colors">{p.title}</h3>
                        <p className="text-xs font-black text-primary tracking-tight">৳{p.price.toLocaleString()}</p>
                      </div>
                    </Link>
                  );
                })
              ) : (
                [1,2,3,4].map(i => <div key={i} className="aspect-[4/5] rounded-[2rem] skeleton" />)
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-orange-50 rounded-[2.5rem] p-8 border-2 border-orange-100 space-y-8 relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-orange-200/50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Bundle Offer</h2>
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Save 15% Today</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                      <img src={images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest line-clamp-1">{product.title}</h4>
                      <p className="text-xs font-black text-primary">৳{product.salePrice || product.price}</p>
                    </div>
                  </div>
                </div>

                <button className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black hover:-translate-y-1 transition-all active:translate-y-0">
                  Add Bundle to Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Q&A Section */}
        <div className="mt-32 max-w-4xl">
          <div className="space-y-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                <MessageSquare size={32} className="text-primary" /> Questions & Answers
              </h2>
            </div>

            <div className="space-y-6 ml-12">
              {product.qna ? (
                (() => {
                  try {
                    const qna = JSON.parse(product.qna);
                    return qna.map((q: any, i: number) => (
                      <div key={i} className="space-y-4">
                        <div className="flex gap-4">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-primary font-black shrink-0">Q</div>
                          <p className="text-sm font-black text-gray-900">{q.question}</p>
                        </div>
                        <div className="flex gap-4 ml-4">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-black shrink-0">A</div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-500 font-medium">{q.answer}</p>
                          </div>
                        </div>
                        {i < qna.length - 1 && <div className="h-px bg-gray-100 w-full" />}
                      </div>
                    ));
                  } catch { return null; }
                })()
              ) : (
                <div className="bg-gray-50 rounded-3xl p-8 text-center border-2 border-dashed border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">No questions asked yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-40">
        <RecentlyViewed />
      </div>

      {showReviewModal && product && (
        <ReviewModal 
          productId={product.id}
          productTitle={product.title}
          userId={useAuthStore.getState().user?.id || ''}
          username={useAuthStore.getState().user?.username || ''}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setSortBy('latest');
          }}
        />
      )}
    </div>
  );
};
