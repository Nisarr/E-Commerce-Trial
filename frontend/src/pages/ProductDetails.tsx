import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ShoppingCart, Heart, RotateCcw, Star, 
  Check, ShieldCheck, Info, ArrowRight,
  Sparkles, Share2, Send, Link2
} from 'lucide-react';
import api from '../services/api';
import type { Product } from '../types';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useRecentlyViewedStore } from '../store/recentlyViewedStore';
import { useUIStore } from '../store/uiStore';
import { RecentlyViewed } from '../components/RecentlyViewed';

export const ProductDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addItem);
  const setActiveProductTitle = useUIStore((s) => s.setActiveProductTitle);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products?limit=100`);
        const p = res.data.items.find((item: Product) => item.slug === slug);
        if (p) setProduct(p);
      } catch (err) {
        console.error('Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?.id) return;
      setLoadingReviews(true);
      try {
        const res = await api.get(`/reviews?productId=${product.id}`);
        setReviews(res.data.items || []);
        setReviewStats(res.data.stats || null);
      } catch (err) {
        console.error('Failed to fetch reviews');
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [product?.id]);

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
      setActiveProductTitle(product.title);
    }
    return () => setActiveProductTitle(null);
  }, [product?.id, setActiveProductTitle]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-black text-primary uppercase tracking-[0.3em] animate-pulse">Loading Premium Experience</p>
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



  return (
    <div className="bg-white min-h-screen pb-20">
      <Helmet>
        <title>{product.title} | PlayPen House</title>
        <meta name="description" content={product.brand || 'Premium Baby PlayPen'} />
      </Helmet>

      <div className="container mx-auto px-4 lg:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Image Section - Sticky on Desktop */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-4">
              <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-white border border-gray-100 group">
                <img 
                  src={images[activeImage] || 'https://placehold.co/800x1000'} 
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                {discount > 0 && (
                  <div className="absolute top-6 left-6 glass px-5 py-2 rounded-full shadow-xl">
                    <span className="text-primary font-black text-xs uppercase tracking-widest">{discount}% OFF PREMIUM</span>
                  </div>
                )}
                <button 
                  onClick={() => toggleItem(product)}
                  className={`absolute top-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${isWishlisted ? 'bg-red-500 text-white scale-110' : 'bg-white/80 text-gray-400 hover:bg-white hover:text-red-500'}`}
                >
                  <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
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
              <div className="flex flex-wrap items-center gap-3">

                <div className="flex items-center gap-4 ml-auto">
                  <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                    <Check className="text-green-500" size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Quality</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                    <RotateCcw className="text-blue-500" size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Returns</span>
                  </div>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                {product.title}
              </h1>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={14} className={`${i <= Math.round(reviewStats?.averageRating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                  ))}
                  <span className="ml-1.5 text-sm font-black text-gray-900">{reviewStats?.averageRating ? Number(reviewStats.averageRating).toFixed(1) : '0.0'}</span>
                </div>
                <div className="h-3 w-px bg-gray-200" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{reviewStats?.totalReviews ?? 0} Reviews</span>
                <div className="h-3 w-px bg-gray-200" />
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${((product.stock || 0) - (product.soldCount || 0)) > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
                    {((product.stock || 0) - (product.soldCount || 0)) > 0 ? `${(product.stock || 0) - (product.soldCount || 0)} In Stock` : 'Out of Stock'}
                  </span>
                </div>
                <div className="h-3 w-px bg-gray-200" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.soldCount || 0} Sold</span>
              </div>
            </div>

            {/* Compact Pricing Area */}
            <div className="space-y-3">
              <div className="flex items-end justify-between">
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
              <div className="h-px bg-gray-100/60" />
            </div>



            {/* Optimized Action Row */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-gray-100/40 rounded-lg p-0.5 border border-gray-100">
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
                onClick={() => addItem(product)}
                className="flex-[1.2] h-9 bg-primary text-white rounded-lg font-black text-[8px] uppercase tracking-widest shadow-md shadow-primary/10 hover:bg-primary-dark transition-all flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap"
              >
                <ShoppingCart size={12} />
                Add to Cart
              </button>

              <button className="flex-1 h-9 bg-gray-900 text-white rounded-lg font-black text-[8px] uppercase tracking-widest hover:bg-black transition-all shadow-sm whitespace-nowrap">
                Buy Now
              </button>
            </div>

          </div>
        </div>

        {/* Detailed Tabs Section */}
        <div className="mt-20 space-y-8">
          <div className="flex justify-center gap-12 border-b border-gray-100">
            {[
              { id: 'description', label: 'Overview' },
              { id: 'specs', label: 'Specifications' },
              { id: 'reviews', label: `Client Reviews (${reviewStats?.totalReviews ?? 0})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-6 text-sm font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === tab.id ? 'text-primary' : 'text-gray-300 hover:text-gray-500'}`}
              >
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
              </button>
            ))}
          </div>

          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === 'description' && (
              <div className="space-y-8 text-center md:text-left">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">The Perfect Blend of Safety and Fun</h2>
                <p className="text-lg text-gray-500 leading-relaxed font-medium">
                  Experience peace of mind with our {product.title}. Designed with the modern parent in mind, 
                  this {product.brand || 'premium playpen'} offers a secure, spacious, and stylish environment 
                  for your baby to explore, play, and rest. Crafted from high-grade, non-toxic materials, 
                  it meets and exceeds all international safety standards.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em]">Premium Build</h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-bold italic">
                      "We use only the finest BPA-free plastics and eco-friendly woods to ensure a healthy environment for your little one."
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em]">Smart Design</h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-bold italic">
                      "Our modular panels allow for flexible configurations to fit any room size or shape, adapting as your baby grows."
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xl shadow-gray-100/50">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-gray-50">
                    {[
                      ['Material', 'BPA-Free High Density Plastic / Premium Wood'],
                      ['Certification', 'European Safety Standard EN71'],
                      ['Age Range', '6 Months - 3 Years'],
                      ['Assembly', 'Tool-less, 15 Minute Setup'],
                      ['Features', 'Strong Suction Cups, Secure Locking'],
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

            {activeTab === 'reviews' && (
              <div className="space-y-10">
                {loadingReviews ? (
                  <div className="py-20 flex justify-center">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="grid grid-cols-1 gap-8">
                    {/* Stats Header */}
                    {reviewStats && (
                      <div className="bg-white p-8 rounded-3xl border border-gray-100 flex flex-col md:flex-row items-center gap-10">
                        <div className="text-center md:border-r border-gray-100 md:pr-10">
                          <div className="text-5xl font-black text-gray-900 mb-2">{reviewStats.averageRating}</div>
                          <div className="flex items-center justify-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star key={i} size={16} className={`${i <= Math.round(reviewStats.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                            ))}
                          </div>
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{reviewStats.totalReviews} Reviews</div>
                        </div>
                        <div className="flex-grow space-y-2 w-full">
                          {reviewStats.distribution.slice().reverse().map((d: any) => (
                            <div key={d.stars} className="flex items-center gap-4">
                              <span className="text-[10px] font-black text-gray-400 w-4">{d.stars}</span>
                              <div className="flex-grow h-2 bg-gray-100">
                                <div className="h-full bg-amber-400" style={{ width: `${d.percentage}%` }} />
                              </div>
                              <span className="text-[10px] font-black text-gray-900 w-8">{d.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Review List */}
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="bg-white p-8 rounded-3xl border border-gray-100 space-y-4">
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
                                  {review.isVerified === 1 && (
                                    <span className="ml-2 flex items-center gap-1 text-[8px] font-black text-green-500 uppercase tracking-widest">
                                      <ShieldCheck size={10} /> Verified Purchase
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-[10px] font-bold text-gray-300 uppercase">
                              {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </div>
                          </div>
                          {review.title && <h4 className="font-black text-gray-900 text-base">{review.title}</h4>}
                          <p className="text-sm text-gray-500 leading-relaxed font-medium">{review.content}</p>
                          {(() => {
                            try {
                              const reviewImages = JSON.parse(review.images || '[]');
                              if (reviewImages && reviewImages.length > 0) {
                                return (
                                  <div className="flex flex-wrap gap-3 mt-4">
                                    {reviewImages.map((img: string, idx: number) => (
                                      <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <img src={img} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                      </div>
                                    ))}
                                  </div>
                                );
                              }
                            } catch (e) {
                              return null;
                            }
                            return null;
                          })()}
                        </div>
                      ))}
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

      {/* Recently Viewed */}
      <div className="mt-40">
        <RecentlyViewed />
      </div>
    </div>
  );
};
