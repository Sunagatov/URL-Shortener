import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUserProfile } from '@/features/account/api/profileApi';
import { signIn } from '@/features/auth/api/authApi';
import type { AuthTokens } from '@/shared/auth/types';
import { useAuth } from '@/shared/auth/useAuth';
import { useApi } from '@/shared/api/useApi';
import { signInSchema, type SignInFormData } from '@/features/auth/model/authValidation';
import { routes } from '@/app/routes';
import { Button } from '@/shared/ui';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { FaChartLine, FaEnvelope, FaLock, FaRocket, FaShieldAlt } from 'react-icons/fa';
import { getAuthDestination } from '@/features/auth/lib/authRouting';
import { AuthAlert } from '@/features/auth/ui/AuthFlowElements';
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell';
import { AuthBrandPanel } from '@/features/auth/ui/AuthBrandPanel';
import { authInputClassName } from '@/features/auth/ui/authStyles';

const signInBrandPanel = (
  <AuthBrandPanel
    className="auth-brand-panel relative hidden flex-shrink-0 flex-col overflow-hidden px-12 py-16 lg:flex lg:w-[480px] xl:w-[520px]"
    heading={
      <>
        Your links,
        <br />
        <span className="gradient-text-animated">amplified.</span>
      </>
    }
    description="Shorten URLs, track performance, and share with confidence — all in one place."
    features={[
      { icon: FaRocket, text: 'Create short links in seconds' },
      { icon: FaChartLine, text: 'Track clicks and analyze traffic' },
      { icon: FaShieldAlt, text: 'Enterprise-grade link security' },
    ]}
    stats={[
      { value: '10M+', label: 'Links' },
      { value: '500K+', label: 'Users' },
      { value: '99.9%', label: 'Uptime' },
    ]}
  />
);

const SignInPage: React.FC = () => {
  usePageTitle('Sign In');
  const location = useLocation();
  const navigate = useNavigate();
  const { login, updateUser } = useAuth();
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
  const completeAuth = useCallback(
    async (tokens: AuthTokens, targetDestination: string) => {
      login(tokens, null);

      try {
        const profile = await getUserProfile();
        updateUser(profile);
      } catch {
        // Best-effort profile hydration after authentication.
      }

      navigate(targetDestination, { replace: true });
    },
    [login, navigate, updateUser],
  );

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
        <div className="space-y-1.5">
          <div className="relative">
            <FaEnvelope className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25 transition-colors duration-200 peer-focus:text-cyan-300" />
            <input
              {...register('email')}
              id="sign-in-email"
              type="email"
              placeholder=" "
              autoComplete="email"
              className={`${authInputClassName} peer pl-10 pt-6 pb-2.5 ${errors.email ? 'animate-error-shake border-red-500/30 focus:ring-red-500/30' : ''}`}
            />
            <label
              htmlFor="sign-in-email"
              className="pointer-events-none absolute left-10 top-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-white/28 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-cyan-300"
            >
              Email Address
            </label>
          </div>
          {errors.email ? <p className="mt-1 text-xs text-red-400">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-1.5">
          <div className="relative">
            <FaLock className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25 transition-colors duration-200 peer-focus:text-cyan-300" />
            <input
              {...register('password')}
              id="sign-in-password"
              type="password"
              placeholder=" "
              autoComplete="current-password"
              className={`${authInputClassName} peer pl-10 pt-6 pb-2.5 ${errors.password ? 'animate-error-shake border-red-500/30 focus:ring-red-500/30' : ''}`}
            />
            <label
              htmlFor="sign-in-password"
              className="pointer-events-none absolute left-10 top-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-white/28 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-cyan-300"
            >
              Password
            </label>
          </div>
          {errors.password ? <p className="mt-1 text-xs text-red-400">{errors.password.message}</p> : null}
        </div>

        <div className="flex items-center justify-between pt-1">
          <label htmlFor="remember-me" className="flex cursor-pointer items-start gap-3">
            <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
              <input
                id="remember-me"
                type="checkbox"
                className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <span className="flex h-5 w-5 items-center justify-center rounded-md border border-[color:var(--border-strong)] bg-[color:var(--surface-raised)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent-ring)] peer-checked:border-[color:var(--accent-border)] peer-checked:bg-[linear-gradient(135deg,var(--accent)_0%,var(--accent-strong)_100%)] peer-checked:shadow-[0_10px_22px_rgba(6,182,212,0.2)]" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium leading-snug text-[color:var(--text-secondary)]">
                Remember me
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-[color:var(--text-muted)]">
                Keep this browser signed in on devices you trust.
              </span>
            </span>
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
