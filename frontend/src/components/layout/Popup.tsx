import React, { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';
import { Button } from '../ui/Button';

export const Popup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup after a short delay
    const timer = setTimeout(() => {
      const hasSeenPopup = sessionStorage.getItem('hasSeenPopup');
      if (!hasSeenPopup) {
        setIsOpen(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenPopup', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <button 
          onClick={closePopup}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
          aria-label="Close popup"
        >
          <X size={20} className="text-gray-600" />
        </button>

        <div className="relative h-40 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <Gift size={64} className="text-white animate-bounce" />
        </div>

        <div className="p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Special Offer! 🎉</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Get <span className="font-bold text-[var(--accent)]">Free Shipping</span> on all orders over <span className="font-bold text-gray-900">৳5000</span>. Limited time offer!
          </p>
          
          <div className="space-y-3">
            <Button 
              variant="primary" 
              className="w-full py-4 rounded-2xl font-bold shadow-lg shadow-blue-200"
              onClick={closePopup}
            >
              Claim Offer Now
            </Button>
            <button 
              onClick={closePopup}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors font-medium cursor-pointer"
            >
              No thanks, I'll pay for shipping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
