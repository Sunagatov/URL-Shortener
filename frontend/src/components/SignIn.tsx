import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ApiService } from '../services/ApiService';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { signInSchema, type SignInFormData } from '../utils/validation';
import { ROUTES } from '../constants';
import type { User, AuthTokens } from '../types';
import { Button, Card, Input } from './ui';
import { FaEnvelope, FaLock, FaSignInAlt, FaGoogle, FaGithub } from 'react-icons/fa';

type AuthLocationState = {
    from?: {
        pathname: string;
        search?: string;
        hash?: string;
    };
};

const SignIn: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const { execute, loading, error } = useApi<{ user: User } & AuthTokens>();

    const from = (location.state as AuthLocationState | null)?.from;
    const destination = from
        ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
        : ROUTES.HOME;
    
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (data: SignInFormData) => {
        const result = await execute(() => ApiService.signIn(data));
        if (result) {
            const { user, accessToken, refreshToken } = result;
            login({ accessToken, refreshToken }, user);
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                <p className="text-gray-600">Sign in to your account to continue</p>
            </div>

            <Card className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        {...register('email')}
                        type="email"
                        label="Email Address"
                        placeholder="Enter your email"
                        icon={<FaEnvelope className="h-5 w-5 text-gray-400" />}
                        error={errors.email?.message}
                    />

                    <Input
                        {...register('password')}
                        type="password"
                        label="Password"
                        placeholder="Enter your password"
                        icon={<FaLock className="h-5 w-5 text-gray-400" />}
                        error={errors.password?.message}
                    />

                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="ml-2 text-sm text-gray-600">Remember me</span>
                        </label>
                        <button
                            type="button"
                            disabled
                            className="text-sm text-gray-400 cursor-not-allowed font-medium"
                            title="Password reset is not implemented yet"
                        >
                            Forgot password? (coming soon)
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center">
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
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
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
                <p className="text-gray-600">
                    Don't have an account?{' '}
                    <Link
                        to={ROUTES.SIGNUP}
                        state={location.state}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                        Sign up for free
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignIn;
