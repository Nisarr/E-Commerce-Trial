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
        const { data } = await getCategories(true);
        // User requested max 12 items
        setCategories(data.slice(0, 12));
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

  // Fallback items if DB is empty
  const displayCategories = categories.length > 0 ? categories : [
    { id: '1', name: 'Diapers', slug: 'diapers', image: 'https://placehold.co/160x160/e0e7ff/4f46e5?text=Diaper', parentId: null },
    { id: '2', name: 'Bath', slug: 'bath', image: 'https://placehold.co/160x160/dbeafe/2563eb?text=Bath', parentId: null },
    { id: '3', name: 'Bottles', slug: 'bottles', image: 'https://placehold.co/160x160/ffedd5/ea580c?text=Bottles', parentId: null },
    { id: '4', name: 'Toys', slug: 'toys', image: 'https://placehold.co/160x160/fce7f3/db2777?text=Toys', parentId: null },
    { id: '5', name: 'Clothes', slug: 'clothes', image: 'https://placehold.co/160x160/dcfce7/16a34a?text=Clothes', parentId: null },
    { id: '6', name: 'Strollers', slug: 'strollers', image: 'https://placehold.co/160x160/fef3c7/d97706?text=Stroller', parentId: null },
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black text-primary mb-3">Shop by Category</h2>
            <p className="text-muted max-w-md">Everything you need for your little ones, curated with love and care.</p>
          </div>
          <Link 
            to="/categories" 
            className="group flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-primary hover:text-white rounded-2xl font-bold transition-all duration-300 shadow-sm"
          >
            See All Categories 
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
          {displayCategories.map((category) => (
            <Link 
              key={category.id} 
              to={`/category/${category.slug}`}
              className="group flex flex-col items-center"
            >
              <div className="relative w-full aspect-square rounded-[2.5rem] overflow-hidden bg-gray-50 border-2 border-transparent transition-all duration-500 group-hover:rounded-[1.5rem] group-hover:border-accent group-hover:shadow-2xl group-hover:shadow-accent/20 group-hover:-translate-y-2">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover p-6 group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-4 text-center">
                <span className="block text-sm md:text-base font-bold text-primary group-hover:text-accent transition-colors">
                  {category.name}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  Shop Now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
