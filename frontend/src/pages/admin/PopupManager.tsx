import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle, AlertCircle, Gift, Link as LinkIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { getPopupSettings, updatePopupSettings, getProducts } from '../../services/api';
import type { PopupSettings, Product } from '../../types';
import { ImageUpload } from '../../components/admin/ImageUpload';

export const PopupManager: React.FC = () => {
  const [settings, setSettings] = useState<PopupSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [popupData, productsData] = await Promise.all([
        getPopupSettings(),
        getProducts({ limit: 100 })
      ]);
      setSettings(popupData);
      setProducts(productsData.items);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMessage({ type: 'error', text: 'Failed to load settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      await updatePopupSettings(settings);
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-muted font-medium">Loading popup settings...</p>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 md:px-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-primary">Popup Manager</h1>
          <p className="text-muted font-medium text-[10px] md:text-sm">Configure the promotional popup shown to new visitors</p>
        </div>
        <div className={`w-fit flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[10px] md:text-sm ${settings.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
          {settings.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          {settings.isActive ? 'Active' : 'Disabled'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 border border-gray-100">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-primary uppercase tracking-widest">Status</label>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, isActive: settings.isActive ? 0 : 1 })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.isActive ? 'bg-primary' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-primary uppercase tracking-widest ml-1">Popup Title</label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                  placeholder="Special Offer! 🎉"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-primary uppercase tracking-widest ml-1">Description</label>
                <textarea
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none"
                  placeholder="Get Free Shipping on all orders over ৳5000..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-primary uppercase tracking-widest ml-1">Button Text</label>
                  <input
                    type="text"
                    value={settings.buttonText}
                    onChange={(e) => setSettings({ ...settings, buttonText: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                    placeholder="Claim Now"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-primary uppercase tracking-widest ml-1">Button Link</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={settings.link}
                      onChange={(e) => setSettings({ ...settings, link: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                      placeholder="/products or https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-primary uppercase tracking-widest ml-1">Product Quick Link</label>
                <select
                  onChange={(e) => setSettings({ ...settings, link: `/product/${e.target.value}` })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all bg-white"
                >
                  <option value="">Select a product to link...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.slug}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-primary uppercase tracking-widest ml-1">Image URL (Optional)</label>
                <ImageUpload 
                  label="Upload Popup Image" 
                  onUploadSuccess={(url) => setSettings({ ...settings, imageUrl: url })}
                />
                {settings.imageUrl && (
                  <div className="relative mt-2 rounded-2xl overflow-hidden border border-gray-100 group">
                    <img src={settings.imageUrl} alt="Preview" className="w-full h-32 object-cover" />
                    <button 
                      type="button"
                      onClick={() => setSettings({ ...settings, imageUrl: null })}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            {message && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="text-sm font-bold">{message.text}</span>
              </div>
            )}
          </form>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <label className="text-xs font-black text-primary uppercase tracking-widest ml-1">Live Preview</label>
          <div className="md:sticky md:top-8 bg-gray-100 rounded-[2rem] md:rounded-[3rem] p-4 md:p-8 border-4 border-white shadow-inner flex items-center justify-center min-h-[400px] md:min-h-[500px] overflow-hidden">
             {/* Simulating the popup inside a container */}
             <div className="relative w-full max-w-sm bg-white rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl scale-90 md:scale-100 origin-center">
                <button className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full">
                  <X size={16} className="text-gray-400" />
                </button>

                <div className="relative h-32 bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                  <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-xl" />
                  {settings.imageUrl ? (
                    <img src={settings.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Gift size={48} className="text-white animate-bounce" />
                  )}
                </div>

                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{settings.title || 'Your Title Here'}</h3>
                  <p className="text-gray-500 text-sm mb-6 leading-relaxed line-clamp-3">
                    {settings.description || 'Your description will appear here. This is a preview of how it looks to users.'}
                  </p>
                  <div className="space-y-2">
                    <div className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-md">
                      {settings.buttonText || 'Button Text'}
                    </div>
                    <div className="text-xs text-gray-400 font-medium">No thanks, I'll close this</div>
                  </div>
                </div>
             </div>

             {/* Blur background simulation */}
             <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] -z-10" />
          </div>
          <p className="text-center text-xs text-muted font-medium italic">
            This is a simulated preview. The real popup will have a stronger background blur.
          </p>
        </div>
      </div>
    </div>
  );
};

const X = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
