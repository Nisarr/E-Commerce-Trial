import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  User, MapPin, CreditCard, Wallet,
  Package, RotateCcw, XCircle,
  Star, Heart, LogOut,
  ShieldCheck, Bell, Lock
} from 'lucide-react';
import { useLicenseStore } from '../../store/licenseStore';

interface SidebarSection {
  title: string;
  items: {
    icon: React.ElementType;
    label: string;
    to: string;
    comingSoon?: boolean;
    premium?: boolean;
  }[];
}

const sections: SidebarSection[] = [
  {
    title: 'Manage My Account',
    items: [
      { icon: User, label: 'My Profile', to: '/account/profile' },
      { icon: MapPin, label: 'Address Book', to: '/account/addresses' },
      { icon: CreditCard, label: 'My Payment Options', to: '/account/payments', premium: true },
      { icon: Wallet, label: 'Wallet', to: '/account/wallet', premium: true },
    ],
  },
  {
    title: 'My Orders',
    items: [
      { icon: Package, label: 'Order History', to: '/account/orders' },
      { icon: RotateCcw, label: 'My Returns', to: '/account/returns', premium: true },
      { icon: XCircle, label: 'My Cancellations', to: '/account/cancellations', premium: true },
    ],
  },
  {
    title: 'My Engagement',
    items: [
      { icon: Star, label: 'My Reviews', to: '/account/reviews', premium: true },
      { icon: Bell, label: 'My Notifications', to: '/account/notifications', premium: true },
      { icon: Heart, label: 'My Wishlist', to: '/wishlist' },
    ],
  },
];

export const AccountSidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isPremium = useLicenseStore((s) => s.isPremium);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="account-sidebar">
      {/* User Header */}
      <div className="sidebar-user-header">
        <div className="sidebar-avatar">
          <User size={28} />
        </div>
        <div className="sidebar-user-info">
          <h3 className="sidebar-username">Hello, {user?.username || 'Guest'}</h3>
          <div className="sidebar-verified-badge">
            <ShieldCheck size={13} />
            <span>Verified Account</span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div key={section.title} className="sidebar-section">
            <h4 className="sidebar-section-title">{section.title}</h4>
            <ul className="sidebar-section-list">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive && !item.comingSoon && !(item.premium && !isPremium) ? 'sidebar-link--active' : ''} ${item.comingSoon || (item.premium && !isPremium) ? 'opacity-70 pointer-events-none grayscale' : ''}`
                    }
                    onClick={(e) => (item.comingSoon || (item.premium && !isPremium)) && e.preventDefault()}
                  >
                    <item.icon size={17} className="sidebar-link-icon" />
                    <span className="sidebar-link-label flex items-center justify-between">
                      {item.label}
                      {item.comingSoon && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-md ml-2 border border-orange-200">
                          Soon
                        </span>
                      )}
                      {item.premium && !isPremium && (
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-md ml-2 border border-amber-200">
                          <Lock size={9} /> Premium
                        </span>
                      )}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <button onClick={handleLogout} className="sidebar-logout">
        <LogOut size={17} />
        <span>Logout</span>
      </button>
    </aside>
  );
};
