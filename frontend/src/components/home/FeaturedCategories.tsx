import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getCategories } from '../../services/api';
import type { Category } from '../../types';
import { Skeleton } from '../ui/Skeleton';

export const FeaturedCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories(false);
        // User requested max 12 items
        setCategories(categoriesData.slice(0, 12));
      } catch (error) {

        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <Skeleton className="w-48 h-8" />
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <Skeleton className="w-20 h-20 rounded-2xl" />
                <Skeleton className="w-16 h-4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayCategories = categories;

  return (
    <section className="pt-8 pb-24 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 gap-6">
          <div className="text-center md:text-left max-w-2xl">
            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-xs font-bold uppercase tracking-[0.2em] rounded-full mb-4">
              Our Collections
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-primary mb-4 leading-tight">
              Shop by <span className="text-accent italic font-garamond">Category</span>
            </h2>
            <p className="text-muted text-lg">
              Handpicked essentials for every stage of your baby's journey, from tiny toes to big milestones.
            </p>
          </div>
          <Link 
            to="/categories" 
            className="group relative flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-full font-bold transition-all duration-500 hover:pr-10 hover:shadow-xl hover:shadow-primary/20"
          >
            Explore All
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
          </Link>
        </div>
        
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-3 md:gap-4">
          {displayCategories.map((category, index) => (
            <Link 
              key={category.id} 
              to={`/category/${category.slug}`}
              className="group flex flex-col items-center"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative w-full aspect-square rounded-[1.2rem] overflow-hidden bg-gray-50/50 border border-gray-100 transition-all duration-700 group-hover:bg-white group-hover:border-accent/20 group-hover:shadow-[0_10px_30px_rgba(244,63,94,0.1)] group-hover:-translate-y-1.5">
                {/* Background Pattern or Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img 
                      src={category.image || 'https://placehold.co/400x500/f8fafc/64748b?text=' + category.name} 
                      alt={category.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/400x500/f8fafc/64748b?text=' + category.name;
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-center">
                <h3 className="text-xs md:text-sm font-black text-primary group-hover:text-accent transition-colors duration-300 line-clamp-1">
                  {category.name}
                </h3>
                <p className="text-[9px] font-bold text-muted uppercase tracking-[0.1em] mt-0.5 group-hover:opacity-0 transition-opacity">
                  View Items
                </p>
              </div>
            </Link>
          ))}
          {displayCategories.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-muted font-bold uppercase tracking-widest text-sm">New Collections Arriving Soon...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
