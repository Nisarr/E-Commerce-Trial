import React from 'react';
import { Link } from 'react-router-dom';
import { useRecentlyViewedStore } from '../store/recentlyViewedStore';
import { Eye, ArrowRight } from 'lucide-react';

export const RecentlyViewed: React.FC = () => {
  const { items } = useRecentlyViewedStore();

  if (items.length === 0) return null;

  return (
    <section className="py-10 bg-gray-50/50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-primary flex items-center gap-2">
            <Eye size={20} className="text-accent" /> Recently Viewed
          </h2>
          <Link
            to="/shop"
            className="text-xs font-bold text-accent hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory scrollbar-hide">
          {items.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              className="flex-shrink-0 w-40 group snap-start"
            >
              <div className="aspect-square rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm group-hover:shadow-lg transition-all group-hover:-translate-y-1">
                <img
                  src={(() => {
                    try {
                      const imgs = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                      return Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : '/placeholder.jpg';
                    } catch { return '/placeholder.jpg'; }
                  })()}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h4 className="mt-2 text-xs font-bold text-primary truncate group-hover:text-accent transition-colors">
                {product.title}
              </h4>
              <p className="text-xs font-bold text-accent">
                ${(product.salePrice || product.price).toFixed(2)}
                {product.salePrice && product.salePrice < product.price && (
                  <span className="line-through text-gray-400 ml-1">${product.price.toFixed(2)}</span>
                )}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
