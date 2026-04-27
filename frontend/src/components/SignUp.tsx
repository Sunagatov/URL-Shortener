import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ApiService } from '../services/ApiService';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { signUpSchema, type SignUpFormData, type SignUpFormInput } from '../utils/validation';
import { ROUTES } from '../constants';
import type { User, AuthTokens } from '../types';
import { Button, Card, Input } from './ui';
import { FaUser, FaEnvelope, FaLock, FaGlobe, FaCalendarAlt, FaUserPlus, FaGoogle, FaGithub } from 'react-icons/fa';

type AuthLocationState = {
    from?: {
        pathname: string;
        search?: string;
        hash?: string;
    };
};

const SignUp: React.FC = () => {
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
    } = useForm<SignUpFormInput, unknown, SignUpFormData>({
        resolver: zodResolver(signUpSchema),
    });

    const onSubmit = async (data: SignUpFormData) => {
        const result = await execute(() =>
            ApiService.signUp({
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                email: data.email.trim(),
                password: data.password,
                country: data.country.trim(),
                age: data.age,
            })
        );
        if (result) {
            const { user, accessToken, refreshToken } = result;
            login({ accessToken, refreshToken }, user);
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                <p className="text-gray-600">Join us and start shortening your URLs today</p>
            </div>

            <Card className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            {...register('firstName')}
                            type="text"
                            label="First Name"
                            placeholder="John"
                            icon={<FaUser className="h-5 w-5 text-gray-400" />}
                            error={errors.firstName?.message}
                        />
                        <Input
                            {...register('lastName')}
                            type="text"
                            label="Last Name"
                            placeholder="Doe"
                            icon={<FaUser className="h-5 w-5 text-gray-400" />}
                            error={errors.lastName?.message}
                        />
                    </div>

                    {/* Email */}
                    <Input
                        {...register('email')}
                        type="email"
                        label="Email Address"
                        placeholder="john@example.com"
                        icon={<FaEnvelope className="h-5 w-5 text-gray-400" />}
                        error={errors.email?.message}
                    />

                    {/* Password */}
                    <Input
                        {...register('password')}
                        type="password"
                        label="Password"
                        placeholder="Create a strong password"
                        icon={<FaLock className="h-5 w-5 text-gray-400" />}
                        error={errors.password?.message}
                    />

                    {/* Profile Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            {...register('country')}
                            type="text"
                            label="Country"
                            placeholder="United States"
                            icon={<FaGlobe className="h-5 w-5 text-gray-400" />}
                            error={errors.country?.message}
                        />
                        <Input
                            {...register('age')}
                            type="number"
                            label="Age"
                            placeholder="25"
                            min="1"
                            max="150"
                            icon={<FaCalendarAlt className="h-5 w-5 text-gray-400" />}
                            error={errors.age?.message}
                        />
                    </div>

                    {/* Terms */}
                    <div className="flex items-start">
                        <input type="checkbox" className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" required />
                        <span className="ml-2 text-sm text-gray-600">
                            I agree to the{' '}
                            <span className="text-gray-400">Terms of Service (coming soon)</span>
                            {' '}and{' '}
                            <span className="text-gray-400">Privacy Policy (coming soon)</span>
                        </span>
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
                        <FaUserPlus className="w-5 h-5" />
                        <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                    </Button>
                </form>

                {/* Divider */}
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                        </div>
                    </div>
                </div>

                {/* Social Login */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button
                        variant="secondary"
                        className="w-full"
                        disabled
                        title="Google sign-up is not implemented yet"
                    >
                        <FaGoogle className="w-4 h-4 text-red-500" />
                        <span>Google (coming soon)</span>
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-full"
                        disabled
                        title="GitHub sign-up is not implemented yet"
                    >
                        <FaGithub className="w-4 h-4" />
                        <span>GitHub (coming soon)</span>
                    </Button>
                </div>
            </Card>

            {/* Sign In Link */}
            <div className="text-center mt-6">
                <p className="text-gray-600">
                    Already have an account?{' '}
                    <Link
                        to={ROUTES.SIGNIN}
                        state={location.state}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
