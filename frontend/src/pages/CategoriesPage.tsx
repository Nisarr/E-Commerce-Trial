import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, LayoutGrid, Sparkles } from 'lucide-react';
import { getCategories } from '../services/api';
import type { Category } from '../types';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories(false, true);
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFBF0] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF0] pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-[#FF4500]/10 pt-8 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles size={14} />
              Explore Collections
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-primary mb-4 font-garamond italic">
              All Categories
            </h1>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              Discover our curated selection of premium baby products, toys, and essentials organized to help you find exactly what your little one needs.
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group bg-white rounded-[2rem] p-4 border-2 border-transparent hover:border-accent shadow-xl shadow-black/5 transition-all duration-500 flex flex-col items-center text-center hover:-translate-y-2"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-3 bg-accent/5 p-1 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <img
                  src={category.image || '/placeholder-category.png'}
                  alt={category.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              
              <h3 className="text-lg md:text-xl font-bold text-primary mb-1 group-hover:text-accent transition-colors">
                {category.name}
              </h3>
              
              <div className="flex items-center gap-1 text-[10px] font-bold text-accent uppercase tracking-widest h-0 opacity-0 group-hover:h-4 group-hover:opacity-100 transition-all duration-300 overflow-hidden">
                Browse Collection
                <ChevronRight size={12} />
              </div>

              {/* Decorative accent */}
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-accent/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <LayoutGrid size={14} className="text-accent" />
              </div>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 italic">No categories found.</p>
          </div>
        )}
      </div>

      {/* Decorative background elements */}
      <div className="fixed top-1/4 -left-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
