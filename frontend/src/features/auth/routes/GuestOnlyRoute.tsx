import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/auth/useAuth';
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
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    const from = (location.state as AuthLocationState | null)?.from;
    const destination = from
      ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
      : routes.dashboard;

    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
};
