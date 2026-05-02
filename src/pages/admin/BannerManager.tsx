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
    <div className="bg-white rounded-[2rem] shadow-xl shadow-primary/5 border border-gray-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 font-black text-primary text-xs uppercase tracking-widest">Details</th>
            <th className="px-6 py-4 font-black text-primary text-xs uppercase tracking-widest">Position</th>
            <th className="px-6 py-4 font-black text-primary text-xs uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 font-black text-primary text-xs uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {banners.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-muted font-bold">No banners found. Click "Add New" to create one.</td>
            </tr>
          ) : (
            banners.map(banner => (
              <tr key={banner.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-14 rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
                      <img src={banner.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-black text-primary text-sm">Order: {banner.order}</div>
                      <div className="text-[10px] text-muted font-bold truncate max-w-[200px]">{banner.link || 'No link'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-primary/5 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/10">
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
                      className="p-2 text-muted hover:text-accent hover:bg-accent/5 rounded-lg transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
    </div>
  );
};
