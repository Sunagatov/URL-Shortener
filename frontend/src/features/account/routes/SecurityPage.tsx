// src/components/Security.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '@/features/account/api/accountApi';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getApiErrorMessage, isSessionInvalidError } from '@/shared/lib/apiErrors';
import AccountSidebar from '@/features/account/components/AccountSidebar';
import { Button } from '@/shared/ui';
import { routes } from '@/app/routes';
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

const SecurityPage: React.FC = () => {
    const [currentPassword, setCurrentPassword]         = useState('');
    const [newPassword, setNewPassword]                 = useState('');
    const [confirmPassword, setConfirmPassword]         = useState('');
    const [successMessage, setSuccessMessage]           = useState('');
    const [errorMessage, setErrorMessage]               = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword]         = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading]                     = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();

    const getPasswordStrength = (password: string) => {
        let score = 0;
        const checks = {
            length:    password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number:    /\d/.test(password),
            special:   /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };
        Object.values(checks).forEach(c => c && score++);

        if (score < 2) return { strength: 'Weak',   width: '20%', textClass: 'text-red-400',    barClass: 'bg-red-500'    };
        if (score < 4) return { strength: 'Medium', width: '60%', textClass: 'text-amber-400',  barClass: 'bg-amber-500'  };
        return              { strength: 'Strong', width: '100%', textClass: 'text-emerald-400', barClass: 'bg-emerald-500' };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

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
            await changePassword({ currentPassword, newPassword });
            setSuccessMessage('Password changed successfully.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: unknown) {
            if (isSessionInvalidError(error)) {
                logout();
                navigate(routes.signIn, { replace: true });
                return;
            }
            setErrorMessage(getApiErrorMessage(error, 'Error changing password.'));
        } finally {
            setIsLoading(false);
        }
    };

    const securityFeatures = [
        { title: 'Password Protection', description: 'Your account is protected with a secure password', icon: FaLock,      color: 'text-emerald-400', ring: 'bg-emerald-600/20 border-emerald-500/25', badge: 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20' },
        { title: 'Account Security',    description: 'Regular security monitoring and protection',       icon: FaShieldAlt, color: 'text-emerald-400', ring: 'bg-emerald-600/20 border-emerald-500/25', badge: 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20' },
        { title: 'Data Encryption',     description: 'All your data is encrypted and secure',           icon: FaKey,       color: 'text-emerald-400', ring: 'bg-emerald-600/20 border-emerald-500/25', badge: 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20' },
    ];

    const inputClass = "w-full px-4 py-3 pr-12 bg-[#11182b] border border-white/12 text-white placeholder-white/30 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200 text-sm";

    return (
        <div className="flex min-h-screen bg-[#060612] bg-grid-dark">
            <AccountSidebar />

            <div className="flex-grow md:ml-64 px-4 pt-3 pb-8 sm:px-6 md:px-10 md:py-8">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="mb-8 mt-3 md:mt-0">
                        <h1 className="text-3xl font-black text-white mb-1 tracking-tight">Security</h1>
                        <p className="text-white/45 text-sm">Manage your account security and password settings</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Security overview */}
                        <div className="lg:col-span-1 rounded-2xl bg-white/5 border border-white/10 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-emerald-600/20 border border-emerald-500/25 rounded-xl flex items-center justify-center">
                                    <FaShieldAlt className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Security Status</p>
                                    <p className="text-xs text-white/35">Summary not available yet</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                {securityFeatures.map((feature, i) => {
                                    const Icon = feature.icon;
                                    return (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                                            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${feature.ring}`}>
                                                <Icon className={`w-3 h-3 ${feature.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-white truncate">{feature.title}</p>
                                                <p className="text-xs text-white/35 truncate">{feature.description}</p>
                                            </div>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${feature.badge}`}>
                                                Active
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaClock className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-xs font-semibold text-blue-300">Last Password Change</span>
                                </div>
                                <p className="text-xs text-blue-300/60">Password change history is not available yet.</p>
                            </div>
                        </div>

                        {/* Password change form */}
                        <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                            {/* Form header */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <FaLock className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Change Password</h2>
                                    <p className="text-blue-100/70 text-sm">Update your account password</p>
                                </div>
                            </div>

                            <form onSubmit={handlePasswordChange} className="p-8 space-y-5">
                                {/* Current password */}
                                <div>
                                    <label className="block text-white/60 text-xs font-semibold mb-2 uppercase tracking-wider">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={e => setCurrentPassword(e.target.value)}
                                            required
                                            className={inputClass}
                                            placeholder="Enter your current password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1"
                                        >
                                            {showCurrentPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                        </button>
                                    </div>
                                </div>

                                {/* New password */}
                                <div>
                                    <label className="block text-white/60 text-xs font-semibold mb-2 uppercase tracking-wider">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            required
                                            className={inputClass}
                                            placeholder="Enter your new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1"
                                        >
                                            {showNewPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                        </button>
                                    </div>

                                    {newPassword && (
                                        <div className="mt-3">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-xs text-white/40">Strength</span>
                                                <span className={`text-xs font-semibold ${passwordStrength.textClass}`}>
                                                    {passwordStrength.strength}
                                                </span>
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-1.5">
                                                <div
                                                    className={`${passwordStrength.barClass} h-1.5 rounded-full transition-all duration-300`}
                                                    style={{ width: passwordStrength.width }}
                                                />
                                            </div>
                                            <div className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
                                                {[
                                                    { ok: newPassword.length >= 8,                        label: '8+ characters'    },
                                                    { ok: /[A-Z]/.test(newPassword),                      label: 'Uppercase letter' },
                                                    { ok: /\d/.test(newPassword),                         label: 'Number'           },
                                                    { ok: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),    label: 'Special char'     },
                                                ].map((check, i) => (
                                                    <div key={i} className={`flex items-center gap-1.5 ${check.ok ? 'text-emerald-400' : 'text-white/25'}`}>
                                                        {check.ok ? <FaCheck size={9} /> : <FaTimes size={9} />}
                                                        <span>{check.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm password */}
                                <div>
                                    <label className="block text-white/60 text-xs font-semibold mb-2 uppercase tracking-wider">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            required
                                            className={`${inputClass} ${
                                                confirmPassword && newPassword !== confirmPassword
                                                    ? 'border-red-500/40 focus:ring-red-500/40'
                                                    : ''
                                            }`}
                                            placeholder="Confirm your new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1"
                                        >
                                            {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                        </button>
                                    </div>
                                    {confirmPassword && newPassword !== confirmPassword && (
                                        <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                                            <FaExclamationTriangle size={10} /> Passwords do not match
                                        </p>
                                    )}
                                </div>

                                {/* Messages */}
                                {errorMessage && (
                                    <div className="p-4 bg-red-900/30 border border-red-500/30 rounded-xl flex items-center gap-3">
                                        <FaExclamationTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                        <p className="text-red-400 text-sm">{errorMessage}</p>
                                    </div>
                                )}
                                {successMessage && (
                                    <div className="p-4 bg-emerald-900/30 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                                        <FaCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                        <p className="text-emerald-400 text-sm">{successMessage}</p>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={passwordStrength.strength === 'Weak' || newPassword !== confirmPassword}
                                    loading={isLoading}
                                    className="w-full"
                                >
                                    <FaLock className="w-4 h-4" />
                                    <span>{isLoading ? 'Updating…' : 'Update Password'}</span>
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityPage;
