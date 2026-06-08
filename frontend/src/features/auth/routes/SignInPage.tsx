import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUserProfile } from '@/shared/api/profileApi';
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
import { PasswordToggle, usePasswordVisibility } from '@/features/auth/ui/PasswordToggle';
import { GoogleSignInButton } from '@/features/auth/ui/GoogleSignInButton';
import { AuthAlert } from '@/features/auth/ui/AuthFlowElements';
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell';
import { AuthBrandPanel } from '@/features/auth/ui/AuthBrandPanel';
import { authInputClassName } from '@/features/auth/ui/authStyles';
import { features } from '@/shared/config/features';
import { useTurnstileVerification } from '@/shared/hooks/useTurnstileVerification';
import { TurnstileWidget } from '@/shared/ui';

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
  const pw = usePasswordVisibility();
  const location = useLocation();
  const navigate = useNavigate();
  const { login, updateUser } = useAuth();
  const { execute, loading, error } = useApi<AuthTokens>();
  const turnstile = useTurnstileVerification(features.authTurnstile);
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
    [login, navigate, updateUser]
  );

  const onSubmit = async (data: SignInFormData) => {
    if (!turnstile.requireVerified()) {
      return;
    }

    const result = await execute(
      () =>
        signIn({
          ...data,
          ...(features.authTurnstile ? { turnstileToken: turnstile.token } : {}),
        }),
      {
        action: 'auth.sign_in',
        onError: apiError => {
          turnstile.resetChallenge();

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
      }
    );

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
            <FaEnvelope className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--text-muted)] transition-colors duration-200 peer-focus:text-[color:var(--accent)]" />
            <input
              {...register('email')}
              id="sign-in-email"
              type="email"
              placeholder=" "
              autoComplete="email"
              className={`${authInputClassName} peer pl-10 pt-6 pb-2.5 ${errors.email ? 'animate-error-shake border-[color:var(--danger)] focus:ring-[color:var(--danger)]' : ''}`}
            />
            <label
              htmlFor="sign-in-email"
              className="pointer-events-none absolute left-10 top-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)] transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-[color:var(--text-muted)] peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-[color:var(--accent)]"
            >
              Email Address
            </label>
          </div>
          {errors.email ? (
            <p className="mt-1 text-xs text-[color:var(--danger-text)]">{errors.email.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <div className="relative">
            <FaLock className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--text-muted)] transition-colors duration-200 peer-focus:text-[color:var(--accent)]" />
            <input
              {...register('password')}
              id="sign-in-password"
              type={pw.type}
              placeholder=" "
              autoComplete="current-password"
              className={`${authInputClassName} peer pl-10 pr-10 pt-6 pb-2.5 ${errors.password ? 'animate-error-shake border-[color:var(--danger)] focus:ring-[color:var(--danger)]' : ''}`}
            />
            <PasswordToggle visible={pw.visible} onToggle={pw.toggle} />
            <label
              htmlFor="sign-in-password"
              className="pointer-events-none absolute left-10 top-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)] transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-[color:var(--text-muted)] peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-[color:var(--accent)]"
            >
              Password
            </label>
          </div>
          {errors.password ? (
            <p className="mt-1 text-xs text-[color:var(--danger-text)]">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-start sm:justify-between">
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
              <span className="mt-1 hidden text-xs leading-relaxed text-[color:var(--text-muted)] sm:block">
                Keep this browser signed in on devices you trust.
              </span>
            </span>
          </label>
          <Link
            to={routes.forgotPassword}
            className="shrink-0 whitespace-nowrap text-sm text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text-secondary)]"
          >
            Forgot password?
          </Link>
        </div>

        {error ? <AuthAlert>{error.errorMessage}</AuthAlert> : null}
        {turnstile.error ? <AuthAlert>{turnstile.error}</AuthAlert> : null}

        {features.authTurnstile ? (
          <TurnstileWidget
            action="signin"
            onClear={turnstile.clearToken}
            onVerify={turnstile.handleVerify}
            size="normal"
            widgetRef={turnstile.widgetRef}
          />
        ) : null}

        <Button
          type="submit"
          loading={loading}
          shake={hasValidationErrors}
          className="w-full"
          size="lg"
        >
          <span>{loading ? 'Signing In…' : 'Sign In'}</span>
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs text-[color:var(--text-muted)]">or</span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <GoogleSignInButton state={destination} />

      <p className="mt-8 text-center text-sm text-[color:var(--text-muted)]">
        Don't have an account?{' '}
        <Link
          to={routes.signUp}
          state={location.state}
          className="font-semibold text-[color:var(--avatar-text)] transition-colors hover:text-[color:var(--avatar-text)]"
        >
          Sign up for free
        </Link>
      </p>
    </AuthPageShell>
  );
};

export default SignInPage;
