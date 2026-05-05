import React, { useState, useEffect } from 'react';
import { Tag, Trash2, Plus, Package, Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, updateProduct } from '../../services/api';
import type { Product } from '../../types';
import { SpecialOfferPriceModal } from '../../components/admin/SpecialOfferPriceModal';

export const SpecialOfferManager: React.FC = () => {
  const [offers, setOffers] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('q') || '';
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchOffers = async () => {
    try {
      const res = await getProducts({ tag: 'special-offer', limit: 100 });
      setOffers(res.items);
    } catch (err) {
      console.error('Failed to fetch special offers');
    }
  };

  const fetchAllProducts = async () => {
    try {
      const res = await getProducts({ limit: 100 });
      setAllProducts(res.items);
    } catch (err) {
      console.error('Failed to fetch products');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchOffers(), fetchAllProducts()]);
      setLoading(false);
    };
    init();
  }, []);

  const parseTags = (tags: any): string[] => {
    try {
      let tagsData = tags;
      while (typeof tagsData === 'string' && tagsData.trim() !== '') {
        const parsed = JSON.parse(tagsData);
        if (typeof parsed === 'string') {
          tagsData = parsed;
        } else {
          tagsData = parsed;
          break;
        }
      }
      return Array.isArray(tagsData) ? tagsData : [];
    } catch (e) {
      return [];
    }
  };

  const handleToggle = (product: Product) => {
    const currentTags = parseTags(product.tags);
    if (currentTags.includes('special-offer')) {
      // If already an offer, remove it directly
      removeFromOffers(product);
    } else {
      // If not an offer, open modal to set prices
      setSelectedProduct(product);
    }
  };

  const removeFromOffers = async (product: Product) => {
    try {
      const currentTags = parseTags(product.tags);
      const newTags = currentTags.filter(t => t !== 'special-offer');
      
      await updateProduct(product.id, {
        tags: JSON.stringify(newTags)
      });
      
      await Promise.all([fetchOffers(), fetchAllProducts()]);
    } catch (err) {
      alert('Failed to remove special offer');
    }
  };

  const addToOffers = async (price: number, salePrice: number) => {
    if (!selectedProduct) return;
    
    try {
      const currentTags = parseTags(selectedProduct.tags);
      const newTags = Array.from(new Set([...currentTags, 'special-offer']));
      
      await updateProduct(selectedProduct.id, {
        tags: JSON.stringify(newTags),
        price,
        salePrice
      });
      
      await Promise.all([fetchOffers(), fetchAllProducts()]);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Add to special offer error:', err);
      alert('Failed to add special offer');
    }
  };

  const filteredProducts = allProducts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOffers = offers.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-xl skeleton" />
            <div className="h-4 w-64 rounded skeleton" />
          </div>
          <div className="h-12 w-32 rounded-2xl skeleton" />
        </div>
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-primary/5 border border-gray-100 overflow-hidden">
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 w-full rounded-2xl border border-gray-50 skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tight mb-2">Special Offers</h2>
          <p className="text-muted font-medium">Manage products featured in the homepage countdown section.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
            isAdding ? 'bg-gray-100 text-primary' : 'bg-orange-500 text-white shadow-lg shadow-orange-200'
          }`}
        >
          {isAdding ? 'Close Selector' : <><Plus size={18} /> Add Products</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-primary/5 border border-orange-100 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
              <input 
                type="text"
                placeholder="Search products to add..."
                value={searchTerm}
                onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  if (e.target.value) newParams.set('q', e.target.value);
                  else newParams.delete('q');
                  setSearchParams(newParams);
                }}
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-200 focus:bg-white outline-none transition-all font-bold"
              />
            </div>
            {searchTerm && (
              <button 
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('q');
                  setSearchParams(newParams);
                }}
                className="flex items-center gap-2 px-4 py-4 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
              >
                <X size={18} strokeWidth={3} /> Clear
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredProducts.map(product => {
              const isOffer = offers.some(o => o.id === product.id);
              let imgs: string[] = [];
              try {
                imgs = typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []);
              } catch { imgs = []; }
              
              return (
                <div 
                  key={product.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    isOffer ? 'border-orange-500 bg-orange-50/30' : 'border-gray-100 hover:border-orange-200'
                  }`}
                >
                  <img src={imgs[0] || '/placeholder.jpg'} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                  <div className="flex-grow min-w-0">
                    <div className="font-bold text-primary truncate text-sm">{product.title}</div>
                    <div className="text-[10px] font-black text-muted uppercase tracking-widest">৳{product.price}</div>
                  </div>
                  <button 
                    onClick={() => handleToggle(product)}
                    className={`p-2 rounded-xl transition-all ${
                      isOffer ? 'bg-orange-500 text-white' : 'bg-gray-100 text-muted hover:bg-orange-100 hover:text-orange-600'
                    }`}
                  >
                    {isOffer ? <Trash2 size={16} /> : <Plus size={16} />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-primary/5 border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 font-black text-primary text-[10px] uppercase tracking-[0.2em]">Active Special Offers</th>
              <th className="px-8 py-5 font-black text-primary text-[10px] uppercase tracking-[0.2em]">Price</th>
              <th className="px-8 py-5 font-black text-primary text-[10px] uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredOffers.map(product => {
              let imgs: string[] = [];
              try {
                imgs = typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []);
              } catch { imgs = []; }

              return (
                <tr key={product.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                        <img src={imgs[0] || '/placeholder.jpg'} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-primary text-base">{product.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-[9px] font-black uppercase tracking-tighter">OFFER ACTIVE</span>
                          <span className="text-xs text-muted font-medium">{product.brand}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-base font-black text-primary">৳{product.salePrice || product.price}</span>
                      {product.salePrice && product.salePrice < product.price && (
                        <span className="text-xs text-muted line-through font-bold">৳{product.price}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-end">
                      <button 
                        onClick={() => removeFromOffers(product)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 size={14} /> Remove Offer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {offers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-200">
                      <Tag size={32} />
                    </div>
                    <div>
                      <p className="font-black text-primary uppercase tracking-widest text-sm">No special offers active</p>
                      <p className="text-xs text-muted font-medium mt-1">Click "Add Products" to feature items on the homepage.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="bg-orange-50/50 rounded-3xl p-6 border-2 border-dashed border-orange-200 flex items-center gap-6">
        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
          <Package size={24} />
        </div>
        <div>
          <h4 className="font-black text-primary text-xs uppercase tracking-widest">Display Logic</h4>
          <p className="text-xs text-muted font-medium mt-1">
            The homepage countdown section displays the <span className="font-bold text-orange-600">4 most recently added</span> special offers. 
            Ensure your featured products have a <span className="font-bold text-orange-600">Sale Price</span> set for maximum conversion.
          </p>
        </div>
      </div>

      {selectedProduct && (
        <SpecialOfferPriceModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSave={addToOffers}
        />
      )}
    </div>
  );
};
