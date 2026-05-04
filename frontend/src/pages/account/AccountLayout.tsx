import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AccountSidebar } from './AccountSidebar';
import { Menu, X } from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';

export const AccountLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on route change
  React.useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="account-layout">
      {/* Mobile sidebar toggle */}
      <button
        className="account-mobile-toggle"
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      >
        {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        <span>{isMobileSidebarOpen ? 'Close Menu' : 'Account Menu'}</span>
      </button>

      {/* Backdrop for mobile */}
      {isMobileSidebarOpen && (
        <div
          className="account-mobile-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`account-sidebar-wrapper ${isMobileSidebarOpen ? 'account-sidebar-wrapper--open' : ''}`}>
        <AccountSidebar />
      </div>

      {/* Content */}
      <main className="account-content">
        <Outlet />
      </main>
    </div>
  );
};
