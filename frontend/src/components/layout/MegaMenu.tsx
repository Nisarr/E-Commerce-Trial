import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useHomeStore } from '../../store/homeStore';

export const MegaMenu: React.FC = () => {
  const { data } = useHomeStore();
  const categories = data?.categories?.items || [];


  return (
    <div className="absolute top-full left-0 w-[600px] hidden group-hover:block bg-white rounded-b-lg border border-gray-200 p-6 z-50 transition-all duration-200 opacity-0 group-hover:opacity-100 mt-0">
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
      <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
        <Link 
          to="/categories" 
          className="text-[var(--accent)] text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-2"
        >
          View All Collections
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
};
