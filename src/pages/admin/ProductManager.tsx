import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import type { Product } from '../../types';

interface ProductManagerProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({ products, onEdit, onDelete }) => {
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
          {products.map(product => {
            const images = JSON.parse(product.images || '[]');
            const mainImage = images[0] || '';
            
            return (
              <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                      {mainImage ? (
                        <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black text-muted text-[10px]">NO IMG</span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-primary">{product.title}</div>
                      <div className="text-xs text-muted font-medium">৳{product.price} • {product.brand}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${product.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => onEdit(product)}
                      className="p-2 text-muted hover:text-primary transition-colors hover:bg-white rounded-lg shadow-sm"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this product?')) {
                          onDelete(product.id);
                        }
                      }}
                      className="p-2 text-muted hover:text-red-500 transition-colors hover:bg-white rounded-lg shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
