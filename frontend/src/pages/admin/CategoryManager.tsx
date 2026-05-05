import React, { useState } from 'react';
import { Eye, Edit3, Trash2, MoreVertical, Package, CheckCircle2, EyeOff, ExternalLink, Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Category, Product } from '../../types';

interface CategoryManagerProps {
  categories: Category[];
  products: Product[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, products, onEdit, onDelete }) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(query.toLowerCase()) ||
    cat.slug.toLowerCase().includes(query.toLowerCase())
  );

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/adm/products?category=${categoryId}`);
  };

  const getStats = (categoryId: string) => {
    const catProducts = products.filter(p => p.categoryId === categoryId);
    const total = catProducts.length;
    const visible = catProducts.filter(p => p.isActive === 1).length;
    const hidden = total - visible;
    return { total, visible, hidden };
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-2 border-gray-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b-2 border-gray-100">
          <tr>
            <th className="px-6 py-3 font-black text-primary text-[10px] uppercase tracking-[0.2em] border-r border-gray-100 last:border-r-0">Collection Details</th>
            <th className="px-6 py-3 font-black text-primary text-[10px] uppercase tracking-[0.2em] border-r border-gray-100 last:border-r-0">Inventory Stats</th>
            <th className="px-6 py-3 font-black text-primary text-[10px] uppercase tracking-[0.2em] text-center border-r border-gray-100 last:border-r-0">Visibility</th>
            <th className="px-6 py-3 font-black text-primary text-[10px] uppercase tracking-[0.2em] text-right border-r border-gray-100 last:border-r-0">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-gray-100">
          {filteredCategories.map(category => {
            const stats = getStats(category.id);
            return (
              <tr key={category.id} className="hover:bg-gray-50/50 transition-all group">
                <td className="px-6 py-3 border-r border-gray-50 last:border-r-0">
                  <div 
                    className="flex items-center gap-5 cursor-pointer group/link"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <div className="relative group/img">
                      <img 
                        src={category.image || 'https://placehold.co/100x100/f8fafc/64748b?text=No+Img'} 
                        alt="" 
                        className="w-12 h-12 object-cover rounded-xl shadow-sm group-hover/img:scale-110 transition-all duration-500 border-2 border-white" 
                      />
                      <div className="absolute inset-0 rounded-2xl border border-primary/5 group-hover/img:border-accent/20 transition-colors" />
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center scale-0 group-hover/link:scale-100 transition-transform duration-300 shadow-lg">
                        <ExternalLink size={12} strokeWidth={3} />
                      </div>
                    </div>
                    <div>
                      <div className="font-black text-primary text-base tracking-tight group-hover/link:text-accent transition-colors">{category.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-[10px] font-bold text-muted uppercase tracking-widest">ID: {category.id.slice(0, 8)}...</div>
                        <span className="w-1 h-1 rounded-full bg-gray-200" />
                        <span className="text-[10px] font-black text-accent opacity-0 group-hover/link:opacity-100 transition-opacity">VIEW PRODUCTS</span>
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-3 border-r border-gray-50 last:border-r-0">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                        <Package size={12} className="text-primary/40" /> Total
                      </span>
                      <span className="text-xl font-black text-primary">{stats.total}</span>
                    </div>
                    <div className="h-8 w-px bg-gray-100" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-green-600/60 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                        <CheckCircle2 size={12} className="text-green-500/40" /> Active
                      </span>
                      <span className="text-xl font-black text-green-600">{stats.visible}</span>
                    </div>
                    <div className="h-8 w-px bg-gray-100" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-orange-600/60 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                        <EyeOff size={12} className="text-orange-500/40" /> Hidden
                      </span>
                      <span className="text-xl font-black text-orange-600">{stats.hidden}</span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-3 border-r border-gray-50 last:border-r-0">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${category.isActive ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}`} />
                      <span className={`text-[11px] font-black uppercase tracking-widest ${category.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                        {category.isActive ? 'Public' : 'Private'}
                      </span>
                    </div>
                    {category.isFeatured === 1 && (
                      <span className="px-2.5 py-1 bg-accent/10 text-accent text-[9px] font-black uppercase tracking-widest rounded-lg border border-accent/20">
                        Featured
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-3 text-right relative">
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === category.id ? null : category.id)}
                    className="p-3 hover:bg-gray-100 rounded-xl transition-all text-muted hover:text-primary active:scale-95"
                  >
                    <MoreVertical size={20} />
                  </button>

                  {openMenuId === category.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-8 top-16 w-48 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-2 space-y-1">
                          <button 
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-primary hover:bg-gray-50 rounded-xl transition-all group"
                            onClick={() => { setOpenMenuId(null); /* handle view */ }}
                          >
                            <Eye size={16} className="text-muted group-hover:text-primary" />
                            VIEW PAGE
                          </button>
                          <button 
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-primary hover:bg-gray-50 rounded-xl transition-all group"
                            onClick={() => { setOpenMenuId(null); onEdit(category); }}
                          >
                            <Edit3 size={16} className="text-muted group-hover:text-accent" />
                            EDIT RECORD
                          </button>
                          <div className="h-px bg-gray-50 my-1" />
                          <button 
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-red-500 hover:bg-red-50 rounded-xl transition-all group"
                            onClick={() => { 
                              setOpenMenuId(null); 
                              if (confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
                                onDelete(category.id);
                              }
                            }}
                          >
                            <Trash2 size={16} className="text-red-400 group-hover:text-red-600" />
                            DELETE PERMANENTLY
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
          {filteredCategories.length === 0 && (
            <tr>
              <td colSpan={4} className="px-8 py-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                  <Search size={32} />
                </div>
                <h3 className="text-lg font-black text-primary">No Collections Found</h3>
                <p className="text-sm text-muted font-bold uppercase tracking-widest mt-1">Try adjusting your search query</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
