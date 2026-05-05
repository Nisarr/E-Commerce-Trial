import { useHomeStore } from '../../store/homeStore';
import { ProductCard } from './ProductCard';
import { Skeleton } from '../ui/Skeleton';

export const TrendingProducts: React.FC = () => {
  const { data, loading: homeLoading } = useHomeStore();
  const products = data?.products?.trending?.items || [];
  const loading = homeLoading && !data;


  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <Skeleton className="w-48 h-8 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
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
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Trending Now</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
