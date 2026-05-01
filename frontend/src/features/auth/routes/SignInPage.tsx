import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signIn } from '@/features/auth/api/authApi';
import type { AuthTokens } from '@/shared/auth/types';
import { useApi } from '@/shared/api/useApi';
import { signInSchema, type SignInFormData } from '@/features/auth/model/authValidation';
import { routes } from '@/app/routes';
import { Button } from '@/shared/ui';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { getAuthDestination } from '@/features/auth/lib/authRouting';
import { useCompleteAuth } from '@/features/auth/model/useCompleteAuth';
import { AuthAlert } from '@/features/auth/ui/AuthFlowElements';
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell';
import { signInBrandPanel } from '@/features/auth/ui/AuthRoutePanels';
import { SignInSupportRow } from '@/features/auth/ui/sign-in/SignInSupportRow';
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
  const hasValidationErrors = Object.keys(errors).length > 0;

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

        <SignInSupportRow />

        {error ? (
          <AuthAlert>{error.errorMessage}</AuthAlert>
        ) : null}

        <Button type="submit" loading={loading} shake={hasValidationErrors} className="w-full" size="lg">
          <span>{loading ? 'Signing In…' : 'Sign In'}</span>
        </Button>
      </form>

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
