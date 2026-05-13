import React, { useState } from 'react';
import { X, ShoppingCart, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const isWishlisted = isInWishlist(product.id);
  const images = JSON.parse(product.images || '[]');
  const discount = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-[3rem] w-full max-w-5xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col md:flex-row relative max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-3 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-primary transition-all"
        >
          <X size={24} />
        </button>

        {/* Image Gallery */}
        <div className="w-full md:w-1/2 bg-gray-50 flex flex-col relative">
          <div className="flex-grow relative overflow-hidden">
            <img 
              src={images[activeImageIndex] || 'https://placehold.co/800x1000'} 
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-700"
            />
            
            {images.length > 1 && (
              <>
                <button 
                  onClick={() => setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
          
          <div className="p-6 flex gap-3 overflow-x-auto no-scrollbar bg-white/50 backdrop-blur-md">
            {images.map((img: string, i: number) => (
              <button 
                key={i}
                onClick={() => setActiveImageIndex(i)}
                className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${activeImageIndex === i ? 'border-primary scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2 p-10 md:p-14 overflow-y-auto">
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                {((product.stock || 0) - (product.soldCount || 0)) > 0 ? (
                  <span className="flex items-center gap-1.5 text-green-600 text-[10px] font-black uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {(product.stock || 0) - (product.soldCount || 0)} In Stock
                  </span>
                ) : (
                  <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">Out of Stock</span>
                )}
              </div>
              <h1 className="text-4xl font-black text-gray-900 leading-[1.1] tracking-tight mb-4">
                {product.title}
              </h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={16} className={`${i <= (product.rating || 5.0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                  ))}
                  <span className="ml-2 text-sm font-bold text-gray-900">{product.rating ? Number(product.rating).toFixed(1) : '5.0'}</span>
                </div>
                <div className="h-4 w-px bg-gray-200" />
                <span className="text-sm font-bold text-gray-400">{product.reviewCount || 0} reviews</span>
                <div className="hidden md:block h-4 w-px bg-gray-200" />
                <span className="hidden md:inline text-sm font-bold text-gray-400">{product.soldCount || 0} sold</span>
              </div>
            </div>

            <div className="flex items-baseline gap-4">
              {product.salePrice ? (
                <>
                  <span className="text-4xl font-black text-primary">৳{product.salePrice.toLocaleString()}</span>
                  <span className="text-xl text-gray-400 line-through font-bold">৳{product.price.toLocaleString()}</span>
                  <div className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-red-500/20">
                    SAVE {discount}%
                  </div>
                </>
              ) : (
                <span className="text-4xl font-black text-gray-900">৳{product.price.toLocaleString()}</span>
              )}
            </div>

            <p className="text-gray-500 leading-relaxed font-medium">
              Give your little one the ultimate comfort and safety they deserve. Our premium playpens are designed with love and engineered for security, ensuring a happy space for your baby.
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-100 rounded-2xl p-1">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center font-black text-gray-500 hover:text-primary transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center font-black text-primary">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-12 h-12 flex items-center justify-center font-black text-gray-500 hover:text-primary transition-colors"
                >
                  +
                </button>
              </div>
              <button 
                onClick={() => {
                  for(let i=0; i<quantity; i++) addItem(product);
                  onClose();
                }}
                className="flex-[3] h-14 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-primary-dark transition-all flex items-center justify-center gap-3"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>
              <button 
                onClick={() => {
                  toggleItem(product);
                }}
                className={`h-14 w-14 flex items-center justify-center rounded-2xl border-2 transition-all duration-300 ${isWishlisted ? 'bg-red-500 border-red-500 text-white' : 'border-gray-100 text-gray-400 hover:border-red-500 hover:text-red-500'}`}
              >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};
