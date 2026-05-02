import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  
  const isWishlisted = isInWishlist(product.id);
  const discount = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  let imageUrl = 'https://placehold.co/400x400/e2e8f0/64748b?text=Product';
  try {
    const images = JSON.parse(product.images);
    if (images && images.length > 0) imageUrl = images[0];
  } catch (e) {}

  return (
    <div className="product-card group relative flex flex-col bg-white rounded-[var(--radius)] overflow-hidden border border-gray-100 h-full">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Link to={`/product/${product.slug}`}>
          <img 
            src={imageUrl} 
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && <Badge variant="sale">-{discount}%</Badge>}
          {product.tags?.includes('new') && <Badge variant="new">New</Badge>}
        </div>

        {/* Quick actions hover */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 transform translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
          <button 
            onClick={() => toggleItem(product)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md hover:bg-[var(--accent)] hover:text-white transition-colors cursor-pointer"
            aria-label="Add to wishlist"
          >
            <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "text-[var(--accent)]" : "text-gray-600 hover:text-white"} />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-grow p-4">
        <div className="text-xs text-gray-500 mb-1">{product.brand}</div>
        <Link to={`/product/${product.slug}`} className="flex-grow">
          <h3 className="font-medium text-sm md:text-base text-gray-900 line-clamp-2 hover:text-[var(--accent)] transition-colors mb-2">
            {product.title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className={`w-3.5 h-3.5 ${star <= product.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>

        <div className="flex items-end justify-between mt-auto pt-2">
          <div className="flex flex-col">
            {product.salePrice ? (
              <>
                <span className="text-sm text-gray-400 line-through">৳{product.price.toLocaleString()}</span>
                <span className="text-lg font-bold text-[var(--accent)]">৳{product.salePrice.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">৳{product.price.toLocaleString()}</span>
            )}
          </div>
          <Button 
            size="sm" 
            variant="primary" 
            className="w-9 h-9 !p-0 rounded-full shrink-0"
            onClick={() => addItem(product)}
            aria-label="Add to cart"
          >
            <ShoppingCart size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
