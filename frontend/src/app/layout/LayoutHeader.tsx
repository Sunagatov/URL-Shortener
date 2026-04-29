import { Link } from 'react-router-dom';
import { FaBars, FaChevronDown, FaLink, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { accountNavigationItems } from '@/app/layout/layoutNavigation';
import { routes } from '@/app/routes';

interface LayoutHeaderProps {
  isAuthenticated: boolean;
  isSignInRoute: boolean;
  isSignUpRoute: boolean;
  isUserMenuOpen: boolean;
  pathname: string;
  onLogout: () => void;
  onOpenMobileAccountNav: () => void;
  onToggleUserMenu: () => void;
  onCloseUserMenu: () => void;
}

const mobileHeaderActionClassName =
  'flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 ' +
  'backdrop-blur-sm transition-all duration-200 hover:bg-white/15 md:hidden';

export const LayoutHeader = ({
  isAuthenticated,
  isSignInRoute,
  isSignUpRoute,
  isUserMenuOpen,
  pathname,
  onLogout,
  onOpenMobileAccountNav,
  onToggleUserMenu,
  onCloseUserMenu,
}: LayoutHeaderProps) => {
  return (
    <header className="fixed z-[60] w-full border-b border-white/10 bg-[#060612]/85 py-4 text-white backdrop-blur-xl">
      <div className="container relative mx-auto flex items-center justify-between px-4">
        <div className="flex w-10 items-center md:hidden">
          {isAuthenticated && (
            <button
              onClick={onOpenMobileAccountNav}
              className={mobileHeaderActionClassName}
              aria-label="Open navigation"
            >
              <FaBars className="h-4 w-4 text-white" />
            </button>
          )}
        </div>

        <Link
          to={routes.home}
          className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2.5 text-xl font-bold transition-opacity duration-200 hover:opacity-80 md:static md:translate-x-0 md:text-2xl"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-sm">
            <FaLink className="h-4 w-4 text-white" />
          </div>
          <span
            className="bg-gradient-to-r from-white to-blue-200 bg-clip-text font-bold tracking-tight text-transparent"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Shorty URL
          </span>
        </Link>

        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="relative hidden md:block">
              <button
                onClick={onToggleUserMenu}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 transition-all duration-200 hover:border-white/30 hover:bg-white/15"
                aria-label="Open account menu"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                  <FaUserCircle className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Account</span>
                <FaChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={onCloseUserMenu} />
                  <div className="absolute right-0 z-20 mt-2 w-60 rounded-2xl border border-white/10 bg-[#0d0d20]/95 py-2 shadow-2xl backdrop-blur-xl">
                    <div className="border-b border-white/10 px-4 py-3">
                      <p className="text-sm font-semibold text-white">Account</p>
                      <p className="text-xs text-white/40">Manage your settings</p>
                    </div>
                    <div className="py-1.5">
                      {accountNavigationItems.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={onCloseUserMenu}
                            className={`relative flex items-center space-x-3 px-4 py-2.5 transition-colors duration-200 ${
                              active
                                ? 'bg-blue-500/10 text-white'
                                : 'text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {active && (
                              <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-blue-400" />
                            )}
                            <Icon className={`h-3.5 w-3.5 ${active ? 'text-blue-400' : ''}`} />
                            <span className="text-sm font-medium">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="border-t border-white/10 pt-1.5">
                      <button
                        type="button"
                        onClick={onLogout}
                        className="flex w-full items-center space-x-3 px-4 py-2.5 text-red-400/80 transition-colors duration-200 hover:bg-red-900/20 hover:text-red-300"
                      >
                        <FaSignOutAlt className="h-3.5 w-3.5" />
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
                to={isSignInRoute ? routes.signUp : routes.signIn}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-blue-500"
              >
                {isSignInRoute ? 'Sign Up' : 'Sign In'}
              </Link>
              {!isSignUpRoute && !isSignInRoute && (
                <Link
                  to={routes.signUp}
                  className="hidden text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white md:inline"
                >
                  Sign Up
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
