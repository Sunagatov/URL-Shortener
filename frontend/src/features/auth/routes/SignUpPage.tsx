import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signUp } from '@/features/auth/api/authApi';
import { useApi } from '@/shared/api/useApi';
import {
  signUpSchema,
  type SignUpFormData,
  type SignUpFormInput,
} from '@/features/auth/model/authValidation';
import { routes } from '@/app/routes';
import type { AuthTokens } from '@/shared/types';
import { Button } from '@/shared/ui';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { FaCalendarAlt, FaEnvelope, FaGlobe, FaLock, FaUser } from 'react-icons/fa';
import { getAuthDestination } from '@/features/auth/lib/authRouting';
import { AuthBrandPanel } from '@/features/auth/ui/AuthBrandPanel';
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell';
import { AuthTextField } from '@/features/auth/ui/AuthTextField';

const SignUpPage: React.FC = () => {
  usePageTitle('Sign Up');
  const location = useLocation();
  const navigate = useNavigate();
  const { execute, loading, error } = useApi<AuthTokens>();
  const destination = getAuthDestination(location.state);
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

    if (result !== undefined) {
      navigate(routes.verifyEmail, {
        state: { email: data.email.trim(), destination },
        replace: true,
      });
    }
  };

  return (
    <AuthPageShell
      title="Create your account"
      description="Free forever — no credit card required"
      width="lg"
      brandPanel={
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
            { text: 'Create unlimited short links' },
            { text: 'Track clicks and performance' },
            { text: 'Secure & reliable infrastructure' },
            { text: 'Export your data anytime' },
          ]}
          footer={
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4">
              <p className="mb-1 text-xs text-white/25">Trusted by teams at</p>
              <p className="text-sm font-semibold text-white/45">
                Startups · Agencies · Developers
              </p>
            </div>
          }
        />
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <AuthTextField
            registration={register('firstName')}
            id="sign-up-first-name"
            type="text"
            label="First Name"
            icon={FaUser}
            placeholder="John"
            error={errors.firstName}
          />
          <AuthTextField
            registration={register('lastName')}
            id="sign-up-last-name"
            type="text"
            label="Last Name"
            icon={FaUser}
            placeholder="Doe"
            error={errors.lastName}
          />
        </div>

        <AuthTextField
          registration={register('email')}
          id="sign-up-email"
          type="email"
          label="Email Address"
          icon={FaEnvelope}
          placeholder="john@example.com"
          autoComplete="email"
          error={errors.email}
        />
        <AuthTextField
          registration={register('password')}
          id="sign-up-password"
          type="password"
          label="Password"
          icon={FaLock}
          placeholder="Create a strong password"
          autoComplete="new-password"
          error={errors.password}
        />

        <div className="grid grid-cols-2 gap-3">
          <AuthTextField
            registration={register('country')}
            id="sign-up-country"
            type="text"
            label="Country"
            icon={FaGlobe}
            placeholder="United States"
            error={errors.country}
          />
          <AuthTextField
            registration={register('age')}
            id="sign-up-age"
            type="number"
            label="Age"
            icon={FaCalendarAlt}
            placeholder="25"
            min="1"
            max="150"
            error={errors.age}
          />
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              {...register('acceptTerms')}
              id="accept-terms"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-blue-500"
            />
            <span className="text-sm leading-snug text-white/40">
              I agree to the <span className="text-white/20">Terms of Service (coming soon)</span>{' '}
              and <span className="text-white/20">Privacy Policy (coming soon)</span>
            </span>
          </label>
          {errors.acceptTerms ? (
            <p className="mt-1 text-xs text-red-400">{errors.acceptTerms.message}</p>
          ) : null}
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-900/20 p-4 text-sm text-red-300">
            <span className="shrink-0">⚠</span>
            {error.errorMessage}
          </div>
        ) : null}

        <Button type="submit" loading={loading} className="w-full" size="lg">
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
