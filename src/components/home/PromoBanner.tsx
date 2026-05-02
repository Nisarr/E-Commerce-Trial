import React, { useEffect, useState } from 'react';
import { getBanners } from '../../services/api';
import type { Banner } from '../../types';
import { Skeleton } from '../ui/Skeleton';

interface PromoBannerProps {
  position: 'mid-1' | 'mid-2';
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ position }) => {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const { data } = await getBanners(position);
        if (data && data.length > 0) {
          setBanner(data[0]);
        }
      } catch (error) {
        console.error(`Failed to fetch banner ${position}:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, [position]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="w-full h-48 md:h-64 rounded-2xl" />
      </div>
    );
  }

  if (!banner) return null;

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <a 
        href={banner.link || '#'} 
        className="relative block overflow-hidden rounded-[3rem] group shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] hover:shadow-[0_48px_80px_-16px_rgba(0,0,0,0.2)] transition-all duration-700"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent z-10 group-hover:opacity-0 transition-opacity" />
        <img 
          src={banner.image} 
          alt={`Promotional Banner ${position}`} 
          className="w-full h-56 md:h-80 object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 border-8 border-white/20 rounded-[3rem] pointer-events-none" />
      </a>
    </div>
  );
};
