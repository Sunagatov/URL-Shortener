import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/AuthService';
import {
    FaTachometerAlt,
    FaUser,
    FaShieldAlt,
    FaLink,
    FaSignOutAlt,
    FaHome,
} from 'react-icons/fa';

const SidePanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        const handleToggleDrawer = () => setIsOpen((prev) => !prev);
        const handleCloseDrawer = () => setIsOpen(false);

        window.addEventListener('shorty:toggle-account-drawer', handleToggleDrawer);
        window.addEventListener('shorty:close-account-drawer', handleCloseDrawer);

        return () => {
            window.removeEventListener('shorty:toggle-account-drawer', handleToggleDrawer);
            window.removeEventListener('shorty:close-account-drawer', handleCloseDrawer);
        };
    }, []);

    React.useEffect(() => {
        setIsOpen(false);
        window.dispatchEvent(new CustomEvent('shorty:close-user-menu'));
    }, [location.pathname]);

    const handleLogout = () => {
        AuthService.logout();
        navigate('/');
    };

    const isActive = (path: string) => location.pathname === path;

    const menuItems = [
        { path: '/account/dashboard',    icon: FaTachometerAlt, label: 'Dashboard' },
        { path: '/account/url-mappings', icon: FaLink,          label: 'My URLs'   },
        { path: '/account/security',     icon: FaShieldAlt,     label: 'Security'  },
        { path: '/account/profile',      icon: FaUser,          label: 'Profile'   },
    ];

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
                fixed top-0 left-0 h-full w-64
                bg-[#0d0d20] border-r border-white/10
                z-50 transition-transform duration-300 ease-in-out
                flex flex-col
            `}>
                {/* Brand */}
                <div className="px-5 mt-20 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                            <FaLink className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white leading-tight">Shorty URL</p>
                            <p className="text-xs text-white/35">Manage your links</p>
                        </div>
                    </div>
                </div>

                <div className="mx-5 border-t border-white/10 mb-3" />

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
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                                    active
                                        ? 'bg-blue-600/20 text-white border border-blue-500/25'
                                        : 'text-white/50 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                                    active ? 'text-blue-400' : 'text-white/35 group-hover:text-white/70'
                                }`} />
                                <span className="text-sm font-medium">{item.label}</span>
                                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="px-3 pb-6">
                    <div className="border-t border-white/10 pt-3 space-y-0.5">
                        <Link
                            to="/"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/35 hover:text-white hover:bg-white/10 transition-all duration-200"
                        >
                            <FaHome className="w-4 h-4" />
                            <span className="text-sm font-medium">Home</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400/70 hover:text-red-300 hover:bg-red-900/20 transition-all duration-200"
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

export default SidePanel;
