import React from 'react';
import { Helmet } from 'react-helmet-async';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedCategories } from '../components/home/FeaturedCategories';
import { TrendingProducts } from '../components/home/TrendingProducts';
import { PromoBanner } from '../components/home/PromoBanner';
import { NewArrivalsTabbed } from '../components/home/NewArrivalsTabbed';
import { SpecialOfferCountdown } from '../components/home/SpecialOfferCountdown';
import { BestSelling } from '../components/home/BestSelling';
import { RecentlyViewed } from '../components/RecentlyViewed';

export const Home: React.FC = () => {
  // Trial version: premium storefront components (banners, offers) are visible
  // but managed via premium admin tools only
  return (
    <main className="flex flex-col min-h-screen">
      <Helmet>
        <title>PlayPen House — Premium Baby Playpens & Accessories</title>
        <meta name="description" content="Discover safe, premium baby playpens, toys, and accessories. Free shipping on all orders. European safety certified." />
        <meta property="og:title" content="PlayPen House — Premium Baby Products" />
        <meta property="og:description" content="Shop the safest and most stylish baby playpens, toys and nursery essentials." />
        <meta property="og:type" content="website" />
      </Helmet>
      <HeroSection />
      <FeaturedCategories />
      <TrendingProducts />
      <PromoBanner position="mid-1" />
      <NewArrivalsTabbed />
      <SpecialOfferCountdown />
      <BestSelling />
      <PromoBanner position="mid-2" />
      <RecentlyViewed />
    </main>
  );
};
