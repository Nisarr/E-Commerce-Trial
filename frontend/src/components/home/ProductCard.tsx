import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
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
  } catch {
    // Silent fail for image parsing
  }

  return (
    <div 
      className="group relative flex flex-col bg-white rounded-[2rem] overflow-hidden transition-all duration-500 border border-gray-200 hover:border-purple-200 h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
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
            <div className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
              {discount}% OFF
            </div>
          )}
          {((product.stock || 0) - (product.soldCount || 0)) <= 5 && ((product.stock || 0) - (product.soldCount || 0)) > 0 && (
            <div className="bg-amber-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
              Low Stock
            </div>
          )}
        </div>

        {/* Side Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-3 z-10 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
          <button 
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/account/login');
                return;
              }
              toggleItem(product);
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-2xl border border-gray-100 transition-all duration-300 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:bg-red-50 hover:text-red-500'}`}
          >
            <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={() => setIsQuickViewOpen(true)}
            className="w-10 h-10 bg-white text-gray-400 flex items-center justify-center rounded-2xl border border-gray-100 hover:bg-purple-50 hover:text-purple-600 transition-all duration-300"
          >
            <Eye size={20} />
          </button>
        </div>

        {/* Bottom Quick Add */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-10">
          <button 
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/account/login');
                return;
              }
              addItem(product);
            }}
            className="w-full py-3.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart size={16} />
            Quick Add
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-grow p-3">
        
        <Link to={`/product/${product.slug}`} className="block mb-1">
          <h3 className="text-gray-900 font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>
        
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            {product.salePrice ? (
              <>
                <span className="text-[9px] text-gray-400 line-through font-medium">৳{product.price.toLocaleString()}</span>
                <span className="text-base font-black text-primary tracking-tight">৳{product.salePrice.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-base font-black text-gray-900 tracking-tight">৳{product.price.toLocaleString()}</span>
            )}
          </div>
          
          <div className="hidden min-[450px]:block h-6 w-px bg-gray-100 mx-2 md:mx-4" />
          
          <div className="flex items-center gap-1.5 md:gap-2 text-[9px] font-bold text-gray-400 shrink-0">
            <div className="flex items-center gap-0.5">
              {product.reviewCount && product.reviewCount > 0 ? (
                <>
                  <span>{Number(product.rating).toFixed(1)}</span>
                  <Star size={9} className="fill-amber-400 text-amber-400" />
                  <span className="opacity-60">({product.reviewCount})</span>
                </>
              ) : (
                <span className="text-accent">New</span>
              )}
            </div>
            <span className="hidden min-[450px]:inline">· {product.soldCount || 0} sold</span>
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
