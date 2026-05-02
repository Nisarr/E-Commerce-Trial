import React, { useEffect, useState } from 'react';
import { getProducts } from '../../services/api';
import type { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { Skeleton } from '../ui/Skeleton';

export const SpecialOfferCountdown: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 45,
    seconds: 0
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await getProducts({ tag: 'special-offer', limit: 4 });
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch special offers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();

    // Simple countdown logic
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
            else {
              hours = 23;
              if (days > 0) days--;
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-orange-50">
        <div className="container mx-auto px-4">
          <Skeleton className="w-full h-80 rounded-xl" />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-[#FFF8F1]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="w-full lg:w-1/3 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Special Offers <br />
              <span className="text-[var(--accent)]">Ending Soon!</span>
            </h2>
            <p className="text-gray-600">Grab these exclusive deals before the timer runs out. Top quality baby products at unbeatable prices.</p>
            
            <div className="flex gap-4">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Mins', value: timeLeft.minutes },
                { label: 'Secs', value: timeLeft.seconds },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-white rounded-lg shadow-sm border border-orange-100 text-xl font-bold text-[var(--accent)] mb-1">
                    {item.value.toString().padStart(2, '0')}
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase">{item.label}</span>
                </div>
              ))}
            </div>
            
            <a href="/offers" className="inline-block bg-[var(--primary)] text-white px-8 py-3 rounded-full font-medium hover:bg-[var(--primary)]/90 transition-colors mt-4">
              View All Offers
            </a>
          </div>
          
          <div className="w-full lg:w-2/3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
