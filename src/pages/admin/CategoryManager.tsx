import React from 'react';
import { Eye, Edit3, Lock } from 'lucide-react';
import type { Category } from '../../types';

interface CategoryManagerProps {
  categories: Category[];
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-primary/5 border border-gray-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 font-black text-primary text-xs uppercase tracking-widest">Details</th>
            <th className="px-6 py-4 font-black text-primary text-xs uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 font-black text-primary text-xs uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {categories.map(category => (
            <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <img src={category.image} alt="" className="w-12 h-12 object-cover rounded-xl shadow-sm" />
                  <div className="font-bold text-primary">{category.name}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">Public</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  <button className="p-2 text-muted hover:text-primary transition-colors"><Eye size={18} /></button>
                  <button className="relative group p-2 text-muted cursor-not-allowed">
                    <Edit3 size={18} />
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-primary text-white text-[10px] font-black px-3 py-1 rounded-lg whitespace-nowrap shadow-xl">
                      COMING SOON <Lock size={10} className="inline ml-1" />
                    </div>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
