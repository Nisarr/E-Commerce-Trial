import React from 'react';
import { Eye, Edit3, Lock } from 'lucide-react';
import type { Product } from '../../types';

interface ProductManagerProps {
  products: Product[];
}

export const ProductManager: React.FC<ProductManagerProps> = ({ products }) => {
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
          {products.map(product => (
            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-black text-muted text-xs text-center">IMG</div>
                  <div>
                    <div className="font-bold text-primary">{product.title}</div>
                    <div className="text-xs text-muted font-medium">৳{product.price} • {product.brand}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">In Stock</span>
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
