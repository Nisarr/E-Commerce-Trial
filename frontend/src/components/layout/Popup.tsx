import React, { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';
import { Button } from '../ui/Button';
import { getPopupSettings } from '../../services/api';
import type { PopupSettings } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useLicenseStore } from '../../store/licenseStore';

export const Popup: React.FC = () => {
  const isPremium = useLicenseStore((s) => s.isPremium);
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<PopupSettings | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Popup is a premium-only feature — skip fetching in trial
    if (!isPremium) return;
    const fetchSettings = async () => {
      try {
        const data = await getPopupSettings();
        setSettings(data);
        
        if (data.isActive) {
          const hasSeenPopup = sessionStorage.getItem('hasSeenPopup');
          if (!hasSeenPopup) {
            // Show popup after a short delay
            const timer = setTimeout(() => {
              setIsOpen(true);
            }, 2000);
            return () => clearTimeout(timer);
          }
        }
      } catch (error) {
        console.error('Failed to fetch popup settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const closePopup = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenPopup', 'true');
  };

  const handleAction = () => {
    if (settings?.link) {
      if (settings.link.startsWith('http')) {
        window.open(settings.link, '_blank');
      } else {
        navigate(settings.link);
      }
    }
    closePopup();
  };

  if (!isPremium || !isOpen || !settings || !settings.isActive) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Background Blur Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" 
        onClick={closePopup}
      />
      
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
          
          {settings.imageUrl ? (
            <img 
              src={settings.imageUrl} 
              alt="Popup Offer" 
              className="w-full h-full object-cover"
            />
          ) : (
            <Gift size={64} className="text-white animate-bounce" />
          )}
        </div>

        <div className="p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{settings.title}</h3>
          <p className="text-gray-600 mb-8 leading-relaxed whitespace-pre-wrap">
            {settings.description}
          </p>
          
          <div className="space-y-3">
            <Button 
              variant="primary" 
              className="w-full py-4 rounded-2xl font-bold shadow-lg shadow-blue-200"
              onClick={handleAction}
            >
              {settings.buttonText}
            </Button>
            <button 
              onClick={closePopup}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors font-medium cursor-pointer"
            >
              No thanks, I'll close this
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
