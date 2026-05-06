import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import type { Product, Category } from '../types';
import { ProductCard } from '../components/home/ProductCard';


export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        if (slug === 'all' || !slug) {
          setCategory({
            id: 'all',
            name: 'All Products',
            slug: 'all',
            image: '',
            parentId: null,
            isActive: 1,
            isFeatured: 1
          });
          const response = await getProducts({ limit: 40 });
          setProducts(response.items);
        } else {
          const cats = await getCategories();
          const cat = cats.find(c => c.slug === slug);
          if (cat) {
            setCategory(cat);
            const response = await getProducts({ category: cat.id, limit: 40 });
            setProducts(response.items);
          } else {
            setCategory(null);
          }
        }
      } catch {
        console.error('Failed to fetch category products');
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryData();
  }, [slug]);

  if (loading) return (
    <div className="bg-white min-h-screen animate-in fade-in duration-500">
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="h-12 w-64 rounded-2xl skeleton mb-4" />
          <div className="h-6 w-96 rounded skeleton" />
        </div>
      </div>
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="aspect-[4/5] bg-gray-50 rounded-[2rem] skeleton" />
          ))}
        </div>
      </div>
    </div>
  );

  if (!category) return (
    <div className="min-h-screen flex items-center justify-center bg-white p-20">
      <div className="text-center">
        <h2 className="text-4xl font-black text-primary mb-4">Category Not Found</h2>
        <p className="text-muted font-bold mb-8">The category you are looking for does not exist or has been moved.</p>
        <button 
          onClick={() => window.location.href = '/shop'}
          className="bg-primary text-white px-8 py-4 rounded-xl font-black hover:shadow-xl transition-all"
        >
          Back to Shop
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="relative pt-10 pb-12 overflow-hidden">
        {/* Background Layer */}
        <div className={`absolute inset-0 -z-10 transition-colors duration-1000 ${
          slug === 'all' ? 'bg-[#F0F4FF]' : 'bg-[#FDF2F2]'
        }`}>
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.08] mix-blend-multiply" style={{ backgroundImage: 'url(/images/category-bg.png)', backgroundSize: 'cover' }} />
          
          {/* Animated Blobs */}
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[80px] animate-pulse" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-accent/5 blur-[70px] animate-pulse [animation-delay:2s]" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/50 backdrop-blur-sm border border-white/50 text-accent text-[10px] font-black uppercase tracking-wider mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
                </span>
                Our Collection
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-primary tracking-tighter leading-[0.95] mb-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                {category.name}
              </h1>
              
              <p className="text-primary/60 font-medium text-base md:text-lg max-w-xl leading-snug animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                {slug === 'all' 
                  ? 'Explore our complete collection of premium baby playpens, furniture, and essentials.'
                  : `Curated selection of ${category.name.toLowerCase()} that combine safety, style, and comfort.`}
              </p>
            </div>
            
            {/* Visual element on the right */}
            <div className="hidden lg:block relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
               <div className="w-64 h-64 bg-white/30 backdrop-blur-md rounded-[3rem] border border-white/50 shadow-premium flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-700 group overflow-hidden">
                  <div className="absolute inset-0 opacity-20 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: 'url(/images/category-bg.png)', backgroundSize: 'cover' }} />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50" />
                  <div className="w-48 h-48 bg-white/50 rounded-[2.5rem] flex items-center justify-center text-primary/5 relative z-10 group-hover:scale-110 transition-transform duration-700 shadow-inner">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-24 h-24">
                        <path d="M12 3v18M3 12h18" />
                        <circle cx="12" cy="12" r="9" />
                     </svg>
                  </div>
               </div>
               {/* Floating accent shapes */}
               <div className="absolute -top-4 -right-4 w-12 h-12 bg-accent/10 rounded-2xl blur-xl animate-bounce duration-[3000ms]" />
               <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400 font-bold">
              No products found in this category yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
