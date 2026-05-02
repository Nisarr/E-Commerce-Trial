import React from 'react';
import { Link } from 'react-router-dom';

export const MegaMenu: React.FC = () => {
  return (
    <div className="absolute top-full left-0 w-[600px] hidden group-hover:block bg-white shadow-xl rounded-b-lg border border-gray-100 p-6 z-50 transition-all duration-200 opacity-0 group-hover:opacity-100 mt-0">
      <div className="grid grid-cols-3 gap-6">
        <div>
          <h3 className="font-bold text-[var(--primary)] mb-3 text-sm uppercase tracking-wider">Baby Care</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link to="/category/diapers" className="hover:text-[var(--accent)]">Diapers & Wipes</Link></li>
            <li><Link to="/category/bath" className="hover:text-[var(--accent)]">Bath & Skin Care</Link></li>
            <li><Link to="/category/health" className="hover:text-[var(--accent)]">Health & Safety</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[var(--primary)] mb-3 text-sm uppercase tracking-wider">Feeding</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link to="/category/bottles" className="hover:text-[var(--accent)]">Bottles & Nipples</Link></li>
            <li><Link to="/category/highchairs" className="hover:text-[var(--accent)]">Highchairs</Link></li>
            <li><Link to="/category/bibs" className="hover:text-[var(--accent)]">Bibs & Accessories</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[var(--primary)] mb-3 text-sm uppercase tracking-wider">Toys & Play</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link to="/category/infant-toys" className="hover:text-[var(--accent)]">Infant Toys</Link></li>
            <li><Link to="/category/learning" className="hover:text-[var(--accent)]">Educational</Link></li>
            <li><Link to="/category/outdoor" className="hover:text-[var(--accent)]">Outdoor Play</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
};
