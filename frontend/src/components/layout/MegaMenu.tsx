import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../services/api';
import type { Category } from '../../types';

export const MegaMenu: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <div className="absolute top-full left-0 w-[600px] hidden group-hover:block bg-white shadow-xl rounded-b-lg border border-gray-100 p-6 z-50 transition-all duration-200 opacity-0 group-hover:opacity-100 mt-0">
      <div className="grid grid-cols-3 gap-6">
        {categories.length > 0 ? (
          categories.slice(0, 9).map((cat) => (
            <div key={cat.id}>
              <h3 className="font-bold text-[var(--primary)] mb-3 text-sm uppercase tracking-wider">{cat.name}</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to={`/category/${cat.slug}`} className="hover:text-[var(--accent)]">View All</Link></li>
              </ul>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">No categories available</p>
        )}
      </div>
    </div>
  );
};
