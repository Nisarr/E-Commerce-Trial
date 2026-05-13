import React, { useState, useEffect } from 'react';
import { Gift, Save, ToggleRight, ToggleLeft } from 'lucide-react';
import { premiumAction } from '../premiumAction';

export const PopupPreview: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch('/api/v1/popup').then(r => r.json()).then(d => setSettings(d)).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin text-primary">⏳</div></div>;
  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between gap-4">
        <div><h1 className="text-2xl md:text-3xl font-black text-primary">Popup Manager</h1><p className="text-muted font-medium text-sm">Configure the promotional popup shown to new visitors</p></div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${settings.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>{settings.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}{settings.isActive ? 'Active' : 'Disabled'}</div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 space-y-6">
          <div className="space-y-1.5"><label className="text-xs font-black text-primary uppercase tracking-widest">Title</label><div className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 text-sm">{settings.title || 'No title'}</div></div>
          <div className="space-y-1.5"><label className="text-xs font-black text-primary uppercase tracking-widest">Description</label><div className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 text-sm min-h-[80px]">{settings.description || 'No description'}</div></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-xs font-black text-primary uppercase tracking-widest">Button Text</label><div className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 text-sm">{settings.buttonText || 'N/A'}</div></div>
            <div className="space-y-1.5"><label className="text-xs font-black text-primary uppercase tracking-widest">Link</label><div className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 text-sm truncate">{settings.link || 'N/A'}</div></div>
          </div>
          <button onClick={() => premiumAction('Editing popup settings')} className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20"><Save size={20} /> Save Changes</button>
        </div>
        <div className="space-y-4">
          <label className="text-xs font-black text-primary uppercase tracking-widest">Live Preview</label>
          <div className="bg-gray-100 rounded-[3rem] p-8 border-4 border-white shadow-inner flex items-center justify-center min-h-[400px] relative overflow-hidden">
            <div className="w-full max-w-sm bg-white rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="h-32 bg-gradient-to-br from-primary to-accent flex items-center justify-center">{settings.imageUrl ? <img src={settings.imageUrl} alt="" className="w-full h-full object-cover" /> : <Gift size={48} className="text-white animate-bounce" />}</div>
              <div className="p-6 text-center"><h3 className="text-xl font-bold text-gray-900 mb-2">{settings.title || 'Title'}</h3><p className="text-gray-500 text-sm mb-6">{settings.description || 'Description'}</p><div className="w-full py-3 bg-primary text-white font-bold rounded-xl">{settings.buttonText || 'Button'}</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
