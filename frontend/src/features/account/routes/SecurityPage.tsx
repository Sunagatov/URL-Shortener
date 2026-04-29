import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountSidebar from '@/app/layout/AccountSidebar';
import { routes } from '@/app/routes';
import { changePassword } from '@/features/account/api/accountApi';
import { useAuth } from '@/shared/auth/useAuth';
import { getApiErrorMessage, isSessionInvalidError } from '@/shared/lib/apiErrors';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { Button, useToast } from '@/shared/ui';
import { FaShieldAlt, FaLock, FaEye, FaEyeSlash, FaCheck, FaTimes, FaKey, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const PasswordVisibilityToggle: React.FC<{ show: boolean; onToggle: () => void }> = ({ show, onToggle }) => (
    <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/25 transition-colors hover:text-white/55"
        aria-label={show ? 'Hide password' : 'Show password'}
    >
        {show ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
    </button>
);

const SecurityPage: React.FC = () => {
    usePageTitle('Security');
    const [currentPassword, setCurrentPassword]         = useState('');
    const [newPassword, setNewPassword]                 = useState('');
    const [confirmPassword, setConfirmPassword]         = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword]         = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading]                     = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();
    const toast = useToast();

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
        if (score < 2) return { strength: 'Weak',   width: '20%', textClass: 'text-red-400',   barClass: 'bg-red-500'   };
        if (score < 4) return { strength: 'Medium', width: '60%', textClass: 'text-amber-400', barClass: 'bg-amber-500' };
        return              { strength: 'Strong', width: '100%', textClass: 'text-blue-400',  barClass: 'bg-blue-500'  };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        if (newPassword !== confirmPassword) { toast.error('Passwords do not match.'); setIsLoading(false); return; }
        if (passwordStrength.strength === 'Weak') { toast.error('Please choose a stronger password.'); setIsLoading(false); return; }
        try {
            await changePassword({ currentPassword, newPassword });
            toast.success('Password changed successfully.');
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (error: unknown) {
            if (isSessionInvalidError(error)) { logout(); navigate(routes.signIn, { replace: true }); return; }
            toast.error(getApiErrorMessage(error, 'Error changing password.'));
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass =
        'w-full px-4 py-3 pr-12 bg-[#0d0f1c] border border-white/[0.08] text-white ' +
        'placeholder-white/25 rounded-xl transition-all duration-200 text-sm ' +
        'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30';

    return (
        <div className="flex min-h-[calc(100vh-72px)] bg-[#060612] bg-grid-dark md:min-h-[calc(100vh-96px)]">
            <AccountSidebar />

            <div className="flex-grow md:ml-64 px-4 pt-3 pb-10 sm:px-6 md:px-10 md:py-8">
                <div className="max-w-4xl mx-auto">

                    <div className="mb-8 mt-3 md:mt-0">
                        <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                            Security
                        </h1>
                        <p className="text-white/40 text-sm mt-0.5">Manage your account security and password settings</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                        {/* Security status panel */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-5">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 bg-blue-600/15 border border-blue-500/20 rounded-xl flex items-center justify-center">
                                        <FaShieldAlt className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">Security Status</p>
                                        <p className="text-xs text-white/30">Summary not available yet</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {[
                                        { icon: FaLock,      label: 'Password Protection', desc: 'Account is protected' },
                                        { icon: FaShieldAlt, label: 'Account Security',    desc: 'Regular monitoring'   },
                                        { icon: FaKey,       label: 'Data Encryption',     desc: 'All data is encrypted' },
                                    ].map((f, i) => {
                                        const Icon = f.icon;
                                        return (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                                                <div className="w-7 h-7 bg-blue-600/10 border border-blue-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Icon className="w-3 h-3 text-blue-400/70" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-white/75 truncate">{f.label}</p>
                                                    <p className="text-[10px] text-white/30 truncate">{f.desc}</p>
                                                </div>
                                                <span className="text-[10px] font-medium text-blue-400/80 bg-blue-900/25 border border-blue-500/15 px-2 py-0.5 rounded-full flex-shrink-0">
                                                    Active
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center gap-3">
                                    <FaClock className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Last Password Change</p>
                                        <p className="text-xs text-white/25 mt-0.5">History not available yet.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Password change form */}
                        <div className="lg:col-span-3 rounded-2xl bg-white/[0.04] border border-white/[0.07] overflow-hidden">
                            <div className="px-6 py-5 border-b border-white/[0.07] flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-600/15 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FaLock className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Change Password</p>
                                    <p className="text-xs text-white/35">Update your account password</p>
                                </div>
                            </div>

                            <form onSubmit={handlePasswordChange} className="p-6 space-y-5">
                                {/* Current password */}
                                <div>
                                    <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">
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
                                        <PasswordVisibilityToggle show={showCurrentPassword} onToggle={() => setShowCurrentPassword(v => !v)} />
                                    </div>
                                </div>

                                {/* New password */}
                                <div>
                                    <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            required
                                            className={inputClass}
                                            placeholder="Enter a new strong password"
                                        />
                                        <PasswordVisibilityToggle show={showNewPassword} onToggle={() => setShowNewPassword(v => !v)} />
                                    </div>

                                    {newPassword && (
                                        <div className="mt-3 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] text-white/30 uppercase tracking-widest">Strength</span>
                                                <span className={`text-xs font-semibold ${passwordStrength.textClass}`}>
                                                    {passwordStrength.strength}
                                                </span>
                                            </div>
                                            <div className="w-full bg-white/[0.07] rounded-full h-1">
                                                <div
                                                    className={`${passwordStrength.barClass} h-1 rounded-full transition-all duration-300`}
                                                    style={{ width: passwordStrength.width }}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                                                {[
                                                    { ok: newPassword.length >= 8,                     label: '8+ characters'    },
                                                    { ok: /[A-Z]/.test(newPassword),                   label: 'Uppercase letter' },
                                                    { ok: /\d/.test(newPassword),                      label: 'Number'           },
                                                    { ok: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),  label: 'Special char'     },
                                                ].map((check, i) => (
                                                    <div key={i} className={`flex items-center gap-1.5 text-xs ${check.ok ? 'text-blue-400' : 'text-white/20'}`}>
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
                                    <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            required
                                            className={`${inputClass} ${confirmPassword && newPassword !== confirmPassword ? 'border-red-500/30 focus:ring-red-500/30' : ''}`}
                                            placeholder="Confirm your new password"
                                        />
                                        <PasswordVisibilityToggle show={showConfirmPassword} onToggle={() => setShowConfirmPassword(v => !v)} />
                                    </div>
                                    {confirmPassword && newPassword !== confirmPassword && (
                                        <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                                            <FaExclamationTriangle size={10} /> Passwords do not match
                                        </p>
                                    )}
                                </div>

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
