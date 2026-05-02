import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedCategories } from '../components/home/FeaturedCategories';
import { TrendingProducts } from '../components/home/TrendingProducts';
import { PromoBanner } from '../components/home/PromoBanner';
import { NewArrivalsTabbed } from '../components/home/NewArrivalsTabbed';
import { SpecialOfferCountdown } from '../components/home/SpecialOfferCountdown';
import { BestSelling } from '../components/home/BestSelling';
import { BrandStrip } from '../components/home/BrandStrip';

export const Home: React.FC = () => {
  return (
    <main className="flex flex-col min-h-screen">
      <HeroSection />
      <FeaturedCategories />
      <TrendingProducts />
      <PromoBanner position="mid-1" />
      <NewArrivalsTabbed />
      <SpecialOfferCountdown />
      <BestSelling />
      <PromoBanner position="mid-2" />
      <BrandStrip />
    </main>
  );
};
