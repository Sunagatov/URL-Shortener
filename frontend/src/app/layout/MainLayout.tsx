import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutFooter } from '@/app/layout/LayoutFooter';
import { LayoutHeader } from '@/app/layout/LayoutHeader';
import { MobileTabBar } from '@/app/layout/MobileTabBar';
import { routes } from '@/app/routes';
import { useAuth } from '@/shared/auth/useAuth';
import { layoutEvents } from '@/shared/lib/layoutEvents';

interface MainLayoutProps {
  children: React.ReactNode;
}

const AUTH_ROUTES = new Set<string>([
  routes.signIn,
  routes.signUp,
  routes.forgotPassword,
  routes.resetPassword,
  routes.verifyEmail,
]);

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAccountRoute = pathname.startsWith('/account');
  const isSignInRoute = pathname === routes.signIn;
  const isSignUpRoute = pathname === routes.signUp;
  const isAuthRoute = AUTH_ROUTES.has(pathname);
  const mainClassName = [
    'flex-grow pt-[72px] md:pt-24',
    isAuthenticated ? 'pb-24 md:pb-0' : '',
    isAccountRoute || isAuthRoute ? '' : 'flex items-center justify-center',
  ].join(' ');

  const handleLogout = () => {
    logout();
    navigate(routes.home);
    setIsUserMenuOpen(false);
  };

  React.useEffect(() => {
    const handleCloseUserMenu = () => setIsUserMenuOpen(false);
    window.addEventListener(layoutEvents.closeUserMenu, handleCloseUserMenu);
    return () => window.removeEventListener(layoutEvents.closeUserMenu, handleCloseUserMenu);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <LayoutHeader
        isAuthenticated={isAuthenticated}
        isSignInRoute={isSignInRoute}
        isSignUpRoute={isSignUpRoute}
        isUserMenuOpen={isUserMenuOpen}
        pathname={pathname}
        onLogout={handleLogout}
        onToggleUserMenu={() => setIsUserMenuOpen((current) => !current)}
        onCloseUserMenu={() => setIsUserMenuOpen(false)}
      />

      <main className={mainClassName}>{children}</main>

      {isAuthenticated && <MobileTabBar />}
      {!isAccountRoute && <LayoutFooter isAuthenticated={isAuthenticated} />}
    </div>
  );
};
