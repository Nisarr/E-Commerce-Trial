import { Link } from 'react-router-dom';
import { useHomeStore } from '../../store/homeStore';
import { ProductCard } from './ProductCard';
import { Skeleton } from '../ui/Skeleton';

export const BestSelling: React.FC = () => {
  const { data, loading: homeLoading } = useHomeStore();
  const products = data?.products?.bestSelling?.items || [];
  const loading = homeLoading && !data;


  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <Skeleton className="w-48 h-8 mb-8 mx-auto" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-80 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Best Selling Products</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Discover the products that other parents love the most. Trusted quality and proven satisfaction.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link to="/best-sellers" className="inline-block border-2 border-[var(--primary)] text-[var(--primary)] px-8 py-3 rounded-full font-medium hover:bg-[var(--primary)] hover:text-white transition-colors">
            View All Best Sellers
          </Link>
        </div>
      </div>
    </section>
  );
};
