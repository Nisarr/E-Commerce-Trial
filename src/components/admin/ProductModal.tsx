import React, { useState, useEffect } from 'react';
import { X, Loader2, Trash2 } from 'lucide-react';
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
      } catch (e) {
        setImages([]);
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

  return (
    <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-black text-primary">{product ? 'Edit Product' : 'Add New Product'}</h2>
            <p className="text-xs font-bold text-muted uppercase tracking-widest mt-1">Product Details & Inventory</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white rounded-2xl text-muted hover:text-primary transition-all shadow-sm"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-primary uppercase tracking-widest">Product Title</label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:border-accent focus:bg-white transition-all outline-none"
                  placeholder="Premium Baby PlayPen"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-primary uppercase tracking-widest">Brand</label>
                  <input 
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:border-accent focus:bg-white transition-all outline-none"
                    placeholder="PlayPen House"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-primary uppercase tracking-widest">Category</label>
                  <select 
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:border-accent focus:bg-white transition-all outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-primary uppercase tracking-widest">Price (৳)</label>
                  <input 
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:border-accent focus:bg-white transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-primary uppercase tracking-widest">Sale Price (Optional)</label>
                  <input 
                    type="number"
                    value={formData.salePrice || ''}
                    onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || null })}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:border-accent focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-primary uppercase tracking-widest">Stock Quantity</label>
                <input 
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:border-accent focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-primary uppercase tracking-widest">Product Images</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {images.map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {images.length < 6 && (
                    <div className="aspect-square">
                      <ImageUpload 
                        onUploadSuccess={(url) => setImages([...images, url])}
                        compact
                      />
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-tighter italic">Upload up to 6 premium quality images</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black text-primary uppercase tracking-widest">Tags (JSON)</label>
                <input 
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:border-accent focus:bg-white transition-all outline-none"
                  placeholder='["New Arrival", "Bestseller"]'
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-gray-100 text-primary rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSaving}
              className="flex-[2] px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                product ? 'Update Product' : 'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
