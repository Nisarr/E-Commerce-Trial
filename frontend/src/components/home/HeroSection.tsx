import React, { useEffect, useState } from 'react';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Truck, 
  ShieldCheck, 
  Award, 
  Headphones 
} from 'lucide-react';
import { getBanners } from '../../services/api';
import type { Banner } from '../../types';
import { Skeleton } from '../ui/Skeleton';
import heroFallback from '../../assets/hero.png';

export const HeroSection: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const bannersData = await getBanners('hero');
        setBanners(bannersData);
      } catch (error) {
        console.error('Failed to fetch hero banners:', error);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextBanner = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };
  const prevBanner = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const trustBadges = [
    { icon: Truck, label: 'Free Shipping', desc: 'On orders over ৳5000' },
    { icon: ShieldCheck, label: '100% Safe', desc: 'Secure payment gateway' },
    { icon: Award, label: 'Premium Quality', desc: 'Certified baby products' },
    { icon: Headphones, label: '24/7 Support', desc: 'Dedicated parent help' },
  ];

  if (loading) {
    return (
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8 min-h-[350px]">
            <div className="w-full md:w-1/2 space-y-6">
              <Skeleton className="w-3/4 h-12" />
              <Skeleton className="w-full h-20" />
              <Skeleton className="w-40 h-12 rounded-xl" />
            </div>
            <div className="w-full md:w-1/2">
              <Skeleton className="w-full h-[300px] rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fallbackBanner: Banner = {
    id: 'fallback',
    image: heroFallback,
    link: '/shop',
    position: 'hero',
    order: 0,
  };

  const banner = banners[currentIndex] || fallbackBanner;

  return (
    <section className="relative bg-white text-primary overflow-hidden">
      {/* Premium Decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-40 left-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl animate-bounce duration-[5000ms]" />
      <div className="absolute top-0 right-0 w-full md:w-2/3 h-full bg-gradient-to-l from-gray-50/50 to-transparent pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center min-h-[500px] lg:min-h-[600px] gap-12 pt-12 md:pt-16 pb-0">
          {/* Left Text Part */}
          <div className="w-full md:w-1/2 flex flex-col justify-between py-2 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 rounded-full text-accent font-black text-[10px] uppercase tracking-widest">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
                </span>
                Premium Quality Guaranteed
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight font-garamond">
                The <span className="text-accent italic">Ultimate</span> <br /> 
                Comfort for <br /> 
                Your <span className="text-primary underline decoration-accent/30 decoration-8 underline-offset-4">Angel</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted max-w-lg leading-relaxed font-poppins font-light">
                We provide the safest, most comfortable, and stylish baby playhouses and accessories in Bangladesh. Trust the experts for your little one's joy.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 mt-8">
              <button 
                className="relative overflow-hidden group bg-primary text-white rounded-xl px-8 py-4 text-lg font-bold shadow-[0_15px_35px_rgba(15,23,42,0.2)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.3)] active:scale-95 flex items-center gap-2"
                onClick={() => window.location.href = banner.link || '/category/all'}
              >
                <span className="relative z-10">Start Shopping</span>
                <ArrowRight className="group-hover:translate-x-2 transition-transform duration-500" size={20} />
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-light translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </button>
              
              <div className="flex -space-x-2 items-center">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                  </div>
                ))}
                <div className="pl-4">
                  <div className="text-base font-black text-primary">4.9/5 Trust Score</div>
                  <div className="text-[10px] text-muted font-bold uppercase tracking-wider">Trusted by 5k+ Parents</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image Part & Trust Badges */}
          <div className="w-full md:w-1/2 flex flex-col justify-center py-2 animate-in fade-in slide-in-from-right-8 duration-1000">
            {/* Wider Image Aspect Ratio */}
            <div className="relative aspect-[16/10] md:aspect-[4/3] rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] border-4 border-white group mb-8">
              <img 
                key={currentIndex}
                src={banner.image} 
                alt="Hero Banner" 
                className="w-full h-full object-cover transform transition-all duration-1000 group-hover:scale-110 animate-in fade-in zoom-in-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              
              {/* Arrows */}
              <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); prevBanner(); }} className="w-14 h-14 glass rounded-full flex items-center justify-center text-primary shadow-xl hover:bg-accent hover:text-white transition-all"><ChevronLeft size={28} /></button>
                <button onClick={(e) => { e.stopPropagation(); nextBanner(); }} className="w-14 h-14 glass rounded-full flex items-center justify-center text-primary shadow-xl hover:bg-accent hover:text-white transition-all"><ChevronRight size={28} /></button>
              </div>

              {/* Indicators */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, i) => (
                  <button key={i} onClick={() => setCurrentIndex(i)} className={`h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white w-8' : 'bg-white/40 w-2'}`} />
                ))}
              </div>
            </div>

            {/* Trust Badges - Very Compact One Line Row */}
            <div className="flex flex-wrap md:flex-nowrap justify-between gap-2 bg-gray-50/50 p-2 rounded-2xl border border-gray-100 shadow-sm mt-auto">
              {trustBadges.map((badge, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all group flex-1 justify-center">
                  <badge.icon size={16} className="text-accent shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-tighter whitespace-nowrap">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

