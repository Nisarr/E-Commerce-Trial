import React, { useState, useEffect } from 'react';
import { Sparkles, Trash2, Plus, Loader2, Package, Search, Zap, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, updateProduct, syncTags } from '../../services/api';
import type { Product } from '../../types';

export const NewArrivalManager: React.FC = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('q') || '';
  const [syncing, setSyncing] = useState(false);

  const fetchData = async () => {
    try {
      const [taggedRes, allRes] = await Promise.all([
        getProducts({ tag: 'new-arrival', limit: 100 }),
        getProducts({ limit: 100 })
      ]);
      setItems(taggedRes.items);
      setAllProducts(allRes.items);
    } catch (err) {
      console.error('Failed to fetch new arrivals');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchData();
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

  const handleToggle = async (product: Product) => {
    try {
      const currentTags = parseTags(product.tags);
      let newTags: string[];
      
      if (currentTags.includes('new-arrival')) {
        newTags = currentTags.filter(t => t !== 'new-arrival');
      } else {
        newTags = Array.from(new Set([...currentTags, 'new-arrival']));
      }
      
      await updateProduct(product.id, {
        tags: JSON.stringify(newTags)
      });
      
      await fetchData();
    } catch (err) {
      alert('Failed to update new arrival status');
    }
  };

  const handleAutoSync = async () => {
    setSyncing(true);
    try {
      await syncTags('new-arrival', 8);
      await fetchData();
    } catch (err) {
      alert('Failed to auto-calculate new arrivals');
    } finally {
      setSyncing(false);
    }
  };

  const filteredProducts = allProducts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredItems = items.filter(p => 
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
          <h2 className="text-3xl font-black text-primary tracking-tight mb-2">New Arrival Products</h2>
          <p className="text-muted font-medium">Manage products featured in the "New Arrivals" section.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleAutoSync}
            disabled={syncing}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-200 hover:bg-emerald-600 disabled:opacity-50"
          >
            {syncing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
            Auto Calculate
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
              isAdding ? 'bg-gray-100 text-primary' : 'bg-orange-500 text-white shadow-lg shadow-orange-200 hover:bg-orange-600'
            }`}
          >
            {isAdding ? 'Close Selector' : <><Plus size={18} /> Force Products</>}
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-primary/5 border border-orange-100 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
              <input 
                type="text"
                placeholder="Search products to force into New Arrivals..."
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
              const isTagged = items.some(o => o.id === product.id);
              let imgs: string[] = [];
              try {
                imgs = typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []);
              } catch { imgs = []; }
              
              return (
                <div 
                  key={product.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    isTagged ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-100 hover:border-emerald-200'
                  }`}
                >
                  <img src={imgs[0] || '/placeholder.jpg'} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                  <div className="flex-grow min-w-0">
                    <div className="font-bold text-primary truncate text-sm">{product.title}</div>
                    <div className="text-[10px] font-black text-muted uppercase tracking-widest">Added: {new Date(product.createdAt || 0).toLocaleDateString()}</div>
                  </div>
                  <button 
                    onClick={() => handleToggle(product)}
                    className={`p-2 rounded-xl transition-all ${
                      isTagged ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-muted hover:bg-emerald-100 hover:text-emerald-600'
                    }`}
                  >
                    {isTagged ? <Trash2 size={16} /> : <Plus size={16} />}
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
              <th className="px-8 py-5 font-black text-primary text-[10px] uppercase tracking-[0.2em]">Active New Arrivals</th>
              <th className="px-8 py-5 font-black text-primary text-[10px] uppercase tracking-[0.2em]">Added Date</th>
              <th className="px-8 py-5 font-black text-primary text-[10px] uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredItems.map(product => {
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
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[9px] font-black uppercase tracking-tighter">NEW ARRIVAL</span>
                          <span className="text-xs text-muted font-medium">{product.brand}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-base font-black text-primary">{new Date(product.createdAt || 0).toLocaleDateString()}</span>
                      <span className="text-[10px] text-muted font-bold uppercase tracking-widest">arrival date</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-end">
                      <button 
                        onClick={() => handleToggle(product)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 size={14} /> Remove Tag
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-200">
                      <Sparkles size={32} />
                    </div>
                    <div>
                      <p className="font-black text-primary uppercase tracking-widest text-sm">No new arrivals tagged</p>
                      <p className="text-xs text-muted font-medium mt-1">Click "Auto Calculate" or "Force Products" to add items.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="bg-emerald-50/50 rounded-3xl p-6 border-2 border-dashed border-emerald-200 flex items-center gap-6">
        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
          <Package size={24} />
        </div>
        <div>
          <h4 className="font-black text-primary text-xs uppercase tracking-widest">Logic & Ranking</h4>
          <p className="text-xs text-muted font-medium mt-1">
            "Auto Calculate" picks the <span className="font-bold text-emerald-600">8 most recently added products</span>. 
            You can manually "Force" any product to be a New Arrival.
          </p>
        </div>
      </div>
    </div>
  );
};
