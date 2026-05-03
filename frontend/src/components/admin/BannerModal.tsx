import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import type { Banner } from '../../types';

interface BannerModalProps {
  banner?: Banner | null;
  onClose: () => void;
  onSave: (banner: Omit<Banner, 'id'>) => Promise<void>;
}

export const BannerModal: React.FC<BannerModalProps> = ({ banner, onClose, onSave }) => {
  const [formData, setFormData] = useState<Omit<Banner, 'id'>>({
    image: '',
    link: '',
    position: 'hero',
    order: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (banner) {
      setFormData({
        image: banner.image,
        link: banner.link,
        position: banner.position,
        order: banner.order,
      });
    }
  }, [banner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert('Please upload an image');
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save banner');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-primary">{banner ? 'Edit Banner' : 'Add New Banner'}</h2>
            <p className="text-xs font-bold text-muted uppercase tracking-widest mt-1">Banner Details</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white rounded-2xl text-muted hover:text-primary transition-all shadow-sm"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <ImageUpload 
            label="Banner Image" 
            onUploadSuccess={(url) => setFormData({ ...formData, image: url })} 
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-primary uppercase tracking-widest">Position</label>
              <select 
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:border-accent focus:bg-white transition-all outline-none"
              >
                <option value="hero">Hero Slider</option>
                <option value="mid-1">Middle Section 1</option>
                <option value="mid-2">Middle Section 2</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-primary uppercase tracking-widest">Display Order</label>
              <input 
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:border-accent focus:bg-white transition-all outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-primary uppercase tracking-widest">Target Link (Optional)</label>
            <input 
              type="text"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:border-accent focus:bg-white transition-all outline-none"
              placeholder="/category/baby-pens"
            />
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
                'Save Banner'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
