import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import type { Product, Category } from '../types';
import { ProductCard } from '../components/home/ProductCard';
import { ChevronRight } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        const cats = await getCategories();
        const cat = cats.find(c => c.slug === slug);
        if (cat) {
          setCategory(cat);
          const response = await getProducts({ category: cat.id, limit: 20 });
          setProducts(response.items);
        }
      } catch (error) {
        console.error('Failed to fetch category products');
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryData();
  }, [slug]);

  if (loading) return <div className="p-20 text-center font-black text-primary">LOADING CATEGORY...</div>;
  if (!category) return <div className="p-20 text-center font-black text-red-500">CATEGORY NOT FOUND</div>;

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-purple-50 py-20 overflow-hidden relative">
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-6xl font-black text-primary tracking-tighter mb-4">{category.name}</h1>
          <p className="text-primary/60 font-bold max-w-xl">
            Premium selection of {category.name.toLowerCase()} designed with safety and comfort in mind for your precious little ones.
          </p>
        </div>
        
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="container mx-auto px-6 py-16">
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
