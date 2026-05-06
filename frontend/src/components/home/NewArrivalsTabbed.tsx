import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../services/api';
import type { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { Skeleton } from '../ui/Skeleton';
import { useHomeStore } from '../../store/homeStore';

export const NewArrivalsTabbed: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { data } = useHomeStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'clothing', label: 'Clothing' },
    { id: 'toys', label: 'Toys' },
    { id: 'gear', label: 'Gear' },
  ];

  useEffect(() => {
    if (activeTab === 'all' && data?.products?.newArrivals?.items) {
      Promise.resolve().then(() => {
        setProducts(data.products.newArrivals.items);
        setLoading(false);
      });
      return;
    }

    // Wait for bulk fetch if we are on 'all' tab and it's still loading
    if (activeTab === 'all' && !data) {
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = { limit: '8' };
        if (activeTab === 'all') {
          params.tag = 'new-arrival';
        } else {
          params.category = activeTab;
          params.sort = 'newest';
        }
        const response = await getProducts(params);
        setProducts(response.items);
      } catch {
        console.error('Failed to fetch new arrivals');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeTab, data]);


  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">New Arrivals</h2>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-[var(--primary)] text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-80 rounded-xl" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No products found for this category.
          </div>
        )}
        
        <div className="text-center mt-12">
          <Link 
            to="/new-arrivals" 
            className="inline-flex items-center justify-center px-10 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/20"
          >
            Explore All New Arrivals
          </Link>
        </div>
      </div>
    </section>
  );
};
