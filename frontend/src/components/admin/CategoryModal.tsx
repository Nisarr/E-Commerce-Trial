import React, { useState, useEffect } from 'react';
import { X, Loader2, FolderOpen, CheckCircle2 } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import type { Category } from '../../types';

interface CategoryModalProps {
  category?: Category | null;
  onClose: () => void;
  onSave: (category: Partial<Category>) => Promise<void>;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ category, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    image: '',
    isActive: 1,
    isFeatured: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (category) {
      const isDifferent = 
        formData.name !== category.name ||
        formData.image !== category.image ||
        formData.isActive !== category.isActive ||
        formData.isFeatured !== category.isFeatured;
      
      if (isDifferent) {
        Promise.resolve().then(() => {
          setFormData({
            name: category.name,
            image: category.image,
            isActive: category.isActive,
            isFeatured: category.isFeatured,
          });
        });
      }
    }
  }, [category, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Category Name is required');
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-primary/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 flex flex-col border border-primary/5">
        
        {/* Vivid Header */}
        <div className="p-8 pb-4 flex justify-between items-start bg-gradient-to-b from-gray-50/50 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shadow-inner">
              <FolderOpen size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-primary tracking-tight leading-none">{category ? 'Edit Category' : 'New Category'}</h2>
              <p className="text-[11px] font-extrabold text-accent uppercase tracking-[0.2em] mt-1.5 opacity-80">Collection Workspace</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 hover:bg-red-50 hover:text-red-500 rounded-xl text-muted transition-all duration-300"
          >
            <X size={22} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-7">
          <div className="space-y-6">
            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-primary uppercase tracking-widest ml-1 opacity-70">Category Identity</label>
              <input 
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-50/80 border-2 border-gray-200 rounded-2xl px-6 py-4 text-base font-bold text-primary focus:border-accent focus:bg-white transition-all outline-none placeholder:text-gray-300 shadow-sm"
                placeholder="e.g. Toys & Playtime"
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-primary uppercase tracking-widest ml-1 opacity-70">Visual Identity</label>
              <div className="relative group aspect-[16/10] rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50/50 transition-all hover:border-accent/50 hover:bg-white shadow-sm">
                {formData.image ? (
                  <>
                    <img src={formData.image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[3px]">
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="bg-white text-primary text-[12px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-accent hover:text-white transition-all shadow-2xl scale-90 group-hover:scale-100 duration-300"
                      >
                        Replace Image
                      </button>
                    </div>
                  </>
                ) : (
                  <ImageUpload 
                    onUploadSuccess={(url) => setFormData({ ...formData, image: url })}
                    compact
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-3 p-4 bg-primary/[0.02] rounded-2xl border-2 border-gray-100">
                 <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Visible</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black text-primary">Live Status</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: formData.isActive === 1 ? 0 : 1 })}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${formData.isActive === 1 ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${formData.isActive === 1 ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                 </div>
              </div>

              <div className="flex flex-col gap-3 p-4 bg-primary/[0.02] rounded-2xl border-2 border-gray-100">
                 <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${formData.isFeatured ? 'bg-accent animate-bounce' : 'bg-gray-400'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Featured</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black text-primary">Home Page</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isFeatured: formData.isFeatured === 1 ? 0 : 1 })}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${formData.isFeatured === 1 ? 'bg-accent' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${formData.isFeatured === 1 ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4.5 bg-gray-100 text-primary/60 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-gray-200 transition-all border border-transparent hover:border-gray-300"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSaving}
              className="flex-[2] py-4.5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-[#0f172a] hover:-translate-y-1 transition-all shadow-[0_15px_30px_-10px_rgba(15,23,42,0.4)] flex items-center justify-center gap-3 active:scale-95"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} strokeWidth={2.5} />
              )}
              {category ? 'Update Records' : 'Finalize Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
