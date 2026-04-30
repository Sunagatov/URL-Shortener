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

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const isAccountRoute = pathname.startsWith('/account');
  const isSignInRoute = pathname === routes.signIn;
  const isSignUpRoute = pathname === routes.signUp;
  const isAuthRoute = isSignInRoute || isSignUpRoute;

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

      <main
        className={`flex-grow bg-[#060612] pt-[72px] md:pt-24 ${isAuthenticated ? 'pb-24 md:pb-0' : ''} ${
          isAccountRoute || isAuthRoute ? '' : 'flex items-center justify-center'
        }`}
      >
        {children}
      </main>

      {isAuthenticated && <MobileTabBar />}
      {!isAccountRoute && <LayoutFooter isAuthenticated={isAuthenticated} />}
    </div>
  );
};
