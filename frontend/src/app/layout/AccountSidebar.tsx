import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { routes } from '@/app/routes';
import { authSession } from '@/shared/auth/authSession';
import { useAuth } from '@/shared/auth/useAuth';
import {
    FaTachometerAlt,
    FaUser,
    FaShieldAlt,
    FaLink,
    FaSignOutAlt,
    FaHome,
} from 'react-icons/fa';

interface SidePanelProps {
    desktopVisible?: boolean;
}

const AccountSidebar: React.FC<SidePanelProps> = ({ desktopVisible = true }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    React.useEffect(() => {
        const handleToggleDrawer = () => setIsOpen((prev) => !prev);
        const handleCloseDrawer  = () => setIsOpen(false);
        window.addEventListener('shorty:toggle-account-drawer', handleToggleDrawer);
        window.addEventListener('shorty:close-account-drawer',  handleCloseDrawer);
        return () => {
            window.removeEventListener('shorty:toggle-account-drawer', handleToggleDrawer);
            window.removeEventListener('shorty:close-account-drawer',  handleCloseDrawer);
        };
    }, []);

    React.useEffect(() => {
        setIsOpen(false);
        window.dispatchEvent(new CustomEvent('shorty:close-user-menu'));
    }, [location.pathname]);

    const handleLogout = () => {
        authSession.logout();
        navigate(routes.home);
    };

    const isActive = (path: string) => location.pathname === path;

    const menuItems = [
        { path: routes.dashboard,   icon: FaTachometerAlt, label: 'Dashboard' },
        { path: routes.urlMappings, icon: FaLink,          label: 'My URLs'   },
        { path: routes.security,    icon: FaShieldAlt,     label: 'Security'  },
        { path: routes.profile,     icon: FaUser,          label: 'Profile'   },
    ];

    const displayName = user
        ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
        : 'Account';

    const initials = user
        ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase() || 'U'
        : 'U';

    return (
        <>
            {/* Mobile backdrop — sits below the header */}
            {isOpen && (
                <div
                    className="md:hidden fixed top-[72px] inset-x-0 bottom-0 bg-black/70 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar — starts below the header on both mobile and desktop */}
            <div className={`
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                ${desktopVisible ? 'md:translate-x-0' : 'md:hidden'}
                fixed top-[72px] md:top-24 left-0
                h-[calc(100vh-72px)] md:h-[calc(100vh-96px)] w-64
                bg-[#0a0c1b] border-r border-white/[0.07]
                z-[55] transition-transform duration-300 ease-in-out
                flex flex-col
            `}>
                {/* User profile section */}
                <div className="px-4 pt-4 pb-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                        <div className="w-9 h-9 rounded-xl bg-blue-600/25 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-blue-300" style={{ fontFamily: 'var(--font-display)' }}>
                                {initials}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate leading-tight">
                                {displayName}
                            </p>
                            {user?.email && displayName !== user.email && (
                                <p className="text-xs text-white/35 truncate mt-0.5">{user.email}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mx-4 border-t border-white/[0.06] mb-2" />

                {/* Nav */}
                <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`
                                    group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                                    ${active ? 'sidebar-item-active' : 'text-white/45 hover:text-white hover:bg-white/[0.06]'}
                                `}
                            >
                                <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                                    active ? 'text-blue-400' : 'text-white/30 group-hover:text-white/60'
                                }`} />
                                <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="px-3 pb-5">
                    <div className="border-t border-white/[0.06] pt-3 space-y-0.5">
                        <Link
                            to={routes.home}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all duration-200"
                        >
                            <FaHome className="w-4 h-4" />
                            <span className="text-sm font-medium">Home</span>
                        </Link>
                        <button
                            type="button"
                            aria-label="Sign out"
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400/60 hover:text-red-300 hover:bg-red-900/15 transition-all duration-200"
                        >
                            <FaSignOutAlt className="w-4 h-4" />
                            <span className="text-sm font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AccountSidebar;
