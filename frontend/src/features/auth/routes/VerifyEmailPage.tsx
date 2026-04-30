import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaExclamationTriangle, FaRedo, FaShieldAlt } from 'react-icons/fa';
import { routes } from '@/app/routes';
import { useCompleteAuth } from '@/features/auth/model/useCompleteAuth';
import { useVerificationCodeFlow } from '@/features/auth/model/verificationCodeFlow';
import {
  AuthAlert,
  AuthBackLink,
  AuthPrimaryLink,
  AuthStatusIcon,
  AuthStatusView,
  AuthSupportCard,
} from '@/features/auth/ui/AuthFlowElements';
import { verifyEmailBrandPanel } from '@/features/auth/ui/AuthRoutePanels';
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { Button } from '@/shared/ui';

const CODE_LENGTH = 6;

type LocationState = { email?: string; destination?: string } | null;

const VerifyEmailPage: React.FC = () => {
  usePageTitle('Verify Email');
  const { state } = useLocation();
  const completeAuth = useCompleteAuth();
  const locationState = state as LocationState;
  const email = locationState?.email ?? '';
  const destination = locationState?.destination ?? routes.dashboard;
  const {
    countdown,
    digits,
    error,
    handleChange,
    handleKeyDown,
    handlePaste,
    inputRefs,
    isLoading,
    isResending,
    resendCode,
    verifyCode,
  } = useVerificationCodeFlow({ completeAuth, destination, email });

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
        <div>
          <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-widest text-white/30">
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
                    ? 'border-red-500/30 bg-red-500/[0.04]'
                    : digit
                      ? 'border-cyan-400/40 bg-cyan-500/[0.08] text-cyan-200'
                      : 'border-white/[0.08] bg-white/[0.04] text-white hover:border-white/15'
                } focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-40`}
              />
            ))}
          </div>
        </div>

        {error ? <AuthAlert>{error}</AuthAlert> : null}

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
              className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition-colors hover:text-cyan-200 disabled:cursor-not-allowed disabled:text-white/20"
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
            className="text-[color:var(--text-muted)] transition-colors hover:text-white"
          >
            Wrong email?
          </Link>
        </div>
      </div>
    </AuthPageShell>
  );
};

export default VerifyEmailPage;
