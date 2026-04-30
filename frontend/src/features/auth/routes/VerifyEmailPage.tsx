import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaClock,
  FaEnvelope,
  FaExclamationTriangle,
  FaRedo,
  FaShieldAlt,
} from 'react-icons/fa';
import { routes } from '@/app/routes';
import { resendVerificationCode, verifyEmail } from '@/features/auth/api/emailVerificationApi';
import { useCompleteAuth } from '@/features/auth/model/useCompleteAuth';
import { AuthBrandPanel } from '@/features/auth/ui/AuthBrandPanel';
import {
  AuthAlert,
  AuthBackLink,
  AuthPrimaryLink,
  AuthStatusIcon,
  AuthStatusView,
  AuthSupportCard,
} from '@/features/auth/ui/AuthFlowElements';
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { Button } from '@/shared/ui';

const CODE_LENGTH = 6;

const brandPanel = (
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

type LocationState = { email?: string; destination?: string } | null;

const VerifyEmailPage: React.FC = () => {
  usePageTitle('Verify Email');
  const { state } = useLocation();
  const completeAuth = useCompleteAuth();
  const locationState = state as LocationState;
  const email = locationState?.email ?? '';
  const destination = locationState?.destination ?? routes.dashboard;

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(CODE_LENGTH).fill(null));

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleVerify = useCallback(
    async (code: string) => {
      if (code.length !== CODE_LENGTH || isLoading) {
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const tokens = await verifyEmail({ email, code });
        await completeAuth(tokens, destination);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Invalid or expired code. Please try again.'));
        setDigits(Array(CODE_LENGTH).fill(''));
        setTimeout(() => inputRefs.current[0]?.focus(), 0);
      } finally {
        setIsLoading(false);
      }
    },
    [completeAuth, destination, email, isLoading],
  );

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    setDigits(nextDigits);
    setError('');

    if (!digit) {
      return;
    }

    if (index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      return;
    }

    if (nextDigits.every(Boolean)) {
      void handleVerify(nextDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      if (digits[index]) {
        const nextDigits = [...digits];
        nextDigits[index] = '';
        setDigits(nextDigits);
        return;
      }

      if (index > 0) {
        const nextDigits = [...digits];
        nextDigits[index - 1] = '';
        setDigits(nextDigits);
        inputRefs.current[index - 1]?.focus();
      }
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);

    if (!pasted) {
      return;
    }

    const nextDigits = Array(CODE_LENGTH).fill('');

    for (let index = 0; index < pasted.length; index += 1) {
      nextDigits[index] = pasted[index];
    }

    setDigits(nextDigits);
    setError('');

    const nextEmptyIndex = nextDigits.findIndex((digit) => !digit);
    inputRefs.current[nextEmptyIndex === -1 ? CODE_LENGTH - 1 : nextEmptyIndex]?.focus();

    if (pasted.length === CODE_LENGTH) {
      void handleVerify(pasted);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending || !email) {
      return;
    }

    setIsResending(true);
    setError('');

    try {
      await resendVerificationCode(email);
      setCountdown(60);
      setDigits(Array(CODE_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 0);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to resend code. Please try again.'));
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <AuthPageShell
        title="No email provided"
        description="Please go through the sign-up flow to verify your email."
        brandPanel={brandPanel}
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
      brandPanel={brandPanel}
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
          onClick={() => void handleVerify(digits.join(''))}
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
              onClick={() => void handleResend()}
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
