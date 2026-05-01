import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { routes } from '@/app/routes';
import { accountNavigationItems } from '@/features/account/config/navigation';
import { useAuth } from '@/shared/auth/useAuth';
import { FaHome, FaSignOutAlt } from 'react-icons/fa';

interface SidePanelProps {
  desktopVisible?: boolean;
}

const AccountSidebar: React.FC<SidePanelProps> = ({ desktopVisible = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(routes.home);
  };

  const isActive = (path: string) => location.pathname === path;
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : 'Account';
  const initials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase() || 'U'
    : 'U';

  return (
    <div
      className={`
        hidden
        ${desktopVisible ? 'md:flex' : 'md:hidden'}
        fixed left-0 top-24 z-[55] h-[calc(100vh-96px)] w-64
        flex-col border-r border-white/[0.07] bg-[#0a0c1b]
      `}
    >
      <div className="px-4 pb-3 pt-4">
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.04] p-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-600/25">
            <span
              className="text-sm font-bold text-blue-300"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {initials}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight text-white">{displayName}</p>
            {user?.email && displayName !== user.email ? (
              <p className="mt-0.5 truncate text-xs text-white/35">{user.email}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-4 mb-2 border-t border-white/[0.06]" />

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {accountNavigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200
                ${
                  active
                    ? 'sidebar-item-active'
                    : 'text-white/45 hover:bg-white/[0.06] hover:text-white'
                }
              `}
            >
              <Icon
                className={`h-4 w-4 flex-shrink-0 transition-colors ${
                  active ? 'text-blue-400' : 'text-white/30 group-hover:text-white/60'
                }`}
              />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-5">
        <div className="space-y-0.5 border-t border-white/[0.06] pt-3">
          <Link
            to={routes.home}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/30 transition-all duration-200 hover:bg-white/[0.06] hover:text-white/70"
          >
            <FaHome className="h-4 w-4" />
            <span className="text-sm font-medium">Home</span>
          </Link>
          <button
            type="button"
            aria-label="Sign out"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-red-400/60 transition-all duration-200 hover:bg-red-900/15 hover:text-red-300"
          >
            <FaSignOutAlt className="h-4 w-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSidebar;
