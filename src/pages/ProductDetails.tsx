import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, Heart, Truck, RotateCcw, Star, ChevronRight, Check } from 'lucide-react';
import api from '../services/api';
import type { Product } from '../types';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';

export const ProductDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Find product by slug (searching in all products for now as we don't have a direct getBySlug API yet, 
        // but we can use the ID from the slug if we formatted it that way, 
        // or just fetch all and filter which is bad but okay for MVP)
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

  if (loading) return <div className="p-20 text-center font-black text-primary">LOADING PREMIUM EXPERIENCE...</div>;
  if (!product) return <div className="p-20 text-center font-black text-red-500">PRODUCT NOT FOUND</div>;

  const images = JSON.parse(product.images || '[]');
  const isWishlisted = isInWishlist(product.id);
  const discount = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>{product.title} | PlayPen House</title>
        <meta name="description" content={product.brand || 'Premium Baby PlayPen'} />
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={`Get the best ${product.title} for your baby at PlayPen House.`} />
        <meta property="og:image" content={images[0] || ''} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Breadcrumbs */}
      <div className="container mx-auto px-6 py-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={12} />
        <Link to="/search" className="hover:text-primary transition-colors">Products</Link>
        <ChevronRight size={12} />
        <span className="text-primary">{product.title}</span>
      </div>

      <div className="container mx-auto px-6 pb-20">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Image Gallery */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-2xl">
              <img 
                src={images[activeImage] || 'https://placehold.co/800x1000'} 
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              {discount > 0 && (
                <div className="absolute top-8 left-8 bg-red-500 text-white text-xs font-black px-4 py-2 rounded-full shadow-xl shadow-red-500/20 uppercase tracking-[0.2em]">
                  {discount}% OFF
                </div>
              )}
            </div>
            
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {images.map((img: string, i: number) => (
                <button 
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-primary scale-105 shadow-xl' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-1/2 space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="px-5 py-2 bg-purple-50 text-primary text-xs font-black uppercase tracking-[0.2em] rounded-full">
                  {product.brand || 'PlayPen House'}
                </span>
                <div className="flex items-center gap-1.5 text-green-600 text-xs font-black uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  In Stock & Ready to Ship
                </div>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-gray-900 leading-[1.05] tracking-tighter">
                {product.title}
              </h1>
              <div className="flex items-center gap-8 pt-2">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={20} className={`${i <= 4.9 ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                  ))}
                  <span className="ml-2 text-lg font-black text-gray-900">4.9</span>
                </div>
                <div className="h-6 w-px bg-gray-200" />
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">248 Verified Reviews</span>
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-gray-50/50 border border-gray-100 flex items-center justify-between">
              <div className="space-y-1">
                {product.salePrice ? (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-5xl font-black text-primary">৳{product.salePrice.toLocaleString()}</span>
                      <span className="text-2xl text-gray-400 line-through font-bold">৳{product.price.toLocaleString()}</span>
                    </div>
                    <p className="text-xs font-black text-red-500 uppercase tracking-widest">You save ৳{(product.price - product.salePrice).toLocaleString()}</p>
                  </>
                ) : (
                  <span className="text-5xl font-black text-gray-900">৳{product.price.toLocaleString()}</span>
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inclusive of all taxes</p>
                <div className="flex items-center gap-2 justify-end text-primary">
                  <Truck size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">Free Express Shipping</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-3xl p-1.5">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-14 h-14 flex items-center justify-center font-black text-gray-500 hover:text-primary transition-colors text-xl"
                  >
                    -
                  </button>
                  <span className="w-14 text-center font-black text-primary text-xl">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-14 h-14 flex items-center justify-center font-black text-gray-500 hover:text-primary transition-colors text-xl"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={() => {
                    for(let i=0; i<quantity; i++) addItem(product);
                  }}
                  className="flex-grow h-[4.5rem] bg-primary text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(170,59,255,0.3)] hover:bg-primary-dark transition-all flex items-center justify-center gap-4 active:scale-95"
                >
                  <ShoppingCart size={24} />
                  Add to Cart
                </button>
                <button 
                  onClick={() => toggleItem(product)}
                  className={`h-[4.5rem] w-[4.5rem] flex items-center justify-center rounded-[2rem] border-2 transition-all duration-300 ${isWishlisted ? 'bg-red-500 border-red-500 text-white shadow-xl shadow-red-500/20' : 'border-gray-100 text-gray-400 hover:border-red-500 hover:text-red-500'}`}
                >
                  <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <Check size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">1 Year Warranty</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <RotateCcw size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">30 Day Returns</span>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-gray-100 space-y-6">
              <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em]">Premium Features</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10">
                {['European Safety Standard EN71 Certified', 'Non-Toxic Premium BPA-Free Plastic', 'Strong Suction Cups for Stability', 'Smooth Edges & Secure Locking Mechanism'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-primary flex-shrink-0">
                      <Check size={12} strokeWidth={4} />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
