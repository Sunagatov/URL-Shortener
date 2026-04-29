import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaUserCircle,
  FaChevronDown,
  FaUser,
  FaShieldAlt,
  FaLink,
  FaTachometerAlt,
  FaSignOutAlt,
  FaGithub,
  FaTelegram,
  FaLinkedin,
  FaHeart
} from 'react-icons/fa';
import { routes } from '@/app/routes';
import { authSession } from '@/shared/auth/authSession';
import { useAuth } from '@/shared/auth/useAuth';
import AccountSidebar from '@/app/layout/AccountSidebar';


interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAccountRoute = location.pathname.startsWith('/account');
  const showMobileDrawerTrigger = isAuthenticated;

  const handleLogout = () => {
    authSession.logout();
    navigate(routes.home);
    setIsUserMenuOpen(false);
  };

  const handleOpenMobileAccountNav = () => {
    setIsUserMenuOpen(false);
    window.dispatchEvent(new CustomEvent('shorty:toggle-account-drawer'));
  };

  React.useEffect(() => {
    const handleCloseUserMenu = () => setIsUserMenuOpen(false);
    window.addEventListener('shorty:close-user-menu', handleCloseUserMenu);
    return () => window.removeEventListener('shorty:close-user-menu', handleCloseUserMenu);
  }, []);

  const userMenuItems = [
    { icon: FaTachometerAlt, label: 'Dashboard', path: routes.dashboard },
    { icon: FaLink, label: 'My URLs', path: routes.urlMappings },
    { icon: FaShieldAlt, label: 'Security', path: routes.security },
    { icon: FaUser, label: 'Profile', path: routes.profile },
  ];
  const mobileHeaderActionClassName = 'md:hidden w-10 h-10 bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/15 rounded-xl flex items-center justify-center transition-all duration-200';

  return (
    <div className="flex flex-col min-h-screen">
      {isAuthenticated && !isAccountRoute && <AccountSidebar desktopVisible={false} />}

      {/* Header */}
      <header className="bg-[#060612]/85 backdrop-blur-xl text-white py-4 fixed w-full z-50 border-b border-white/10">
        <div className="container mx-auto flex justify-between items-center px-4">
          {/* Logo */}
          <Link
            to={routes.home}
            className="flex items-center space-x-3 text-xl md:text-2xl font-bold hover:opacity-80 transition-opacity duration-200"
          >
            <div className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
              <FaLink className="w-4 h-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent font-bold tracking-tight">
              Shorty URL
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-3">
            {showMobileDrawerTrigger && (
              <button
                onClick={handleOpenMobileAccountNav}
                className={mobileHeaderActionClassName}
                aria-label="Open navigation"
              >
                <FaBars className="w-4 h-4 text-white" />
              </button>
            )}
            {isAuthenticated ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/20 hover:border-white/30"
                  aria-label="Open account menu"
                >
                  <div className="flex w-7 h-7 bg-white/15 rounded-lg items-center justify-center">
                    <FaUserCircle className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm">Account</span>
                  <FaChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-60 bg-[#0d0d20]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 py-2 z-20">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-semibold text-white">Account</p>
                        <p className="text-xs text-white/40">Manage your settings</p>
                      </div>
                      <div className="py-1.5">
                        {userMenuItems.map((item, index) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={index}
                              to={item.path}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors duration-200"
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                      <div className="border-t border-white/10 pt-1.5">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full px-4 py-2.5 text-red-400/80 hover:bg-red-900/20 hover:text-red-300 transition-colors duration-200"
                        >
                          <FaSignOutAlt className="w-3.5 h-3.5" />
                          <span className="text-sm font-medium">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to={routes.signUp}
                  className="text-white/70 hover:text-white font-medium transition-colors duration-200 hidden md:inline text-sm"
                >
                  Sign Up
                </Link>
                <Link
                  to={routes.signIn}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-105"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center bg-[#060612] pt-[72px] md:pt-24">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#060612] text-white border-t border-white/10 bg-grid-dark">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-9 h-9 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center">
                  <FaLink className="w-4 h-4 text-white/70" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Shorty URL
                </span>
              </div>
              <p className="text-white/50 mb-6 max-w-md text-sm leading-relaxed">
                The modern, secure, and reliable URL shortening service.
                Create short links, track analytics, and manage your URLs with ease.
              </p>
              <div className="flex items-center space-x-2 text-sm text-white/30">
                <span>Made with</span>
                <FaHeart className="w-3 h-3 text-red-400" />
                <span>by developers, for developers</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-white uppercase tracking-wider">Quick Links</h3>
              <div className="space-y-3">
                <Link to={routes.home} className="block text-white/50 hover:text-white/80 transition-colors duration-200 text-sm">
                  Home
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link to={routes.dashboard} className="block text-white/50 hover:text-white/80 transition-colors duration-200 text-sm">
                      Dashboard
                    </Link>
                    <Link to={routes.urlMappings} className="block text-white/50 hover:text-white/80 transition-colors duration-200 text-sm">
                      My URLs
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to={routes.signIn} className="block text-white/50 hover:text-white/80 transition-colors duration-200 text-sm">
                      Sign In
                    </Link>
                    <Link to={routes.signUp} className="block text-white/50 hover:text-white/80 transition-colors duration-200 text-sm">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Connect */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-white uppercase tracking-wider">Connect</h3>
              <div className="flex space-x-3">
                <a
                  href="https://github.com/Sunagatov/URL-Shortener"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                >
                  <FaGithub className="w-4 h-4 text-white/60 group-hover:text-white" />
                </a>
                <a
                  href="https://t.me/zufarexplained"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                >
                  <FaTelegram className="w-4 h-4 text-white/60 group-hover:text-white" />
                </a>
                <a
                  href="https://www.linkedin.com/in/zufar-sunagatov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                >
                  <FaLinkedin className="w-4 h-4 text-white/60 group-hover:text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/30 text-sm mb-4 md:mb-0">
              © 2026 Shorty URL. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-white/20 cursor-not-allowed">Privacy Policy (coming soon)</span>
              <span className="text-white/20 cursor-not-allowed">Terms of Service (coming soon)</span>
              <span className="text-white/20 cursor-not-allowed">Support (coming soon)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
