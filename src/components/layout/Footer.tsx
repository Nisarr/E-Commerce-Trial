import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[var(--primary)] text-white pt-12 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 font-garamond">PlayPen House</h2>
            <p className="text-gray-300 text-sm mb-4">
              Premium baby products and toys for your little ones. We bring the best quality to ensure safety and happiness.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link to="/about" className="hover:text-[var(--accent)]">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[var(--accent)]">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-[var(--accent)]">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-[var(--accent)]">Shipping Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Categories</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link to="/category/diapers" className="hover:text-[var(--accent)]">Baby Care</Link></li>
              <li><Link to="/category/bottles" className="hover:text-[var(--accent)]">Feeding</Link></li>
              <li><Link to="/category/infant-toys" className="hover:text-[var(--accent)]">Toys</Link></li>
              <li><Link to="/category/clothes" className="hover:text-[var(--accent)]">Clothing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Newsletter</h3>
            <p className="text-gray-300 text-sm mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="flex gap-2">
              <input type="email" placeholder="Enter your email" className="w-full px-3 py-2 rounded text-black focus:outline-none" />
              <button type="submit" className="bg-[var(--accent)] px-4 py-2 rounded font-medium hover:bg-[var(--accent)]/90 transition">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} PlayPen House. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
