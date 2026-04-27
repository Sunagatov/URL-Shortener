// src/components/Security.tsx
import React, { useState } from 'react';
import { ApiService } from '../services/ApiService';
import SidePanel from './SidePanel';
import { Button } from './ui';
import {
    FaShieldAlt,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaCheck,
    FaTimes,
    FaKey,
    FaClock,
    FaExclamationTriangle
} from 'react-icons/fa';

const Security: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const getPasswordStrength = (password: string) => {
        let score = 0;
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        Object.values(checks).forEach(check => check && score++);
        
        if (score < 2) {
            return {
                strength: 'Weak',
                width: '20%',
                textClass: 'text-red-600',
                barClass: 'bg-red-500',
            };
        }

        if (score < 4) {
            return {
                strength: 'Medium',
                width: '60%',
                textClass: 'text-yellow-600',
                barClass: 'bg-yellow-500',
            };
        }

        return {
            strength: 'Strong',
            width: '100%',
            textClass: 'text-green-600',
            barClass: 'bg-green-500',
        };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (newPassword !== confirmPassword) {
            setErrorMessage('New password and confirm password do not match.');
            setIsLoading(false);
            return;
        }

        if (passwordStrength.strength === 'Weak') {
            setErrorMessage('Please choose a stronger password.');
            setIsLoading(false);
            return;
        }

        try {
            await ApiService.changePassword({
                currentPassword,
                newPassword,
            });

            setSuccessMessage('Password changed successfully.');
            setErrorMessage('');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            if (error.response) {
                setErrorMessage(error.response.data.errorMessage || 'Error changing password.');
            } else if (error.request) {
                setErrorMessage('No response from the server. Please try again later.');
            } else {
                setErrorMessage('Error: ' + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const securityFeatures = [
        {
            title: 'Password Protection',
            description: 'Your account is protected with a secure password',
            icon: FaLock,
            status: 'Active',
            iconWrapperClass: 'bg-green-100',
            iconClass: 'text-green-600',
            badgeClass: 'bg-green-100 text-green-600',
        },
        {
            title: 'Account Security',
            description: 'Regular security monitoring and protection',
            icon: FaShieldAlt,
            status: 'Active',
            iconWrapperClass: 'bg-green-100',
            iconClass: 'text-green-600',
            badgeClass: 'bg-green-100 text-green-600',
        },
        {
            title: 'Data Encryption',
            description: 'All your data is encrypted and secure',
            icon: FaKey,
            status: 'Active',
            iconWrapperClass: 'bg-green-100',
            iconClass: 'text-green-600',
            badgeClass: 'bg-green-100 text-green-600',
        }
    ];

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <SidePanel />
            <div className="flex-grow md:ml-72 p-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Settings</h1>
                        <p className="text-gray-600">Manage your account security and password settings</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Security Overview */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
                                <div className="flex items-center mb-6">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                                        <FaShieldAlt className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Security Status</h3>
                                        <p className="text-sm text-gray-500 font-medium">Security summary is not available yet</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {securityFeatures.map((feature, index) => {
                                        const Icon = feature.icon;
                                        return (
                                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${feature.iconWrapperClass}`}>
                                                    <Icon className={`w-4 h-4 ${feature.iconClass}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{feature.title}</p>
                                                    <p className="text-xs text-gray-500">{feature.description}</p>
                                                </div>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${feature.badgeClass}`}>
                                                    {feature.status}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Last Password Change */}
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <FaClock className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-900">Last Password Change</span>
                                    </div>
                                    <p className="text-sm text-blue-700">Last password change information is not available yet</p>
                                    <p className="text-xs text-blue-600 mt-1">Account-level security history will appear here when supported.</p>
                                </div>
                            </div>
                        </div>

                        {/* Password Change Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
                                {/* Form Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                                            <FaLock className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Change Password</h2>
                                            <p className="text-blue-100">Update your account password</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Content */}
                                <form onSubmit={handlePasswordChange} className="p-8">
                                    {/* Current Password */}
                                    <div className="mb-6">
                                        <label className="block text-gray-700 text-sm font-semibold mb-3">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                placeholder="Enter your current password"
                                            />
                                            <Button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                            >
                                                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div className="mb-6">
                                        <label className="block text-gray-700 text-sm font-semibold mb-3">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? 'text' : 'password'}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                placeholder="Enter your new password"
                                            />
                                            <Button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                            >
                                                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                            </Button>
                                        </div>
                                        
                                        {/* Password Strength Indicator */}
                                        {newPassword && (
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Password Strength</span>
                                                    <span className={`text-sm font-medium ${passwordStrength.textClass}`}>
                                                        {passwordStrength.strength}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className={`${passwordStrength.barClass} h-2 rounded-full transition-all duration-300`}
                                                        style={{ width: passwordStrength.width }}
                                                    ></div>
                                                </div>
                                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                                    <div className={`flex items-center space-x-1 ${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {newPassword.length >= 8 ? <FaCheck /> : <FaTimes />}
                                                        <span>8+ characters</span>
                                                    </div>
                                                    <div className={`flex items-center space-x-1 ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {/[A-Z]/.test(newPassword) ? <FaCheck /> : <FaTimes />}
                                                        <span>Uppercase letter</span>
                                                    </div>
                                                    <div className={`flex items-center space-x-1 ${/\d/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {/\d/.test(newPassword) ? <FaCheck /> : <FaTimes />}
                                                        <span>Number</span>
                                                    </div>
                                                    <div className={`flex items-center space-x-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? <FaCheck /> : <FaTimes />}
                                                        <span>Special character</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="mb-6">
                                        <label className="block text-gray-700 text-sm font-semibold mb-3">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                                                    confirmPassword && newPassword !== confirmPassword
                                                        ? 'border-red-300 focus:ring-red-500'
                                                        : 'border-gray-300 focus:ring-blue-500'
                                                }`}
                                                placeholder="Confirm your new password"
                                            />
                                            <Button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                            >
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </Button>
                                        </div>
                                        {confirmPassword && newPassword !== confirmPassword && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center">
                                                <FaExclamationTriangle className="mr-1" />
                                                Passwords do not match
                                            </p>
                                        )}
                                    </div>

                                    {/* Messages */}
                                    {errorMessage && (
                                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
                                            <FaExclamationTriangle className="w-5 h-5 text-red-600 mr-3" />
                                            <p className="text-red-600 text-sm">{errorMessage}</p>
                                        </div>
                                    )}
                                    {successMessage && (
                                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center">
                                            <FaCheck className="w-5 h-5 text-green-600 mr-3" />
                                            <p className="text-green-600 text-sm">{successMessage}</p>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        disabled={passwordStrength.strength === 'Weak' || newPassword !== confirmPassword}
                                        loading={isLoading}
                                        className="w-full"
                                    >
                                        <FaLock className="w-4 h-4" />
                                        <span>{isLoading ? 'Updating Password...' : 'Update Password'}</span>
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Security;
