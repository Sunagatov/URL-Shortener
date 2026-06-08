import React, { useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaClock, FaEnvelope, FaExclamationTriangle, FaRedo, FaShieldAlt } from 'react-icons/fa';
import { routes } from '@/app/routes';
import { getUserProfile } from '@/shared/api/profileApi';
import { useVerificationCodeFlow } from '@/features/auth/model/verificationCodeFlow';
import {
  AuthAlert,
  AuthBackLink,
  AuthPrimaryLink,
  AuthStatusIcon,
  AuthStatusView,
  AuthSupportCard,
} from '@/features/auth/ui/AuthFlowElements';
import { AuthBrandPanel } from '@/features/auth/ui/AuthBrandPanel';
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell';
import type { AuthTokens } from '@/shared/auth/types';
import { useAuth } from '@/shared/auth/useAuth';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { Button, TurnstileWidget } from '@/shared/ui';
import { features } from '@/shared/config/features';
import { useTurnstileVerification } from '@/shared/hooks/useTurnstileVerification';

const verifyEmailBrandPanel = (
  <AuthBrandPanel
    className="auth-brand-panel relative hidden flex-shrink-0 flex-col overflow-hidden px-12 py-16 lg:flex lg:w-[480px] xl:w-[520px]"
    heading={
      <>
        Check your
        <br />
        <span className="gradient-text-animated">inbox.</span>
      </>
    }
    description="We sent a 6-digit code to your email. Enter it below to activate your account."
    features={[
      { icon: FaEnvelope, text: 'Code sent to your inbox' },
      { icon: FaClock, text: 'Code expires in 10 minutes' },
      { icon: FaShieldAlt, text: 'Your account stays secure' },
    ]}
    stats={[
      { value: '6-digit', label: 'Code' },
      { value: '<10 min', label: 'Expiry' },
      { value: '99.9%', label: 'Uptime' },
    ]}
  />
);

const CODE_LENGTH = 6;

type LocationState = {
  email?: string;
  destination?: string;
  expiresInSeconds?: number;
  resendAvailableInSeconds?: number;
  deliveryMode?: 'email' | 'log';
} | null;

const VerifyEmailPage: React.FC = () => {
  usePageTitle('Verify Email');
  const { state } = useLocation();
  const navigate = useNavigate();
  const { login, updateUser } = useAuth();
  const locationState = state as LocationState;
  const email = locationState?.email ?? '';
  const turnstile = useTurnstileVerification(features.authTurnstile);
  const destination = locationState?.destination ?? routes.dashboard;
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
  const {
    countdown,
    deliveryMode,
    digits,
    error,
    expiresInSeconds,
    handleChange,
    handleKeyDown,
    handlePaste,
    inputRefs,
    isLoading,
    isResending,
    resendCode,
    verifyCode,
  } = useVerificationCodeFlow({
    completeAuth,
    destination,
    email,
    initialExpiresInSeconds: locationState?.expiresInSeconds,
    initialResendAvailableInSeconds: locationState?.resendAvailableInSeconds,
    initialDeliveryMode: locationState?.deliveryMode,
    requireTurnstileVerified: turnstile.requireVerified,
    resetTurnstileChallenge: turnstile.resetChallenge,
    turnstileToken: features.authTurnstile ? turnstile.token : undefined,
  });

  if (!email) {
    return (
      <AuthPageShell
        title="No email provided"
        description="Please go through the sign-up flow to verify your email."
        brandPanel={verifyEmailBrandPanel}
      >
        <AuthStatusView
          title="No email provided"
          description="This page requires an active sign-up session. Please start from the sign-up page."
          icon={(
            <AuthStatusIcon badge="warning">
              <FaExclamationTriangle className="h-8 w-8 text-amber-300" />
            </AuthStatusIcon>
          )}
          action={(
            <>
              <AuthPrimaryLink to={routes.signUp}>Go to Sign Up</AuthPrimaryLink>
              <div className="text-center">
                <AuthBackLink to={routes.signIn}>Back to Sign In</AuthBackLink>
              </div>
            </>
          )}
        />
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      title="Verify your email"
      description={`Enter the 6-digit code sent to ${email}`}
      brandPanel={verifyEmailBrandPanel}
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--card-bg)] px-4 py-3 text-sm text-[color:var(--text-secondary)]">
          <p>Code expires in {Math.max(1, Math.ceil(expiresInSeconds / 60))} minute(s).</p>
          {deliveryMode === 'log' ? (
            <p className="mt-1 text-amber-200/80">
              Local development mode is active. The latest verification code is written to the backend logs.
            </p>
          ) : null}
        </div>

        <div>
          <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
            Verification Code
          </p>
          <div className="flex items-center justify-center gap-2.5" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                disabled={isLoading}
                autoComplete="one-time-code"
                aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
                className={`h-14 w-12 rounded-2xl border text-center text-xl font-bold outline-none transition duration-150 ${
                  error
                    ? 'border-[color:var(--danger)] bg-[var(--danger-bg)]'
                    : digit
                      ? 'border-cyan-400/40 bg-cyan-500/[0.08] text-[color:var(--accent)]'
                      : 'border-[color:var(--border)] bg-[var(--card-bg)] text-[color:var(--text-primary)] hover:border-[color:var(--border)]'
                } focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-40`}
              />
            ))}
          </div>
        </div>

        {error ? <AuthAlert>{error}</AuthAlert> : null}
        {turnstile.error ? <AuthAlert>{turnstile.error}</AuthAlert> : null}

        {features.authTurnstile ? (
          <TurnstileWidget
            action="verify_email"
            onClear={turnstile.clearToken}
            onVerify={turnstile.handleVerify}
            widgetRef={turnstile.widgetRef}
          />
        ) : null}

        <Button
          type="button"
          onClick={() => void verifyCode(digits.join(''))}
          loading={isLoading}
          disabled={digits.some((digit) => !digit)}
          className="w-full"
          size="lg"
        >
          <FaShieldAlt className="h-4 w-4" />
          <span>{isLoading ? 'Verifying…' : 'Verify Email'}</span>
        </Button>

        <AuthSupportCard>
          <div className="text-center">
            <p className="mb-3 text-sm text-[color:var(--text-secondary)]">Didn't receive a code?</p>
            <button
              type="button"
              onClick={() => void resendCode()}
              disabled={countdown > 0 || isResending || !email}
              className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--accent)] transition-colors hover:text-[color:var(--accent)] disabled:cursor-not-allowed disabled:text-[color:var(--text-muted)]"
            >
              <FaRedo className={`h-3 w-3 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? 'Sending…' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
            </button>
          </div>
        </AuthSupportCard>

        <div className="flex items-center justify-between text-sm">
          <AuthBackLink to={routes.signIn}>Back to Sign In</AuthBackLink>
          <Link
            to={routes.signUp}
            className="text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text-primary)]"
          >
            Wrong email?
          </Link>
        </div>
      </div>
    </AuthPageShell>
  );
};

export default VerifyEmailPage;
