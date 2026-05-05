import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  User, MapPin, CreditCard, Wallet,
  Package, RotateCcw, XCircle,
  Star, Heart, LogOut,
  ShieldCheck
} from 'lucide-react';

interface SidebarSection {
  title: string;
  items: {
    icon: React.ElementType;
    label: string;
    to: string;
    comingSoon?: boolean;
  }[];
}

const sections: SidebarSection[] = [
  {
    title: 'Manage My Account',
    items: [
      { icon: User, label: 'My Profile', to: '/account/profile' },
      { icon: MapPin, label: 'Address Book', to: '/account/addresses' },
      { icon: CreditCard, label: 'My Payment Options', to: '/account/payments' },
      { icon: Wallet, label: 'Wallet', to: '/account/wallet', comingSoon: true },
    ],
  },
  {
    title: 'My Orders',
    items: [
      { icon: Package, label: 'Order History', to: '/account/orders' },
      { icon: RotateCcw, label: 'My Returns', to: '/account/returns' },
      { icon: XCircle, label: 'My Cancellations', to: '/account/cancellations' },
    ],
  },
  {
    title: 'My Engagement',
    items: [
      { icon: Star, label: 'My Reviews', to: '/account/reviews' },
      { icon: Heart, label: 'My Wishlist', to: '/wishlist' },
    ],
  },
];

export const AccountSidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

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
                      `sidebar-link ${isActive && !item.comingSoon ? 'sidebar-link--active' : ''} ${item.comingSoon ? 'opacity-70 pointer-events-none grayscale' : ''}`
                    }
                    onClick={(e) => item.comingSoon && e.preventDefault()}
                  >
                    <item.icon size={17} className="sidebar-link-icon" />
                    <span className="sidebar-link-label flex items-center justify-between">
                      {item.label}
                      {item.comingSoon && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-md ml-2 border border-orange-200">
                          Soon
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
