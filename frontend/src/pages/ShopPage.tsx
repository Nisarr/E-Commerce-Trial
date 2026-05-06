import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Filter, Grid, List as ListIcon, ChevronDown, Search } from 'lucide-react';
import { getProducts, getCategories } from '../services/api';
import type { Product, Category } from '../types';
import { ProductCard } from '../components/home/ProductCard';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const location = useLocation();
  const isBestSellers = location.pathname === '/best-sellers';
  const isOffers = location.pathname === '/offers';
  const isSearch = location.pathname === '/search';
  const isNewArrivals = location.pathname === '/new-arrivals';

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || (isBestSellers ? 'trending' : isNewArrivals ? 'newest' : 'newest');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch {
        console.error('Failed to fetch categories');
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await getProducts({
          page: 1,
          limit: 20,
          q: query,
          category,
          sort,
          ...(isOffers ? { hasOffer: 'true' } : {}),
          ...(isNewArrivals ? { tag: 'new-arrival' } : {})
        });
        setProducts(response.items);
      } catch {
        console.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [query, category, sort, isOffers, isBestSellers, isNewArrivals]);

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    setSearchParams(params);
  };

  const handleCategoryChange = (catId: string) => {
    const params = new URLSearchParams(searchParams);
    if (catId) params.set('category', catId);
    else params.delete('category');
    setSearchParams(params);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gray-50 py-16 border-b border-gray-100">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">
            {isSearch
              ? (query ? `Search: "${query}"` : 'Search Products')
              : isBestSellers
                ? 'Best Sellers'
                : isOffers
                  ? 'Special Offers'
                  : isNewArrivals
                    ? 'New Arrivals'
                    : 'Premium Collection'}
          </h1>
          <p className="text-gray-500 font-medium max-w-2xl">
            Explore our curated selection of premium baby playpens and accessories, designed for maximum safety and comfort.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 space-y-10">
            <div>
              <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Filter size={14} /> Categories
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${!category ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${category === cat.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-6">Price Range</h3>
              <div className="space-y-4">
                <input type="range" className="w-full accent-primary" />
                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase">
                  <span>৳0</span>
                  <span>৳50,000+</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-grow">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView('grid')}
                  className={`p-3 rounded-xl transition-all ${view === 'grid' ? 'bg-primary text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-3 rounded-xl transition-all ${view === 'list' ? 'bg-primary text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  <ListIcon size={20} />
                </button>
                <span className="text-xs font-bold text-gray-400 ml-4">
                  Showing <span className="text-gray-900">{products.length}</span> Products
                </span>
              </div>

              <div className="flex items-center gap-4 relative group">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Sort By:</span>
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-gray-50 border-2 border-transparent hover:border-gray-100 rounded-xl px-4 py-2 text-sm font-black text-gray-900 outline-none transition-all appearance-none pr-10 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="trending">Trending Now</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-gray-50 rounded-[2rem] skeleton" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={view === 'grid' ? "grid grid-cols-2 md:grid-cols-3 gap-8" : "flex flex-col gap-8"}>
                {products.map((product) => (
                  <div key={product.id} className={view === 'list' ? "h-64" : ""}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-500 font-medium">Try adjusting your filters or search query.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
