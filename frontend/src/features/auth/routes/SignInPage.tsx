import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getUserProfile, signIn } from '@/features/auth/api/authApi';
import { useApi } from '@/shared/api/useApi';
import { useAuth } from '@/shared/auth/useAuth';
import { signInSchema, type SignInFormData } from '@/features/auth/model/authValidation';
import { routes } from '@/app/routes';
import type { AuthTokens } from '@/shared/types';
import { Button } from '@/shared/ui';
import { FaEnvelope, FaLock, FaLink, FaRocket, FaShieldAlt, FaChartLine } from 'react-icons/fa';

type AuthLocationState = {
    from?: { pathname: string; search?: string; hash?: string };
};

const BrandPanel: React.FC = () => (
    <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col auth-brand-panel px-12 py-16 relative overflow-hidden flex-shrink-0">
        {/* Background orbs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-600/15 rounded-full blur-[90px] orb-1 pointer-events-none" />
        <div className="absolute bottom-1/3 right-0 w-56 h-56 bg-indigo-600/12 rounded-full blur-[80px] orb-2 pointer-events-none" />
        <div className="absolute inset-0 bg-grid-dark pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 mb-16">
            <div className="w-9 h-9 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                <FaLink className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Shorty URL</span>
        </div>

        {/* Headline */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] mb-5" style={{ fontFamily: 'var(--font-display)' }}>
                Your links,<br />
                <span className="gradient-text-animated">amplified.</span>
            </h2>
            <p className="text-white/45 text-base leading-relaxed mb-10 max-w-sm">
                Shorten URLs, track performance, and share with confidence — all in one place.
            </p>

            {/* Feature list */}
            <div className="space-y-4">
                {[
                    { icon: FaRocket,    text: 'Create short links in seconds' },
                    { icon: FaChartLine, text: 'Track clicks and analyze traffic' },
                    { icon: FaShieldAlt, text: 'Enterprise-grade link security'  },
                ].map((f, i) => {
                    const Icon = f.icon;
                    return (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-blue-600/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-3 h-3 text-blue-400" />
                            </div>
                            <span className="text-sm text-white/55">{f.text}</span>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Stat row */}
        <div className="relative z-10 grid grid-cols-3 gap-3 mt-10">
            {[
                { num: '10M+',  label: 'Links' },
                { num: '500K+', label: 'Users' },
                { num: '99.9%', label: 'Uptime' },
            ].map((s, i) => (
                <div key={i} className="text-center p-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                    <p className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{s.num}</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">{s.label}</p>
                </div>
            ))}
        </div>
    </div>
);

const inputClass =
    'w-full px-4 py-3 pl-11 bg-[#0d0f1c] border border-white/[0.08] text-white ' +
    'placeholder-white/25 rounded-xl transition-all duration-200 text-sm ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30';

const SignInPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, updateUser } = useAuth();
    const { execute, loading, error } = useApi<AuthTokens>();

    const from = (location.state as AuthLocationState | null)?.from;
    const destination = from ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}` : routes.home;

    const { register, handleSubmit, formState: { errors } } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (data: SignInFormData) => {
        const result = await execute(() => signIn(data));
        if (result) {
            login(result, null);
            try { const profile = await getUserProfile(); updateUser(profile); } catch { /* ok */ }
            navigate(destination, { replace: true });
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-72px)] md:min-h-[calc(100vh-96px)]">
            <BrandPanel />

            {/* Form panel */}
            <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                            <FaLink className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <span className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Shorty URL</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                            Welcome back
                        </h1>
                        <p className="text-white/40 text-sm">Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">Email</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="your@email.com"
                                    className={inputClass}
                                    autoComplete="email"
                                />
                            </div>
                            {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                                <input
                                    {...register('password')}
                                    type="password"
                                    placeholder="Enter your password"
                                    className={inputClass}
                                    autoComplete="current-password"
                                />
                            </div>
                            {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-blue-500" />
                                <span className="text-sm text-white/40">Remember me</span>
                            </label>
                            <span className="text-sm text-white/20 cursor-not-allowed">Forgot password?</span>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-900/20 border border-red-500/20 text-red-300 rounded-xl flex items-center gap-2 text-sm">
                                <span className="shrink-0">⚠</span>
                                {error.errorMessage}
                            </div>
                        )}

                        <Button type="submit" loading={loading} className="w-full" size="lg">
                            <span>{loading ? 'Signing In…' : 'Sign In'}</span>
                        </Button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/[0.08]" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-3 bg-[#060612] text-white/25">Or continue with</span>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <Button variant="secondary" className="w-full" disabled title="Google sign-in coming soon">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                <span className="text-white/40">Google</span>
                            </Button>
                            <Button variant="secondary" className="w-full" disabled title="GitHub sign-in coming soon">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                                <span className="text-white/40">GitHub</span>
                            </Button>
                        </div>
                    </div>

                    <p className="text-center mt-8 text-sm text-white/40">
                        Don't have an account?{' '}
                        <Link to={routes.signUp} state={location.state} className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                            Sign up free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
