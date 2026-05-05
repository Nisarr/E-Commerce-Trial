import React, { useState, useEffect } from 'react';
import { X, Loader2, Trash2, Package, Tag, DollarSign, Box, Image as ImageIcon } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { getCategories } from '../../services/api';
import type { Product, Category } from '../../types';

interface ProductModalProps {
  product?: Product | null;
  onClose: () => void;
  onSave: (product: Partial<Product>) => Promise<void>;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    title: '',
    brand: '',
    price: 0,
    salePrice: null,
    stock: 0,
    categoryId: '',
    images: '[]',
    tags: '[]',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to fetch categories');
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        brand: product.brand,
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock,
        categoryId: product.categoryId,
        images: product.images,
        tags: product.tags,
      });
      try {
        setImages(JSON.parse(product.images || '[]'));
        setTags(JSON.parse(product.tags || '[]'));
      } catch (e) {
        setImages([]);
        setTags([]);
      }
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      alert('Title and Price are required');
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        images: JSON.stringify(images),
        tags: JSON.stringify(tags),
      });
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 bg-primary/20 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 max-h-[95vh] flex flex-col border border-white/40">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100/50 flex justify-between items-center bg-gradient-to-br from-gray-50 via-white to-white flex-shrink-0 relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          
          <div className="flex items-center gap-5 relative">
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shadow-inner">
              <Package size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-primary tracking-tight leading-none mb-2">{product ? 'Refine Masterpiece' : 'Create New Product'}</h2>
              <div className="flex items-center gap-2">
                <span className="h-0.5 w-6 bg-accent rounded-full" />
                <p className="text-[10px] font-black text-muted/50 uppercase tracking-[0.2em]">Inventory Management Portal</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3.5 hover:bg-gray-100 rounded-2xl text-muted hover:text-accent transition-all shadow-sm hover:rotate-90 duration-500 bg-white border border-gray-50"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow overflow-hidden flex flex-col">
          <div className="flex-grow overflow-y-auto p-8 custom-scrollbar space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              
              {/* Left Column: Basic Info */}
              <div className="lg:col-span-3 space-y-10">
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-primary flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/5 rounded-lg flex items-center justify-center">
                      <Box size={20} className="text-primary" />
                    </div>
                    Basic Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-muted/60 uppercase tracking-widest ml-1">Product Title</label>
                      <input 
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-gray-50/80 border-2 border-gray-100 rounded-2xl px-6 py-4 text-base font-bold text-primary focus:border-accent/30 focus:bg-white focus:ring-[10px] focus:ring-accent/5 transition-all outline-none placeholder:text-gray-300 shadow-sm border-b-accent/10"
                        placeholder="e.g. Premium Foldable Baby PlayPen"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-muted/60 uppercase tracking-widest ml-1">Brand Name</label>
                        <input 
                          type="text"
                          value={formData.brand || ''}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          className="w-full bg-gray-50/80 border-2 border-gray-100 rounded-2xl px-6 py-4 text-base font-bold text-primary focus:border-accent/30 focus:bg-white focus:ring-[10px] focus:ring-accent/5 transition-all outline-none placeholder:text-gray-300 shadow-sm border-b-accent/10"
                          placeholder="PlayPen House"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-muted/60 uppercase tracking-widest ml-1">Category</label>
                        <div className="relative">
                          <select 
                            value={formData.categoryId || ''}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            className="w-full bg-gray-50/80 border-2 border-gray-100 rounded-2xl px-6 py-4 text-base font-bold text-primary focus:border-accent/30 focus:bg-white focus:ring-[10px] focus:ring-accent/5 transition-all outline-none appearance-none shadow-sm cursor-pointer border-b-accent/10"
                          >
                            <option value="">Choose a category</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted/40">
                            <Tag size={18} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-black text-primary flex items-center gap-3">
                    <div className="w-9 h-9 bg-accent/5 rounded-lg flex items-center justify-center">
                      <DollarSign size={20} className="text-accent" />
                    </div>
                    Pricing & Inventory
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-muted/60 uppercase tracking-widest ml-1">Base Price (৳)</label>
                      <input 
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-gray-50/80 border-2 border-gray-100 rounded-2xl px-6 py-4 text-base font-black text-primary focus:border-accent/30 focus:bg-white focus:ring-[10px] focus:ring-accent/5 transition-all outline-none shadow-sm border-b-accent/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-muted/60 uppercase tracking-widest ml-1">Sale Price</label>
                      <input 
                        type="number"
                        value={formData.salePrice || ''}
                        onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || null })}
                        className="w-full bg-accent/[0.03] border-2 border-accent/20 rounded-2xl px-6 py-4 text-base font-black text-accent focus:border-accent/40 focus:bg-white focus:ring-[10px] focus:ring-accent/5 transition-all outline-none shadow-sm border-b-accent/30"
                        placeholder="Optional"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-muted/60 uppercase tracking-widest ml-1">Stock Level</label>
                      <input 
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                        className="w-full bg-gray-50/80 border-2 border-gray-100 rounded-2xl px-6 py-4 text-base font-black text-primary focus:border-accent/30 focus:bg-white focus:ring-[10px] focus:ring-accent/5 transition-all outline-none shadow-sm border-b-accent/10"
                      />
                    </div>
                  </div>

                  {/* Special Offer Toggle */}
                  <div className="bg-orange-50/50 border-2 border-orange-100/50 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                        <Tag size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-black text-primary uppercase tracking-wider">Special Offer</div>
                        <div className="text-[10px] font-bold text-orange-600/70 uppercase">Featured in countdown section</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (tags.includes('special-offer')) {
                          setTags(tags.filter(t => t !== 'special-offer'));
                        } else {
                          setTags([...tags, 'special-offer']);
                        }
                      }}
                      className={`w-14 h-8 rounded-full transition-all relative ${tags.includes('special-offer') ? 'bg-orange-500' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${tags.includes('special-offer') ? 'right-1' : 'left-1 shadow-sm'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Media & Tags */}
              <div className="lg:col-span-2 space-y-10">
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-primary flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/5 rounded-lg flex items-center justify-center">
                      <ImageIcon size={20} className="text-primary" />
                    </div>
                    Product Media
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {images.map((url, i) => (
                      <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm transition-all hover:shadow-lg hover:scale-[1.05]">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <button 
                            type="button"
                            onClick={() => removeImage(i)}
                            className="w-10 h-10 bg-accent text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {images.length < 6 && (
                      <div className="aspect-square">
                        <ImageUpload 
                          onUploadSuccess={(url) => setImages([...images, url])}
                          compact
                          multiple={true}
                        />
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-1.5 bg-gray-50 rounded-full inline-block mx-auto">
                    <p className="text-[9px] font-black text-muted/40 uppercase tracking-[0.2em] text-center">Max 6 High-Fidelity Assets • PNG/JPG</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-black text-primary flex items-center gap-3">
                    <div className="w-9 h-9 bg-accent/5 rounded-lg flex items-center justify-center">
                      <Tag size={20} className="text-accent" />
                    </div>
                    Product Tags
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-grow bg-gray-50/80 border-2 border-gray-100 rounded-xl px-5 py-3.5 text-sm font-bold text-primary focus:border-accent/30 focus:bg-white focus:ring-[10px] focus:ring-accent/5 transition-all outline-none shadow-sm border-b-accent/10"
                        placeholder="Add tag (e.g. Bestseller)"
                      />
                      <button 
                        type="button"
                        onClick={addTag}
                        className="px-5 bg-accent/10 text-accent rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-accent hover:text-white transition-all shadow-sm"
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, i) => (
                        <span key={i} className="px-4 py-2 bg-white border-2 border-gray-100 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 group shadow-sm hover:border-accent/20 transition-colors">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="text-muted hover:text-accent transition-colors">
                            <X size={12} strokeWidth={3} />
                          </button>
                        </span>
                      ))}
                      {tags.length === 0 && (
                        <div className="w-full p-6 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center">
                          <p className="text-[10px] text-muted/30 italic font-bold uppercase tracking-widest">No tags established yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-100 bg-white/50 backdrop-blur-md flex gap-4 flex-shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 bg-white border-2 border-gray-200 text-muted rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-gray-50 hover:text-primary hover:border-accent/30 transition-all shadow-sm active:scale-95"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSaving}
              className="flex-[2] px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary/90 hover:-translate-y-1 hover:shadow-[0_15px_30px_-8px_rgba(15,23,42,0.3)] active:translate-y-0 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Package size={18} className="group-hover:rotate-12 transition-transform" />
                  {product ? 'Sync Updates' : 'Commit Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
