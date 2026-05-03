import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, MapPin, Phone, Heart } from 'lucide-react';
import { getCategories } from '../../services/api';
import type { Category } from '../../types';

/* Small red accent line used between list items */
const ItemDivider = () => (
  <div className="h-px w-10 bg-gradient-to-r from-[#FF4500] to-[#FF4500]/20" />
);

export const Footer: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);
  return (
    <footer className="bg-[#FFFBF0] text-gray-900 pt-10 pb-4 mt-auto rounded-t-[2.5rem] border-t-2 border-[#FF4500]">
      <div className="container mx-auto px-4 md:px-8">

        {/* Premium Gold Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#B8860B] to-transparent opacity-40" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B8860B]/60">PlayPen House</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#B8860B] to-transparent opacity-40" />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">

          {/* Brand Card — spans 5 cols */}
          <div className="md:col-span-5 bg-black/[0.02] border border-[#FF4500]/15 rounded-2xl p-5 flex flex-col justify-between group hover:border-[#FF4500]/40 transition-all duration-300 shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img src="/logo.png" alt="PlayPen House" className="w-8 h-8 object-contain rounded-lg" />
                <h2 className="text-xl font-bold text-gray-900 font-garamond tracking-tight">PlayPen House</h2>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed mb-4">
                Premium baby products and toys for your little ones. We bring the best quality to ensure safety and happiness.
              </p>
            </div>
            {/* Gold accent line inside card */}
            <div className="h-px w-full bg-gradient-to-r from-[#B8860B]/30 via-[#B8860B]/10 to-transparent mb-3" />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 text-gray-600 text-[10px] py-1">
                <MapPin size={12} className="text-[#B8860B] flex-shrink-0" />
                <span>Dhaka, Bangladesh</span>
              </div>
              <ItemDivider />
              <div className="flex items-center gap-2 text-gray-600 text-[10px] py-1">
                <Phone size={12} className="text-[#B8860B] flex-shrink-0" />
                <span>+880 1XXX-XXXXXX</span>
              </div>
              <ItemDivider />
              <div className="flex items-center gap-2 text-gray-600 text-[10px] py-1">
                <Mail size={12} className="text-[#B8860B] flex-shrink-0" />
                <span>hello@playpenhouse.com</span>
              </div>
            </div>
          </div>

          {/* Right Side — Links + Newsletter */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Quick Links Card */}
            <div className="bg-black/[0.02] border border-[#FF4500]/15 rounded-2xl p-5 hover:border-[#FF4500]/40 transition-all duration-300 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8860B] mb-3">Quick Links</h3>
              <div className="h-px w-6 bg-[#B8860B]/30 mb-3" />
              <ul className="flex flex-col gap-0.5">
                {[
                  { to: '/about', label: 'About Us' },
                  { to: '/contact', label: 'Contact Us' },
                  { to: '/faq', label: 'FAQ' },
                  { to: '/shipping', label: 'Shipping' },
                ].map((link, i, arr) => (
                  <li key={link.to}>
                    <Link 
                      to={link.to} 
                      className="text-gray-600 text-xs hover:text-[#FF4500] transition-colors flex items-center gap-2 group/link py-1"
                    >
                      <ArrowRight size={10} className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-[#FF4500]" />
                      <span className="group-hover/link:translate-x-0 -translate-x-4 transition-transform">{link.label}</span>
                    </Link>
                    {i < arr.length - 1 && <ItemDivider />}
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories Card */}
            <div className="bg-black/[0.02] border border-[#FF4500]/15 rounded-2xl p-5 hover:border-[#FF4500]/40 transition-all duration-300 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8860B] mb-3">Categories</h3>
              <div className="h-px w-6 bg-[#B8860B]/30 mb-3" />
              <ul className="flex flex-col gap-0.5">
                {categories.slice(0, 4).map((cat, i, arr) => (
                  <li key={cat.id}>
                    <Link 
                      to={`/category/${cat.slug}`} 
                      className="text-gray-600 text-xs hover:text-[#FF4500] transition-colors flex items-center gap-2 group/link py-1"
                    >
                      <ArrowRight size={10} className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-[#FF4500]" />
                      <span className="group-hover/link:translate-x-0 -translate-x-4 transition-transform">{cat.name}</span>
                    </Link>
                    {i < arr.length - 1 && <ItemDivider />}
                  </li>
                ))}
                {categories.length === 0 && (
                  <li>
                    <Link to="/categories" className="text-gray-600 text-xs hover:text-[#FF4500] transition-colors flex items-center gap-2 group/link py-1">
                      <ArrowRight size={10} className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-[#FF4500]" />
                      <span className="group-hover/link:translate-x-0 -translate-x-4 transition-transform">All Collections</span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Newsletter Card */}
            <div className="bg-gradient-to-br from-[#FF4500]/5 to-transparent border border-[#FF4500]/15 rounded-2xl p-5 hover:border-[#FF4500]/40 transition-all duration-300 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8860B] mb-2">Newsletter</h3>
              <div className="h-px w-6 bg-[#B8860B]/30 mb-3" />
              <p className="text-gray-600 text-[10px] leading-relaxed mb-3">
                Get exclusive deals & updates.
              </p>
              <form className="flex flex-col gap-2">
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs placeholder:text-gray-400 focus:outline-none focus:border-[#FF4500]/50 focus:ring-1 focus:ring-[#FF4500]/20 transition-all shadow-inner" 
                />
                <button 
                  type="submit" 
                  className="w-full bg-[#FF4500] hover:bg-[#E63E00] text-white px-3 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF4500]/20 hover:shadow-[#FF4500]/30 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Subscribe
                  <ArrowRight size={12} />
                </button>
              </form>
            </div>

          </div>
        </div>

        {/* Gold Divider before Bottom Bar */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#B8860B]/20 to-transparent mb-4" />

        {/* Bottom Bar */}
        <div className="bg-black/[0.02] border border-[#FF4500]/10 rounded-2xl px-5 py-3 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-gray-500 text-[10px] flex items-center gap-1.5">
            &copy; {new Date().getFullYear()} PlayPen House. Made with <Heart size={10} className="text-[#FF4500] fill-[#FF4500]" /> in BD
          </p>
          
          {/* Developer Partner Link */}
          <div className="flex items-center gap-2 text-gray-500 text-[10px]">
            <span>Developer Partner -</span>
            <a 
              href="https://OrbitSaaS.cloud" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#B8860B] hover:text-[#FF4500] font-bold transition-colors"
            >
              OrbitSaaS
            </a>
          </div>

          <div className="flex gap-4">
            <Link to="/privacy" className="text-gray-500 text-[10px] hover:text-gray-900 transition-colors">Privacy</Link>
            <Link to="/terms" className="text-gray-500 text-[10px] hover:text-gray-900 transition-colors">Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
