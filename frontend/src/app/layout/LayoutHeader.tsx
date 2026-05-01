import { Link } from 'react-router-dom';
import { FaChevronDown, FaLink, FaSignOutAlt } from 'react-icons/fa';
import { accountNavigationItems } from '@/app/layout/layoutNavigation';
import { routes } from '@/app/routes';
import type { User } from '@/shared/types';

interface LayoutHeaderProps {
  isAuthenticated: boolean;
  isSignInRoute: boolean;
  isSignUpRoute: boolean;
  isUserMenuOpen: boolean;
  pathname: string;
  user: User | null;
  onLogout: () => void;
  onToggleUserMenu: () => void;
  onCloseUserMenu: () => void;
}

export const LayoutHeader = ({
  isAuthenticated,
  isSignInRoute,
  isSignUpRoute,
  isUserMenuOpen,
  pathname,
  user,
  onLogout,
  onToggleUserMenu,
  onCloseUserMenu,
}: LayoutHeaderProps) => {
  const initials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase() || 'U'
    : 'U';
  const firstName = user?.firstName?.trim() || null;
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : 'Account';

  return (
    <header className="fixed z-[60] w-full border-b border-[color:var(--border)] bg-[rgba(var(--bg-base-rgb),0.72)] py-4 text-white backdrop-blur-xl">
      <div className="container relative mx-auto flex items-center justify-between px-4">
        <div className="w-10 md:hidden" />

        <Link
          to={routes.home}
          className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2.5 text-xl font-bold transition-opacity duration-200 hover:opacity-80 md:static md:translate-x-0 md:text-2xl"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--accent-border)] bg-[var(--accent-glow)] backdrop-blur-sm">
            <FaLink className="h-4 w-4 text-cyan-200" />
          </div>
          <span
            className="bg-gradient-to-r from-white via-cyan-100 to-sky-300 bg-clip-text font-bold tracking-tight text-transparent"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Shorty URL
          </span>
        </Link>

        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={onToggleUserMenu}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--border-strong)] bg-white/8 transition duration-200 hover:border-[color:var(--accent-border)] hover:bg-white/12 md:h-auto md:w-auto md:gap-2 md:px-3 md:py-2"
                aria-label="Open account menu"
              >
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-600/25">
                  <span className="text-xs font-bold text-blue-300" style={{ fontFamily: 'var(--font-display)' }}>
                    {initials}
                  </span>
                </div>
                {firstName ? (
                  <span className="hidden text-sm font-medium md:inline">Hi, {firstName}</span>
                ) : (
                  <span className="hidden text-sm font-medium md:inline">Account</span>
                )}
                <FaChevronDown
                  className={`hidden h-3 w-3 transition-transform duration-200 md:block ${isUserMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Backdrop */}
              {isUserMenuOpen && (
                <div className="fixed inset-0 z-10" onClick={onCloseUserMenu} />
              )}

              {/* Dropdown — always rendered, toggled via opacity/scale */}
              <div
                className={`absolute right-0 z-20 mt-2 w-64 rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface-overlay)] py-2 shadow-[0_24px_50px_rgba(4,10,24,0.42)] backdrop-blur-xl transition-all duration-200 origin-top-right ${
                  isUserMenuOpen
                    ? 'pointer-events-auto scale-100 opacity-100'
                    : 'pointer-events-none scale-95 opacity-0'
                }`}
              >
                <div className="border-b border-[color:var(--border)] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-600/25">
                      <span className="text-sm font-bold text-blue-300" style={{ fontFamily: 'var(--font-display)' }}>
                        {initials}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold leading-tight text-white">{displayName}</p>
                      {user?.email && displayName !== user.email && (
                        <p className="mt-0.5 truncate text-xs text-[color:var(--text-muted)]">{user.email}</p>
                      )}
                    </div>
                  </div>
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
                            ? 'bg-cyan-500/10 text-white'
                            : 'text-[color:var(--text-secondary)] hover:bg-white/8 hover:text-white'
                        }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-cyan-400" />
                        )}
                        <Icon className={`h-3.5 w-3.5 ${active ? 'text-cyan-300' : ''}`} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
                <div className="border-t border-[color:var(--border)] pt-1.5">
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex w-full items-center space-x-3 px-4 py-2.5 text-red-400/80 transition-colors duration-200 hover:bg-red-900/15 hover:text-red-300"
                  >
                    <FaSignOutAlt className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to={isSignInRoute ? routes.signUp : routes.signIn}
                className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--accent-border)] bg-[linear-gradient(135deg,var(--accent)_0%,var(--accent-strong)_100%)] px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5"
              >
                {isSignInRoute ? 'Sign Up' : 'Sign In'}
              </Link>
              {!isSignUpRoute && !isSignInRoute && (
                <Link
                  to={routes.signUp}
                  className="hidden text-sm font-medium text-[color:var(--text-secondary)] transition-colors duration-200 hover:text-white md:inline"
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
