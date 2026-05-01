import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signUp } from '@/features/auth/api/authApi';
import {
  signUpSchema,
  type SignUpFormData,
  type SignUpFormInput,
} from '@/features/auth/model/authValidation';
import type { SignUpResponse } from '@/features/auth/types/auth';
import { routes } from '@/app/routes';
import type { AuthTokens } from '@/shared/auth/types';
import { useApi } from '@/shared/api/useApi';
import { Button } from '@/shared/ui';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { FaCalendarAlt, FaCheck, FaEnvelope, FaGlobe, FaLock, FaTimes, FaUser } from 'react-icons/fa';
import { getAuthDestination } from '@/features/auth/lib/authRouting';
import { useCompleteAuth } from '@/features/auth/model/useCompleteAuth';
import { AuthAlert } from '@/features/auth/ui/AuthFlowElements';
import { AuthCheckboxField } from '@/features/auth/ui/AuthCheckboxField';
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell';
import { signUpBrandPanel } from '@/features/auth/ui/AuthRoutePanels';
import { AuthTextField } from '@/features/auth/ui/AuthTextField';
import { getPasswordStrength, passwordChecks } from '@/shared/lib/passwordStrength';

const SignUpPage: React.FC = () => {
  usePageTitle('Sign Up');
  const location = useLocation();
  const navigate = useNavigate();
  const completeAuth = useCompleteAuth();
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
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/30">Password strength</span>
            <span className={`text-xs font-semibold ${passwordStrength.textClass}`}>
              {password ? passwordStrength.strength : 'Start typing'}
            </span>
          </div>
          <div className="mt-2 h-1 w-full rounded-full bg-white/[0.07]">
            <div
              className={`h-1 rounded-full transition-all duration-300 ${password ? passwordStrength.barClass : 'bg-white/10'}`}
              style={{ width: password ? passwordStrength.width : '18%' }}
            />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {passwordChecks.map((check) => {
              const passes = check.isValid(password);

              return (
                <div
                  key={check.getLabel()}
                  className={`flex items-center gap-1.5 text-xs ${passes ? 'text-emerald-400' : 'text-white/25'}`}
                >
                  {passes ? <FaCheck className="h-2.5 w-2.5" /> : <FaTimes className="h-2.5 w-2.5" />}
                  <span>{check.getLabel()}</span>
                </div>
              );
            })}
          </div>
        </div>

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

        <AuthCheckboxField
          {...register('acceptTerms')}
          id="accept-terms"
          label={(
            <>
              I agree to the <span className="text-white/20">Terms of Service (coming soon)</span>{' '}
              and <span className="text-white/20">Privacy Policy (coming soon)</span>
            </>
          )}
          description="Account creation requires accepting the current platform terms."
          error={errors.acceptTerms?.message}
        />

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
