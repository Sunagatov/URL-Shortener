import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signIn } from '@/features/auth/api/authApi';
import { useApi } from '@/shared/api/useApi';
import { signInSchema, type SignInFormData } from '@/features/auth/model/authValidation';
import { routes } from '@/app/routes';
import type { AuthTokens } from '@/shared/types';
import { Button } from '@/shared/ui';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { getAuthDestination } from '@/features/auth/lib/authRouting';
import { useCompleteAuth } from '@/features/auth/model/useCompleteAuth';
import { AuthAlert } from '@/features/auth/ui/AuthFlowElements';
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell';
import { signInBrandPanel } from '@/features/auth/ui/AuthRoutePanels';
import { AuthTextField } from '@/features/auth/ui/AuthTextField';

const SignInPage: React.FC = () => {
  usePageTitle('Sign In');
  const location = useLocation();
  const navigate = useNavigate();
  const completeAuth = useCompleteAuth();
  const { execute, loading, error } = useApi<AuthTokens>();
  const destination = getAuthDestination(location.state);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    const result = await execute(() => signIn(data), {
      action: 'auth.sign_in',
      onError: (apiError) => {
        if (apiError.code !== 'EMAIL_NOT_VERIFIED') {
          return;
        }

        navigate(routes.verifyEmail, {
          state: {
            email: data.email.trim(),
            destination,
          },
        });
      },
    });

    if (result) {
      await completeAuth(result, destination);
    }
  };

  return (
    <AuthPageShell
      title="Welcome back"
      description="Sign in to your account to continue"
      brandPanel={signInBrandPanel}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthTextField
          registration={register('email')}
          id="sign-in-email"
          type="email"
          label="Email Address"
          icon={FaEnvelope}
          placeholder="your@email.com"
          autoComplete="email"
          error={errors.email}
        />
        <AuthTextField
          registration={register('password')}
          id="sign-in-password"
          type="password"
          label="Password"
          icon={FaLock}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password}
        />

        <div className="flex items-center justify-between pt-1">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 accent-blue-500"
            />
            <span className="text-sm text-white/40">Remember me</span>
          </label>
          <Link
            to={routes.forgotPassword}
            className="text-sm text-white/40 transition-colors hover:text-white/70"
          >
            Forgot password?
          </Link>
        </div>

        {error ? (
          <AuthAlert>{error.errorMessage}</AuthAlert>
        ) : null}

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
            <span className="bg-[rgb(var(--bg-base-rgb))] px-3 text-white/25">Or continue with</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            className="w-full"
            disabled
            title="Google sign-in coming soon"
          >
            <span className="text-white/40">Google</span>
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            disabled
            title="GitHub sign-in coming soon"
          >
            <span className="text-white/40">GitHub</span>
          </Button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-white/40">
        Don't have an account?{' '}
        <Link
          to={routes.signUp}
          state={location.state}
          className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
        >
          Sign up for free
        </Link>
      </p>
    </AuthPageShell>
  );
};

export default SignInPage;
