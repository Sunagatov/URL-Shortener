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
import { Button, Card, Input } from '@/shared/ui';
import { FaEnvelope, FaLock, FaSignInAlt, FaGoogle, FaGithub } from 'react-icons/fa';

type AuthLocationState = {
    from?: {
        pathname: string;
        search?: string;
        hash?: string;
    };
};

const SignInPage: React.FC = () => {
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
    } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (data: SignInFormData) => {
        const result = await execute(() => signIn(data));
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
        <div className="max-w-md w-full px-4">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FaSignInAlt className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-white/60">Sign in to your account to continue</p>
            </div>

            <Card className="p-6 sm:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        {...register('email')}
                        type="email"
                        label="Email Address"
                        placeholder="Enter your email"
                        icon={<FaEnvelope className="h-5 w-5 text-white/30" />}
                        error={errors.email?.message}
                    />

                    <Input
                        {...register('password')}
                        type="password"
                        label="Password"
                        placeholder="Enter your password"
                        icon={<FaLock className="h-5 w-5 text-white/30" />}
                        error={errors.password?.message}
                    />

                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500" />
                            <span className="ml-2 text-sm text-white/55">Remember me</span>
                        </label>
                        <button
                            type="button"
                            disabled
                            className="text-sm text-white/25 cursor-not-allowed font-medium"
                            title="Password reset is not implemented yet"
                        >
                            Forgot password? (coming soon)
                        </button>
                    </div>

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
                        <FaSignInAlt className="w-5 h-5" />
                        <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                    </Button>
                </form>

                {/* Divider */}
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[#111122] text-white/35">Or continue with</span>
                        </div>
                    </div>
                </div>

                {/* Social Login */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button
                        variant="secondary"
                        className="w-full"
                        disabled
                        title="Google sign-in is not implemented yet"
                    >
                        <FaGoogle className="w-4 h-4 text-red-500" />
                        <span>Google (coming soon)</span>
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-full"
                        disabled
                        title="GitHub sign-in is not implemented yet"
                    >
                        <FaGithub className="w-4 h-4" />
                        <span>GitHub (coming soon)</span>
                    </Button>
                </div>
            </Card>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
                <p className="text-white/60">
                    Don't have an account?{' '}
                    <Link
                        to={routes.signUp}
                        state={location.state}
                        className="text-blue-400 hover:text-blue-300 font-semibold"
                    >
                        Sign up for free
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignInPage;
