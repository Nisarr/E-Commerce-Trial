import { Edit3, Trash2 } from 'lucide-react';
import type { Banner } from '../../types';

interface BannerManagerProps {
  banners: Banner[];
  onEdit: (banner: Banner) => void;
  onDelete: (id: string) => void;
}

export const BannerManager: React.FC<BannerManagerProps> = ({ banners, onEdit, onDelete }) => {
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      onDelete(id);
    }
  };

  return (
    <div className="bg-[var(--adm-card-bg)] md:rounded-[2rem] md:shadow-xl md:shadow-primary/5 md:border border-[var(--adm-border)] overflow-hidden">
      {/* Desktop Table View */}
      <table className="w-full text-left hidden md:table">
        <thead className="bg-[var(--adm-bg)]/50 border-b border-[var(--adm-border)]">
          <tr>
            <th className="px-6 py-4 font-black text-[var(--adm-text-primary)] text-xs uppercase tracking-widest">Details</th>
            <th className="px-6 py-4 font-black text-[var(--adm-text-primary)] text-xs uppercase tracking-widest">Position</th>
            <th className="px-6 py-4 font-black text-[var(--adm-text-primary)] text-xs uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 font-black text-[var(--adm-text-primary)] text-xs uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {banners.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-[var(--adm-text-secondary)] font-bold">No banners found. Click "Add New" to create one.</td>
            </tr>
          ) : (
            banners.map(banner => (
              <tr key={banner.id} className="hover:bg-[var(--adm-bg)]/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-14 rounded-xl overflow-hidden shadow-sm border border-[var(--adm-border)] bg-[var(--adm-bg)]">
                      <img src={banner.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-black text-[var(--adm-text-primary)] text-sm">Order: {banner.order}</div>
                      <div className="text-[10px] text-[var(--adm-text-secondary)] font-bold truncate max-w-[200px]">{banner.link || 'No link'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-primary/5 text-[var(--adm-text-primary)] rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/10">
                    {banner.position}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">Active</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => onEdit(banner)}
                      className="p-2 text-[var(--adm-text-secondary)] hover:text-accent hover:bg-accent/5 rounded-lg transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 text-[var(--adm-text-secondary)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-100">
        {banners.length === 0 ? (
          <div className="p-12 text-center text-[var(--adm-text-secondary)] font-bold text-sm">No banners found.</div>
        ) : (
          banners.map(banner => (
            <div key={banner.id} className="p-4 space-y-4">
              <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-[var(--adm-border)] shadow-sm">
                <img src={banner.image} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-white rounded-lg text-[8px] font-black uppercase tracking-widest">
                    Order: {banner.order}
                  </span>
                  <span className="px-2 py-0.5 bg-accent/80 backdrop-blur-md text-white rounded-lg text-[8px] font-black uppercase tracking-widest">
                    {banner.position}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Link Destination</p>
                  <p className="text-xs text-[var(--adm-text-primary)] font-bold truncate">{banner.link || 'No link provided'}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => onEdit(banner)}
                    className="p-2.5 bg-[var(--adm-bg)] text-gray-600 rounded-xl active:scale-95 transition-all border border-[var(--adm-border)]"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(banner.id)}
                    className="p-2.5 bg-red-50 text-red-500 rounded-xl active:scale-95 transition-all border border-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
