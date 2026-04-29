import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getUserProfile, signUp } from '@/features/auth/api/authApi';
import { useApi } from '@/shared/api/useApi';
import { useAuth } from '@/shared/auth/useAuth';
import { signUpSchema, type SignUpFormData, type SignUpFormInput } from '@/features/auth/model/authValidation';
import { routes } from '@/app/routes';
import type { AuthTokens } from '@/shared/types';
import { Button } from '@/shared/ui';
import { FaUser, FaEnvelope, FaLock, FaGlobe, FaCalendarAlt, FaLink, FaCheck } from 'react-icons/fa';

type AuthLocationState = {
    from?: { pathname: string; search?: string; hash?: string };
};

const BrandPanel: React.FC = () => (
    <div className="hidden lg:flex lg:w-[420px] xl:w-[460px] flex-col auth-brand-panel px-10 py-16 relative overflow-hidden flex-shrink-0">
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-600/12 rounded-full blur-[90px] orb-1 pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-indigo-600/10 rounded-full blur-[80px] orb-2 pointer-events-none" />
        <div className="absolute inset-0 bg-grid-dark pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3 mb-14">
            <div className="w-9 h-9 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                <FaLink className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Shorty URL</span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-[1.15] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Join 500K+<br />
                <span className="gradient-text-animated">link creators.</span>
            </h2>
            <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-xs">
                Free forever. No credit card required. Start shortening and tracking your links in seconds.
            </p>

            <div className="space-y-3">
                {[
                    'Create unlimited short links',
                    'Track clicks and performance',
                    'Secure & reliable infrastructure',
                    'Export your data anytime',
                ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
                            <FaCheck className="w-2.5 h-2.5 text-blue-400" />
                        </div>
                        <span className="text-sm text-white/50">{f}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="relative z-10 mt-10 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.07]">
            <p className="text-xs text-white/25 mb-1">Trusted by teams at</p>
            <p className="text-sm font-semibold text-white/45">Startups · Agencies · Developers</p>
        </div>
    </div>
);

const inputClass =
    'w-full px-4 py-3 pl-10 bg-[#0d0f1c] border border-white/[0.08] text-white ' +
    'placeholder-white/25 rounded-xl transition-all duration-200 text-sm ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30';

const FieldIcon: React.FC<{ icon: React.ElementType }> = ({ icon: Icon }) => (
    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
);

const SignUpPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, updateUser } = useAuth();
    const { execute, loading, error } = useApi<AuthTokens>();

    const from = (location.state as AuthLocationState | null)?.from;
    const destination = from ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}` : routes.home;

    const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormInput, unknown, SignUpFormData>({
        resolver: zodResolver(signUpSchema),
    });

    const onSubmit = async (data: SignUpFormData) => {
        const result = await execute(() =>
            signUp({
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                email: data.email.trim(),
                password: data.password,
                country: data.country.trim(),
                age: data.age,
            })
        );
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
            <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8 overflow-y-auto">
                <div className="w-full max-w-lg">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                            <FaLink className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <span className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Shorty URL</span>
                    </div>

                    <div className="mb-7">
                        <h1 className="text-2xl font-bold text-white mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                            Create your account
                        </h1>
                        <p className="text-white/40 text-sm">Free forever — no credit card required</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Name row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">First Name</label>
                                <div className="relative">
                                    <FieldIcon icon={FaUser} />
                                    <input {...register('firstName')} type="text" placeholder="John" className={inputClass} />
                                </div>
                                {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">Last Name</label>
                                <div className="relative">
                                    <FieldIcon icon={FaUser} />
                                    <input {...register('lastName')} type="text" placeholder="Doe" className={inputClass} />
                                </div>
                                {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">Email</label>
                            <div className="relative">
                                <FieldIcon icon={FaEnvelope} />
                                <input {...register('email')} type="email" placeholder="john@example.com" className={inputClass} autoComplete="email" />
                            </div>
                            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">Password</label>
                            <div className="relative">
                                <FieldIcon icon={FaLock} />
                                <input {...register('password')} type="password" placeholder="Create a strong password" className={inputClass} autoComplete="new-password" />
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
                        </div>

                        {/* Country + Age row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">Country</label>
                                <div className="relative">
                                    <FieldIcon icon={FaGlobe} />
                                    <input {...register('country')} type="text" placeholder="United States" className={inputClass} />
                                </div>
                                {errors.country && <p className="mt-1 text-xs text-red-400">{errors.country.message}</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">Age</label>
                                <div className="relative">
                                    <FieldIcon icon={FaCalendarAlt} />
                                    <input {...register('age')} type="number" placeholder="25" min="1" max="150" className={inputClass} />
                                </div>
                                {errors.age && <p className="mt-1 text-xs text-red-400">{errors.age.message}</p>}
                            </div>
                        </div>

                        {/* Terms */}
                        <div>
                            <label className="flex items-start gap-2.5 cursor-pointer">
                                <input
                                    {...register('acceptTerms')}
                                    id="accept-terms"
                                    type="checkbox"
                                    className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-500"
                                />
                                <span className="text-sm text-white/40 leading-snug">
                                    I agree to the{' '}
                                    <span className="text-white/20">Terms of Service</span>
                                    {' '}and{' '}
                                    <span className="text-white/20">Privacy Policy</span>
                                </span>
                            </label>
                            {errors.acceptTerms && (
                                <p className="mt-1 text-xs text-red-400">{errors.acceptTerms.message}</p>
                            )}
                        </div>

                        {error && (
                            <div className="p-4 bg-red-900/20 border border-red-500/20 text-red-300 rounded-xl flex items-center gap-2 text-sm">
                                <span className="shrink-0">⚠</span>
                                {error.errorMessage}
                            </div>
                        )}

                        <Button type="submit" loading={loading} className="w-full" size="lg">
                            <span>{loading ? 'Creating Account…' : 'Create Account'}</span>
                        </Button>
                    </form>

                    <p className="text-center mt-6 text-sm text-white/40">
                        Already have an account?{' '}
                        <Link to={routes.signIn} state={location.state} className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
