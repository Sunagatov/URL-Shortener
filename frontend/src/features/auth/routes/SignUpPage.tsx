import React, { useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUserProfile } from '@/features/account/api/profileApi';
import { signUp } from '@/features/auth/api/authApi';
import {
  signUpSchema,
  type SignUpFormData,
  type SignUpFormInput,
} from '@/features/auth/model/authValidation';
import type { SignUpResponse } from '@/features/auth/types/auth';
import { routes } from '@/app/routes';
import type { AuthTokens } from '@/shared/auth/types';
import { useAuth } from '@/shared/auth/useAuth';
import { useApi } from '@/shared/api/useApi';
import { Button } from '@/shared/ui';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import {
  FaCalendarAlt,
  FaCheck,
  FaEnvelope,
  FaGlobe,
  FaLock,
  FaRocket,
  FaShieldAlt,
  FaTimes,
  FaUser,
} from 'react-icons/fa';
import { getAuthDestination } from '@/features/auth/lib/authRouting';
import { AuthAlert } from '@/features/auth/ui/AuthFlowElements';
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell';
import { AuthBrandPanel } from '@/features/auth/ui/AuthBrandPanel';
import { authInputClassName } from '@/features/auth/ui/authStyles';
import { getPasswordStrength, passwordChecks } from '@/shared/lib/passwordStrength';

const signUpBrandPanel = (
  <AuthBrandPanel
    className="auth-brand-panel relative hidden flex-shrink-0 flex-col overflow-hidden px-10 py-16 lg:flex lg:w-[420px] xl:w-[460px]"
    heading={
      <>
        Join 500K+
        <br />
        <span className="gradient-text-animated">link creators.</span>
      </>
    }
    description="Free forever. No credit card required. Start shortening and tracking your links in seconds."
    features={[
      { icon: FaRocket, text: 'Create unlimited short links' },
      { icon: FaShieldAlt, text: 'Track clicks and performance' },
      { icon: FaShieldAlt, text: 'Secure & reliable infrastructure' },
      { icon: FaShieldAlt, text: 'Export your data anytime' },
    ]}
    footer={
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4">
        <p className="mb-1 text-xs text-white/25">Trusted by teams at</p>
        <p className="text-sm font-semibold text-white/45">Startups · Agencies · Developers</p>
      </div>
    }
  />
);

const SignUpPage: React.FC = () => {
  usePageTitle('Sign Up');
  const location = useLocation();
  const navigate = useNavigate();
  const { login, updateUser } = useAuth();
  const { execute, loading, error } = useApi<SignUpResponse>();
  const destination = getAuthDestination(location.state);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormInput, unknown, SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });
  const hasValidationErrors = Object.keys(errors).length > 0;
  const password = useWatch({ control, name: 'password', defaultValue: '' });
  const passwordStrength = getPasswordStrength(password);
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

  const onSubmit = async (data: SignUpFormData) => {
    const result = await execute(() =>
      signUp({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        password: data.password,
        country: data.country.trim(),
        age: data.age,
      }),
      { action: 'auth.sign_up' },
    );

    if (!result) {
      return;
    }

    if (!result.verificationRequired && result.accessToken && result.refreshToken) {
      await completeAuth(
        {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        } satisfies AuthTokens,
        destination
      );
      return;
    }

    if (result.email && result.expiresInSeconds && result.resendAvailableInSeconds && result.deliveryMode) {
      navigate(routes.verifyEmail, {
        state: {
          email: result.email,
          destination,
          expiresInSeconds: result.expiresInSeconds,
          resendAvailableInSeconds: result.resendAvailableInSeconds,
          deliveryMode: result.deliveryMode,
        },
        replace: true,
      });
    }
  };

  return (
    <AuthPageShell
      title="Create your account"
      description="Free forever — no credit card required"
      width="lg"
      brandPanel={signUpBrandPanel}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="relative">
              <FaUser className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25 transition-colors duration-200 peer-focus:text-cyan-300" />
              <input
                {...register('firstName')}
                id="sign-up-first-name"
                type="text"
                placeholder=" "
                className={`${authInputClassName} peer pl-10 pt-6 pb-2.5 ${errors.firstName ? 'animate-error-shake border-red-500/30 focus:ring-red-500/30' : ''}`}
              />
              <label htmlFor="sign-up-first-name" className="pointer-events-none absolute left-10 top-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-white/28 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-cyan-300">First Name</label>
            </div>
            {errors.firstName ? <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <div className="relative">
              <FaUser className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25 transition-colors duration-200 peer-focus:text-cyan-300" />
              <input
                {...register('lastName')}
                id="sign-up-last-name"
                type="text"
                placeholder=" "
                className={`${authInputClassName} peer pl-10 pt-6 pb-2.5 ${errors.lastName ? 'animate-error-shake border-red-500/30 focus:ring-red-500/30' : ''}`}
              />
              <label htmlFor="sign-up-last-name" className="pointer-events-none absolute left-10 top-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-white/28 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-cyan-300">Last Name</label>
            </div>
            {errors.lastName ? <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p> : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="relative">
            <FaEnvelope className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25 transition-colors duration-200 peer-focus:text-cyan-300" />
            <input
              {...register('email')}
              id="sign-up-email"
              type="email"
              placeholder=" "
              autoComplete="email"
              className={`${authInputClassName} peer pl-10 pt-6 pb-2.5 ${errors.email ? 'animate-error-shake border-red-500/30 focus:ring-red-500/30' : ''}`}
            />
            <label htmlFor="sign-up-email" className="pointer-events-none absolute left-10 top-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-white/28 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-cyan-300">Email Address</label>
          </div>
          {errors.email ? <p className="mt-1 text-xs text-red-400">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-1.5">
          <div className="relative">
            <FaLock className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25 transition-colors duration-200 peer-focus:text-cyan-300" />
            <input
              {...register('password')}
              id="sign-up-password"
              type="password"
              placeholder=" "
              autoComplete="new-password"
              className={`${authInputClassName} peer pl-10 pt-6 pb-2.5 ${errors.password ? 'animate-error-shake border-red-500/30 focus:ring-red-500/30' : ''}`}
            />
            <label htmlFor="sign-up-password" className="pointer-events-none absolute left-10 top-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-white/28 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-cyan-300">Password</label>
          </div>
          {errors.password ? <p className="mt-1 text-xs text-red-400">{errors.password.message}</p> : null}
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/30">
              Password strength
            </span>
            <span className={`text-xs font-semibold ${passwordStrength.textClass}`}>
              {password ? passwordStrength.strength : 'Start typing'}
            </span>
          </div>
          <div className="mt-2 h-1 w-full rounded-full bg-white/[0.07]">
            <div
              className={`h-1 rounded-full transition-all duration-300 ${
                password ? passwordStrength.barClass : 'bg-white/10'
              }`}
              style={{ width: password ? passwordStrength.width : '18%' }}
            />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {passwordChecks.map((check) => {
              const passes = check.isValid(password);

              return (
                <div
                  key={check.getLabel()}
                  className={`flex items-center gap-1.5 text-xs ${
                    passes ? 'text-emerald-400' : 'text-white/25'
                  }`}
                >
                  {passes ? (
                    <FaCheck className="h-2.5 w-2.5" />
                  ) : (
                    <FaTimes className="h-2.5 w-2.5" />
                  )}
                  <span>{check.getLabel()}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="relative">
              <FaGlobe className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25 transition-colors duration-200 peer-focus:text-cyan-300" />
              <input
                {...register('country')}
                id="sign-up-country"
                type="text"
                placeholder=" "
                className={`${authInputClassName} peer pl-10 pt-6 pb-2.5 ${errors.country ? 'animate-error-shake border-red-500/30 focus:ring-red-500/30' : ''}`}
              />
              <label htmlFor="sign-up-country" className="pointer-events-none absolute left-10 top-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-white/28 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-cyan-300">Country</label>
            </div>
            {errors.country ? <p className="mt-1 text-xs text-red-400">{errors.country.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <div className="relative">
              <FaCalendarAlt className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25 transition-colors duration-200 peer-focus:text-cyan-300" />
              <input
                {...register('age')}
                id="sign-up-age"
                type="number"
                placeholder=" "
                min="1"
                max="150"
                className={`${authInputClassName} peer pl-10 pr-4 pt-6 pb-2.5 ${errors.age ? 'animate-error-shake border-red-500/30 focus:ring-red-500/30' : ''}`}
              />
              <label htmlFor="sign-up-age" className="pointer-events-none absolute left-10 top-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-white/28 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-cyan-300">Age</label>
            </div>
            {errors.age ? <p className="mt-1 text-xs text-red-400">{errors.age.message}</p> : null}
          </div>
        </div>

        <div>
          <label htmlFor="accept-terms" className="flex cursor-pointer items-start gap-3">
            <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
              <input
                {...register('acceptTerms')}
                id="accept-terms"
                type="checkbox"
                className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <span className="flex h-5 w-5 items-center justify-center rounded-md border border-[color:var(--border-strong)] bg-[color:var(--surface-raised)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent-ring)] peer-checked:border-[color:var(--accent-border)] peer-checked:bg-[linear-gradient(135deg,var(--accent)_0%,var(--accent-strong)_100%)] peer-checked:shadow-[0_10px_22px_rgba(6,182,212,0.2)]">
                <FaCheck className="h-2.5 w-2.5 scale-0 text-white transition-transform duration-150 peer-checked:scale-100" />
              </span>
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium leading-snug text-[color:var(--text-secondary)]">
                I agree to the <span className="text-white/20">Terms of Service (coming soon)</span>{' '}
                and <span className="text-white/20">Privacy Policy (coming soon)</span>
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-[color:var(--text-muted)]">
                Account creation requires accepting the current platform terms.
              </span>
            </span>
          </label>
          {errors.acceptTerms?.message ? <p className="mt-1 text-xs text-red-400">{errors.acceptTerms.message}</p> : null}
        </div>

        {error ? (
          <AuthAlert>{error.errorMessage}</AuthAlert>
        ) : null}

        <Button type="submit" loading={loading} shake={hasValidationErrors} className="w-full" size="lg">
          <span>{loading ? 'Creating Account…' : 'Create Account'}</span>
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        Already have an account?{' '}
        <Link
          to={routes.signIn}
          state={location.state}
          className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
        >
          Sign in here
        </Link>
      </p>
    </AuthPageShell>
  );
};

export default SignUpPage;
