import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { routes } from '@/app/routes';
import { useAuth } from '@/shared/auth/useAuth';

type AuthLocationState = {
  from?: {
    pathname: string;
    search?: string;
    hash?: string;
  };
};

interface AuthRouteProps {
  access: 'guest' | 'protected';
  children: React.ReactNode;
}

export const AuthRoute: React.FC<AuthRouteProps> = ({ access, children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (access === 'protected' && !isAuthenticated) {
    return <Navigate to={routes.signIn} state={{ from: location }} replace />;
  }

  if (access === 'guest' && isAuthenticated) {
    const from = (location.state as AuthLocationState | null)?.from;
    const destination = from
      ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
      : routes.dashboard;

    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
};
