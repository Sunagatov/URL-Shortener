import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
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
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants';
import AuthService from '../services/AuthService';


interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const userMenuItems = [
    { icon: FaTachometerAlt, label: 'Dashboard', path: ROUTES.DASHBOARD },
    { icon: FaLink, label: 'My URLs', path: ROUTES.URL_MAPPINGS },
    { icon: FaShieldAlt, label: 'Security', path: ROUTES.SECURITY },
    { icon: FaUser, label: 'Profile', path: ROUTES.PROFILE },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white py-4 fixed w-full z-10 shadow-2xl backdrop-blur-sm">
        <div className="container mx-auto flex justify-between items-center px-4">
          {/* Logo */}
          <Link 
            to={ROUTES.HOME} 
            className="flex items-center space-x-3 text-2xl md:text-3xl font-bold hover:scale-105 transition-transform duration-200"
          >
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <FaLink className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Shorty URL
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl transition-all duration-200 border border-white/20 hover:border-white/30"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <FaUserCircle className="w-5 h-5" />
                  </div>
                  <span className="hidden md:inline font-medium">Account</span>
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
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-20">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">Account Menu</p>
                        <p className="text-xs text-gray-500">Manage your account settings</p>
                      </div>
                      <div className="py-2">
                        {userMenuItems.map((item, index) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={index}
                              to={item.path}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
                            >
                              <Icon className="w-4 h-4" />
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <FaSignOutAlt className="w-4 h-4" />
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to={ROUTES.SIGNUP}
                  className="text-white hover:text-blue-100 font-medium transition-colors duration-200 hidden md:inline"
                >
                  Sign Up
                </Link>
                <Link
                  to={ROUTES.SIGNIN}
                  className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-md transition-all duration-200 hover:scale-105 hover:bg-blue-50 hover:shadow-lg"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 pt-24 overflow-hidden">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <FaLink className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Shorty URL
                </span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                The modern, secure, and reliable URL shortening service. 
                Create short links, track analytics, and manage your URLs with ease.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>Made with</span>
                <FaHeart className="w-4 h-4 text-red-500" />
                <span>by developers, for developers</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
              <div className="space-y-3">
                <Link to={ROUTES.HOME} className="block text-gray-300 hover:text-blue-400 transition-colors duration-200">
                  Home
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link to={ROUTES.DASHBOARD} className="block text-gray-300 hover:text-blue-400 transition-colors duration-200">
                      Dashboard
                    </Link>
                    <Link to={ROUTES.URL_MAPPINGS} className="block text-gray-300 hover:text-blue-400 transition-colors duration-200">
                      My URLs
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to={ROUTES.SIGNIN} className="block text-gray-300 hover:text-blue-400 transition-colors duration-200">
                      Sign In
                    </Link>
                    <Link to={ROUTES.SIGNUP} className="block text-gray-300 hover:text-blue-400 transition-colors duration-200">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Connect */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Connect</h3>
              <div className="flex space-x-4">
                <a
                  href="https://github.com/Sunagatov/URL-Shortener"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                >
                  <FaGithub className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </a>
                <a
                  href="https://t.me/zufarexplained"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                >
                  <FaTelegram className="w-5 h-5 text-white" />
                </a>
                <a
                  href="https://www.linkedin.com/in/zufar-sunagatov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-700 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                >
                  <FaLinkedin className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Shorty URL. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span className="text-gray-500 cursor-not-allowed">Privacy Policy (coming soon)</span>
              <span className="text-gray-500 cursor-not-allowed">Terms of Service (coming soon)</span>
              <span className="text-gray-500 cursor-not-allowed">Support (coming soon)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
