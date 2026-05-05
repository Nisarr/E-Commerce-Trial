import React, { useState } from 'react';
import { Edit3, Trash2, Search, X } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { Product, Category } from '../../types';

interface ProductManagerProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({ products, categories, onEdit, onDelete }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('newest');
  const [stockStatus, setStockStatus] = useState('all');
  
  const categoryId = searchParams.get('category');
  const globalQuery = searchParams.get('q') || '';

  const filteredProducts = products.filter(product => {
    const matchesCategory = !categoryId || product.categoryId === categoryId;
    const matchesSearch = !globalQuery || 
      product.title.toLowerCase().includes(globalQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(globalQuery.toLowerCase());
    
    const matchesMinPrice = !priceRange.min || product.price >= Number(priceRange.min);
    const matchesMaxPrice = !priceRange.max || product.price <= Number(priceRange.max);

    const matchesStock = stockStatus === 'all' || 
      (stockStatus === 'in-stock' && product.stock > 0) ||
      (stockStatus === 'out-of-stock' && product.stock <= 0);
    
    return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice && matchesStock;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    if (sortBy === 'price-low') {
      return a.price - b.price;
    }
    if (sortBy === 'price-high') {
      return b.price - a.price;
    }
    return 0;
  });

  const clearFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('category');
    newParams.delete('q');
    setSearchParams(newParams);
    setPriceRange({ min: '', max: '' });
    setSortBy('newest');
    setStockStatus('all');
  };
  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search products by name or brand..."
              value={globalQuery}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams);
                if (e.target.value) newParams.set('q', e.target.value);
                else newParams.delete('q');
                setSearchParams(newParams);
              }}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-accent/20 focus:bg-white rounded-xl text-sm font-bold outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Category Filter */}
            <select 
              value={categoryId || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val) setSearchParams({ category: val });
                else setSearchParams({});
              }}
              className="px-4 py-3 bg-gray-50 border border-transparent focus:border-accent/20 focus:bg-white rounded-xl text-xs font-bold outline-none transition-all cursor-pointer min-w-[150px]"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {/* Price Range */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-xl border border-transparent focus-within:border-accent/20 focus-within:bg-white transition-all">
              <span className="text-[10px] font-black text-muted uppercase">৳</span>
              <input 
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-16 bg-transparent py-2 text-xs font-bold outline-none"
              />
              <span className="text-gray-300">-</span>
              <input 
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-16 bg-transparent py-2 text-xs font-bold outline-none"
              />
            </div>

            {/* Stock Status */}
            <select 
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-transparent focus:border-accent/20 focus:bg-white rounded-xl text-xs font-bold outline-none transition-all cursor-pointer"
            >
              <option value="all">All Stock</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>

            {/* Sort By */}
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-transparent focus:border-accent/20 focus:bg-white rounded-xl text-xs font-bold outline-none transition-all cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {(categoryId || globalQuery || priceRange.min || priceRange.max || stockStatus !== 'all') && (
              <button 
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
              >
                <X size={14} strokeWidth={3} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-primary/5 border-2 border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b-2 border-gray-100">
            <tr>
              <th className="px-6 py-3 font-black text-primary text-[10px] uppercase tracking-[0.2em] border-r border-gray-100 last:border-r-0">Product Details</th>
              <th className="px-6 py-3 font-black text-primary text-[10px] uppercase tracking-[0.2em] border-r border-gray-100 last:border-r-0">Inventory Status</th>
              <th className="px-6 py-3 font-black text-primary text-[10px] uppercase tracking-[0.2em] text-right border-r border-gray-100 last:border-r-0">Actions</th>
            </tr>
          </thead>
        <tbody className="divide-y-2 divide-gray-100">
          {filteredProducts.map(product => {
            const images = JSON.parse(product.images || '[]');
            const mainImage = images[0] || '';
            
            return (
              <tr 
                key={product.id} 
                className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                onClick={() => navigate(`/adm/products/${product.id}/buyers`)}
              >
                <td className="px-6 py-3 border-r border-gray-50 last:border-r-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                      {mainImage ? (
                        <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black text-muted text-[10px]">NO IMG</span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-primary">{product.title}</div>
                      <div className="text-xs text-muted font-medium">৳{product.price} • {product.brand}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 border-r border-gray-50 last:border-r-0">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${product.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-6 py-3 text-right relative">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(product);
                      }}
                      className="p-2 text-muted hover:text-primary transition-colors hover:bg-white rounded-lg shadow-sm"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this product?')) {
                          onDelete(product.id);
                        }
                      }}
                      className="p-2 text-muted hover:text-red-500 transition-colors hover:bg-white rounded-lg shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={3} className="px-8 py-20 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <Search size={32} />
                  </div>
                  <h3 className="text-lg font-black text-primary">No Products Found</h3>
                  <p className="text-sm text-muted font-bold uppercase tracking-widest mt-1">Try adjusting your search or filters</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
