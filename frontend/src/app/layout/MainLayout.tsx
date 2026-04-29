import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AccountSidebar from '@/app/layout/AccountSidebar';
import { LayoutFooter } from '@/app/layout/LayoutFooter';
import { LayoutHeader } from '@/app/layout/LayoutHeader';
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

  const handleOpenMobileAccountNav = () => {
    setIsUserMenuOpen(false);
    window.dispatchEvent(new CustomEvent(layoutEvents.toggleAccountDrawer));
  };

  React.useEffect(() => {
    const handleCloseUserMenu = () => setIsUserMenuOpen(false);
    window.addEventListener(layoutEvents.closeUserMenu, handleCloseUserMenu);
    return () => window.removeEventListener(layoutEvents.closeUserMenu, handleCloseUserMenu);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {isAuthenticated && !isAccountRoute && <AccountSidebar desktopVisible={false} />}

      <LayoutHeader
        isAuthenticated={isAuthenticated}
        isSignInRoute={isSignInRoute}
        isSignUpRoute={isSignUpRoute}
        isUserMenuOpen={isUserMenuOpen}
        pathname={pathname}
        onLogout={handleLogout}
        onOpenMobileAccountNav={handleOpenMobileAccountNav}
        onToggleUserMenu={() => setIsUserMenuOpen((current) => !current)}
        onCloseUserMenu={() => setIsUserMenuOpen(false)}
      />

      <main
        className={`flex-grow bg-[#060612] pt-[72px] md:pt-24 ${
          isAccountRoute || isAuthRoute ? '' : 'flex items-center justify-center'
        }`}
      >
        {children}
      </main>

      {!isAccountRoute && <LayoutFooter isAuthenticated={isAuthenticated} />}
    </div>
  );
};
