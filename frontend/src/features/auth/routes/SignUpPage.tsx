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
import { Button, Card, Input } from '@/shared/ui';
import { FaUser, FaEnvelope, FaLock, FaGlobe, FaCalendarAlt, FaUserPlus, FaGoogle } from 'react-icons/fa';

type AuthLocationState = {
    from?: {
        pathname: string;
        search?: string;
        hash?: string;
    };
};

const SignUpPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, updateUser } = useAuth();
    const { execute, loading, error } = useApi<AuthTokens>();

    const from = (location.state as AuthLocationState | null)?.from;
    const destination = from
        ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
        : routes.home;
    
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpFormInput, unknown, SignUpFormData>({
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
            try {
                const profile = await getUserProfile();
                updateUser(profile);
            } catch {
                // Keep the authenticated session even if the profile bootstrap request fails.
            }
            navigate(destination, { replace: true });
        }
    };

    return (
        <div className="max-w-lg w-full px-4">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FaUserPlus className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                <p className="text-white/60">Join us and start shortening your URLs today</p>
            </div>

            <Card className="p-6 sm:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            {...register('firstName')}
                            type="text"
                            label="First Name"
                            placeholder="John"
                            icon={<FaUser className="h-5 w-5 text-white/30" />}
                            error={errors.firstName?.message}
                        />
                        <Input
                            {...register('lastName')}
                            type="text"
                            label="Last Name"
                            placeholder="Doe"
                            icon={<FaUser className="h-5 w-5 text-white/30" />}
                            error={errors.lastName?.message}
                        />
                    </div>

                    {/* Email */}
                    <Input
                        {...register('email')}
                        type="email"
                        label="Email Address"
                        placeholder="john@example.com"
                        icon={<FaEnvelope className="h-5 w-5 text-white/30" />}
                        error={errors.email?.message}
                    />

                    {/* Password */}
                    <Input
                        {...register('password')}
                        type="password"
                        label="Password"
                        placeholder="Create a strong password"
                        icon={<FaLock className="h-5 w-5 text-white/30" />}
                        error={errors.password?.message}
                    />

                    {/* Profile Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            {...register('country')}
                            type="text"
                            label="Country"
                            placeholder="United States"
                            icon={<FaGlobe className="h-5 w-5 text-white/30" />}
                            error={errors.country?.message}
                        />
                        <Input
                            {...register('age')}
                            type="number"
                            label="Age"
                            placeholder="25"
                            min="1"
                            max="150"
                            icon={<FaCalendarAlt className="h-5 w-5 text-white/30" />}
                            error={errors.age?.message}
                        />
                    </div>

                    {/* Terms */}
                    <div className="flex items-start">
                        <input
                            {...register('acceptTerms')}
                            id="accept-terms"
                            type="checkbox"
                            className="mt-1 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500"
                            aria-invalid={Boolean(errors.acceptTerms)}
                            aria-describedby={errors.acceptTerms ? 'accept-terms-error' : undefined}
                        />
                        <span className="ml-2 text-sm text-white/55">
                            <label htmlFor="accept-terms" className="cursor-pointer">
                                I agree to the{' '}
                            </label>
                            <span className="text-white/25">Terms of Service (coming soon)</span>
                            {' '}and{' '}
                            <span className="text-white/25">Privacy Policy (coming soon)</span>
                        </span>
                    </div>
                    {errors.acceptTerms && (
                        <p id="accept-terms-error" className="text-red-400 text-sm flex items-center">
                            <span className="mr-1">!</span>
                            {errors.acceptTerms.message}
                        </p>
                    )}

                    {error && (
                        <div className="p-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-xl flex items-center">
                            <span className="mr-2">!</span>
                            <p className="text-sm">{error.errorMessage}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        loading={loading}
                        className="w-full"
                        size="lg"
                    >
                        <FaUserPlus className="w-5 h-5" />
                        <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                    </Button>
                </form>

                {/* Divider */}
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[#111122] text-white/35">Or sign up with</span>
                        </div>
                    </div>
                </div>

                {/* Social Login */}
                <div className="mt-6">
                    <Button
                        variant="secondary"
                        className="w-full"
                        disabled
                        title="Google sign-up is currently unavailable"
                    >
                        <FaGoogle className="w-4 h-4 text-red-500" />
                        <span>Google</span>
                    </Button>
                </div>
            </Card>

            {/* Sign In Link */}
            <div className="text-center mt-6">
                <p className="text-white/60">
                    Already have an account?{' '}
                    <Link
                        to={routes.signIn}
                        state={location.state}
                        className="text-blue-400 hover:text-blue-300 font-semibold"
                    >
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUpPage;
