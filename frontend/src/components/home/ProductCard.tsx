import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  const isWishlisted = isInWishlist(product.id);
  const discount = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  let imageUrl = 'https://placehold.co/600x600/f8fafc/94a3b8?text=Premium+Product';
  let secondImageUrl = '';
  try {
    const images = JSON.parse(product.images);
    if (images && images.length > 0) {
      imageUrl = images[0];
      if (images.length > 1) secondImageUrl = images[1];
    }
  } catch (e) {}

  return (
    <div 
      className="group relative flex flex-col bg-white rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(170,59,255,0.12)] border border-gray-100 hover:border-purple-100 h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img 
            src={isHovered && secondImageUrl ? secondImageUrl : imageUrl} 
            alt={product.title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            loading="lazy"
          />
        </Link>
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {discount > 0 && (
            <div className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-red-500/20 uppercase tracking-widest">
              {discount}% OFF
            </div>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="bg-amber-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-amber-500/20 uppercase tracking-widest">
              Low Stock
            </div>
          )}
        </div>

        {/* Side Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-3 z-10 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
          <button 
            onClick={() => toggleItem(product)}
            className={`w-10 h-10 flex items-center justify-center rounded-2xl shadow-xl transition-all duration-300 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:bg-red-50 hover:text-red-500'}`}
          >
            <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={() => setIsQuickViewOpen(true)}
            className="w-10 h-10 bg-white text-gray-400 flex items-center justify-center rounded-2xl shadow-xl hover:bg-purple-50 hover:text-purple-600 transition-all duration-300"
          >
            <Eye size={20} />
          </button>
        </div>

        {/* Bottom Quick Add */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-10">
          <button 
            onClick={() => addItem(product)}
            className="w-full py-3.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart size={16} />
            Quick Add
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-grow p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{product.brand || 'PlayPen House'}</span>
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-bold text-gray-400">{product.rating || '5.0'}</span>
          </div>
        </div>
        
        <Link to={`/product/${product.slug}`} className="block mb-3">
          <h3 className="text-gray-900 font-bold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>
        
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            {product.salePrice ? (
              <>
                <span className="text-xs text-gray-400 line-through font-medium">৳{product.price.toLocaleString()}</span>
                <span className="text-xl font-black text-primary tracking-tight">৳{product.salePrice.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-xl font-black text-gray-900 tracking-tight">৳{product.price.toLocaleString()}</span>
            )}
          </div>
          
          <div className="h-8 w-px bg-gray-100 mx-4" />
          
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="text-[8px] font-black text-gray-400 ml-4 self-center uppercase tracking-tighter">
              +12 happy moms
            </div>
          </div>
        </div>
      </div>

      {isQuickViewOpen && (
        <QuickViewModal 
          product={product} 
          onClose={() => setIsQuickViewOpen(false)} 
        />
      )}
    </div>
  );
};
