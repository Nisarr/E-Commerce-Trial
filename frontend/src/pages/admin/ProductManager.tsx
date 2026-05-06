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
      <div className="bg-[var(--adm-card-bg)] p-3 md:p-6 rounded-[1.2rem] md:rounded-[1.5rem] border border-[var(--adm-border)] shadow-sm space-y-3 md:space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 md:gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--adm-text-secondary)] group-focus-within:text-accent transition-colors" size={16} />
            <input 
              type="text"
              placeholder="Search..."
              value={globalQuery}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams);
                if (e.target.value) newParams.set('q', e.target.value);
                else newParams.delete('q');
                setSearchParams(newParams);
              }}
              className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-[var(--adm-bg)] border border-transparent focus:border-accent/20 focus:bg-[var(--adm-card-bg)] rounded-xl text-sm font-bold outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 md:mx-0 md:px-0 lg:flex-wrap lg:pb-0">
            {/* Category Filter */}
            <select 
              value={categoryId || ''}
              onChange={(e) => {
                const val = e.target.value;
                const newParams = new URLSearchParams(searchParams);
                if (val) newParams.set('category', val);
                else newParams.delete('category');
                setSearchParams(newParams);
              }}
              className="px-3 py-2.5 bg-[var(--adm-bg)] border border-transparent focus:border-accent/20 focus:bg-[var(--adm-card-bg)] rounded-xl text-[9px] md:text-xs font-black uppercase tracking-widest outline-none transition-all cursor-pointer min-w-[110px] md:min-w-[140px] shrink-0"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {/* Price Range */}
            <div className="flex items-center gap-1.5 bg-[var(--adm-bg)] px-2.5 py-1 rounded-xl border border-transparent focus-within:border-accent/20 focus-within:bg-[var(--adm-card-bg)] transition-all shrink-0">
              <span className="text-[9px] font-black text-[var(--adm-text-secondary)] uppercase">৳</span>
              <input 
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-10 md:w-16 bg-transparent py-2 text-[9px] md:text-xs font-black outline-none"
              />
              <span className="text-gray-300">-</span>
              <input 
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-10 md:w-16 bg-transparent py-2 text-[9px] md:text-xs font-black outline-none"
              />
            </div>

            {/* Sort & Stock as smaller selects */}
            <select 
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="px-3 py-2.5 bg-[var(--adm-bg)] border border-transparent focus:border-accent/20 focus:bg-[var(--adm-card-bg)] rounded-xl text-[9px] md:text-xs font-black uppercase tracking-widest outline-none transition-all cursor-pointer shrink-0"
            >
              <option value="all">Stock</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out</option>
            </select>

            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 bg-[var(--adm-bg)] border border-transparent focus:border-accent/20 focus:bg-[var(--adm-card-bg)] rounded-xl text-[9px] md:text-xs font-black uppercase tracking-widest outline-none transition-all cursor-pointer shrink-0"
            >
              <option value="newest">New</option>
              <option value="price-low">Low $</option>
              <option value="price-high">High $</option>
            </select>

            {(categoryId || globalQuery || priceRange.min || priceRange.max || stockStatus !== 'all') && (
              <button 
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2.5 bg-red-50 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-100 transition-all shrink-0"
              >
                <X size={12} strokeWidth={3} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[var(--adm-card-bg)] rounded-[2rem] shadow-xl shadow-primary/5 border-2 border-[var(--adm-border)] overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--adm-bg)] border-b-2 border-[var(--adm-border)]">
              <tr>
                <th className="px-6 py-3 font-black text-[var(--adm-text-primary)] text-[10px] uppercase tracking-[0.2em] border-r border-[var(--adm-border)] last:border-r-0">Product Details</th>
                <th className="px-6 py-3 font-black text-[var(--adm-text-primary)] text-[10px] uppercase tracking-[0.2em] border-r border-[var(--adm-border)] last:border-r-0">Inventory Status</th>
                <th className="px-6 py-3 font-black text-[var(--adm-text-primary)] text-[10px] uppercase tracking-[0.2em] text-right border-r border-[var(--adm-border)] last:border-r-0">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {filteredProducts.map(product => {
                const images = JSON.parse(product.images || '[]');
                const mainImage = images[0] || '';
                
                return (
                  <tr 
                    key={product.id} 
                    className="hover:bg-[var(--adm-bg)]/50 transition-colors group"
                  >
                    <td 
                      className="px-6 py-3 border-r border-gray-50 last:border-r-0 cursor-pointer"
                      onClick={() => navigate(`/adm/products/${product.id}/buyers`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                          {mainImage ? (
                            <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-black text-[var(--adm-text-secondary)] text-[10px]">NO IMG</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[var(--adm-text-primary)] group-hover:text-accent transition-colors">{product.title}</div>
                          <div className="text-xs text-[var(--adm-text-secondary)] font-medium">৳{product.price} • {product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td 
                      className="px-6 py-3 border-r border-gray-50 last:border-r-0 cursor-pointer"
                      onClick={() => navigate(`/adm/products/${product.id}/buyers`)}
                    >
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
                          className="p-2 text-[var(--adm-text-secondary)] hover:text-[var(--adm-text-primary)] transition-colors hover:bg-[var(--adm-card-bg)] rounded-lg shadow-sm border border-transparent hover:border-[var(--adm-border)]"
                          title="Edit Product"
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
                          className="p-2 text-[var(--adm-text-secondary)] hover:text-red-500 transition-colors hover:bg-[var(--adm-card-bg)] rounded-lg shadow-sm border border-transparent hover:border-[var(--adm-border)]"
                          title="Delete Product"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredProducts.map(product => {
            const images = JSON.parse(product.images || '[]');
            const mainImage = images[0] || '';
            
            return (
              <div 
                key={product.id} 
                className="p-4 hover:bg-[var(--adm-bg)] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(`/adm/products/${product.id}/buyers`)}
                  >
                    {mainImage ? (
                      <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-[var(--adm-text-secondary)] text-[8px]">NO IMG</span>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div 
                      className="cursor-pointer group"
                      onClick={() => navigate(`/adm/products/${product.id}/buyers`)}
                    >
                      <div className="font-bold text-[var(--adm-text-primary)] truncate group-hover:text-accent transition-colors">{product.title}</div>
                      <div className="text-xs text-[var(--adm-text-secondary)] font-medium mb-2">৳{product.price} • {product.brand}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${product.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                          className="p-2 text-[var(--adm-text-secondary)] hover:text-[var(--adm-text-primary)] transition-colors bg-[var(--adm-card-bg)] border border-[var(--adm-border)] rounded-lg shadow-sm active:scale-95"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure?')) onDelete(product.id);
                          }}
                          className="p-2 text-[var(--adm-text-secondary)] hover:text-red-500 transition-colors bg-[var(--adm-card-bg)] border border-[var(--adm-border)] rounded-lg shadow-sm active:scale-95"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="px-8 py-20 text-center">
            <div className="w-16 h-16 bg-[var(--adm-bg)] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-black text-[var(--adm-text-primary)]">No Products Found</h3>
            <p className="text-sm text-[var(--adm-text-secondary)] font-bold uppercase tracking-widest mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};
