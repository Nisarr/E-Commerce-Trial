import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ShoppingCart, Heart, RotateCcw, Star, 
  Check, ShieldCheck, Zap, Info, ArrowRight,
  Package, Award, Sparkles, Share2, Send, Link2
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
  const [loading, setLoading] = useState(true);
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
        const res = await api.get('/products');
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

  const features = [
    { icon: <ShieldCheck size={20} />, title: 'Safety First', desc: 'EN71 Certified materials' },
    { icon: <Zap size={20} />, title: 'Quick Setup', desc: 'Easy assembly in minutes' },
    { icon: <Package size={20} />, title: 'Free Delivery', desc: 'On all orders over ৳5000' },
    { icon: <Award size={20} />, title: '1 Year Warranty', desc: 'Guaranteed quality support' }
  ];

  return (
    <div className="bg-[#fafafa] min-h-screen pb-20">
      <Helmet>
        <title>{product.title} | PlayPen House</title>
        <meta name="description" content={product.brand || 'Premium Baby PlayPen'} />
      </Helmet>

      <div className="container mx-auto px-4 lg:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Image Section - Sticky on Desktop */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-4">
              <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-white shadow-lg shadow-gray-200/40 group">
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
                <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Available Now
                </div>
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
                    <Star key={i} size={14} className={`${i <= (product.rating || 5.0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                  ))}
                  <span className="ml-1.5 text-sm font-black text-gray-900">{product.rating ? Number(product.rating).toFixed(1) : '5.0'}</span>
                </div>
                <div className="h-3 w-px bg-gray-200" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">248 Reviews</span>
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

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-2">
              {features.map((f, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-gray-50/50 border border-transparent flex items-center gap-2.5 hover:bg-white hover:border-gray-100 hover:shadow-sm transition-all group">
                  <div className="w-7 h-7 rounded-lg bg-primary/5 text-primary flex items-center justify-center flex-shrink-0">
                    {React.cloneElement(f.icon as any, { size: 14 })}
                  </div>
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-800">{f.title}</h4>
                </div>
              ))}
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
              { id: 'reviews', label: 'Client Reviews' }
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
              <div className="space-y-8 text-center py-10">
                <div className="w-20 h-20 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Real Feedback from Real Parents</h3>
                <p className="text-gray-500 font-medium max-w-xl mx-auto">
                  Our community of thousands of parents trust us with their most precious gift. 
                  Read why they choose PlayPen House for their baby's safe space.
                </p>
                <button className="bg-white border-2 border-primary text-primary px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10">
                  Read All 248 Reviews
                </button>
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
