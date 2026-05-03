import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  role?: 'admin' | 'user';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role = 'user' }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || (role && user?.role !== role)) {
    const loginPath = role === 'admin' ? '/adm' : '/account/login';
    return <Navigate to={loginPath} replace />;
  }

  return <Outlet />;
};
