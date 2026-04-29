import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { routes } from '@/app/routes';

type AuthLocationState = {
  from?: {
    pathname: string;
    search?: string;
    hash?: string;
  };
};

interface GuestOnlyRouteProps {
  children: React.ReactNode;
}

export const GuestOnlyRoute: React.FC<GuestOnlyRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    const from = (location.state as AuthLocationState | null)?.from;
    const destination = from
      ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
      : routes.dashboard;

    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
};
