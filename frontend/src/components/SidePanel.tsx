// src/components/SidePanel.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { Button } from './ui';
import {
    FaBars,
    FaTimes,
    FaTachometerAlt,
    FaUser,
    FaShieldAlt,
    FaLink,
    FaSignOutAlt,
} from 'react-icons/fa';

const SidePanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        AuthService.logout();
        navigate('/');
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const isActive = (path: string) => location.pathname === path;

    const menuItems = [
        {
            path: '/account/dashboard',
            icon: FaTachometerAlt,
            label: 'Dashboard',
            color: 'text-blue-600'
        },
        {
            path: '/account/url-mappings',
            icon: FaLink,
            label: 'My URL Mappings',
            color: 'text-green-600'
        },
        {
            path: '/account/security',
            icon: FaShieldAlt,
            label: 'Security',
            color: 'text-orange-600'
        },
        {
            path: '/account/profile',
            icon: FaUser,
            label: 'Profile',
            color: 'text-purple-600'
        }
    ];

    const menuItemsJSX = (
        <nav className="flex flex-col space-y-2">
            {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                            active
                                ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 shadow-sm'
                                : 'hover:bg-gray-50 hover:shadow-sm hover:translate-x-1'
                        }`}
                        onClick={() => setIsOpen(false)}
                    >
                        <Icon 
                            className={`mr-3 text-lg transition-colors duration-200 ${
                                active ? item.color : 'text-gray-500 group-hover:' + item.color
                            }`} 
                        />
                        <span className={`font-medium transition-colors duration-200 ${
                            active ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                        }`}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center shadow-lg">
                <button 
                    onClick={toggleMenu} 
                    className="text-white focus:outline-none hover:bg-blue-500 p-2 rounded-lg transition-colors duration-200"
                >
                    {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>
                <span className="text-lg font-semibold">Navigation</span>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-5 transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Side Panel */}
            <div
                className={`${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0 fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-5 transition-transform duration-300 ease-in-out`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 mt-20">
                        <h2 className="text-xl font-bold text-gray-800 mb-1">Shorty URL</h2>
                        <p className="text-sm text-gray-500">Manage your links</p>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {menuItemsJSX}
                    </div>

                    {/* Logout Button */}
                    <div className="p-6 border-t border-gray-100">
                        <Button
                            onClick={handleLogout}
                            variant="secondary"
                            className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
                        >
                            <FaSignOutAlt className="mr-3 text-lg" />
                            <span className="font-medium">Logout</span>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SidePanel;
