import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  role?: 'admin' | 'user';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role = 'user' }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    const loginPath = role === 'admin' ? '/adm' : '/account/login';
    return <Navigate to={loginPath} replace />;
  }

  // Admins can access user-level routes, but regular users cannot access admin routes
  if (role === 'admin' && user?.role !== 'admin') {
    return <Navigate to="/account/login" replace />;
  }

  return <Outlet />;
};
