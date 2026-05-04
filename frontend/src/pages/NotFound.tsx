import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="flex-grow flex items-center justify-center py-16 px-6">
      <div className="max-w-lg text-center">
        {/* Big 404 */}
        <div className="relative mb-8">
          <span className="text-[140px] sm:text-[180px] font-black text-gray-100 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center border-2 border-accent/20 shadow-xl shadow-accent/10">
              <Search size={36} className="text-accent" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-black text-primary mb-3 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-muted text-base mb-10 font-medium max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-accent text-white rounded-2xl font-bold text-sm hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
          >
            <Home size={18} /> Go Home
          </Link>
          <Link
            to="/shop"
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white border-2 border-gray-200 text-primary rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all"
          >
            <ArrowLeft size={18} /> Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
};
