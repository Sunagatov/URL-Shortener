import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaArrowLeft,
  FaClock,
  FaEnvelope,
  FaExclamationTriangle,
  FaRedo,
  FaShieldAlt,
} from 'react-icons/fa';
import { routes } from '@/app/routes';
import { verifyEmail, resendVerificationCode } from '@/features/auth/api/emailVerificationApi';
import { AuthBrandPanel } from '@/features/auth/ui/AuthBrandPanel';
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { useCompleteAuth } from '@/features/auth/model/useCompleteAuth';
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
  const location = useLocation();
  const completeAuth = useCompleteAuth();
  const state = location.state as LocationState;
  const email = state?.email ?? '';
  const destination = state?.destination ?? routes.dashboard;

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(CODE_LENGTH).fill(null));

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleVerify = useCallback(
    async (code: string) => {
      if (code.length !== CODE_LENGTH || isLoading) return;
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
    [email, destination, completeAuth, isLoading],
  );

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError('');

    if (digit) {
      if (index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      } else if (newDigits.every(d => d)) {
        handleVerify(newDigits.join(''));
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      } else if (index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    const newDigits = Array(CODE_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    setError('');
    const nextEmpty = newDigits.findIndex(d => !d);
    const focusIndex = nextEmpty === -1 ? CODE_LENGTH - 1 : nextEmpty;
    inputRefs.current[focusIndex]?.focus();
    if (pasted.length === CODE_LENGTH) {
      handleVerify(pasted);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending || !email) return;
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
        description="Please go through the sign-up flow to verify your email"
        brandPanel={brandPanel}
      >
        <div className="animate-fade-up space-y-5">
          <div className="flex flex-col items-center py-6">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-yellow-500/25 bg-yellow-500/10">
              <FaExclamationTriangle className="h-8 w-8 text-yellow-400" />
            </div>
            <p className="text-center text-sm text-white/45">
              This page requires an active sign-up session. Please start from the sign-up page.
            </p>
          </div>
          <Link to={routes.signUp}>
            <Button className="w-full" size="lg">
              Go to Sign Up
            </Button>
          </Link>
          <div className="text-center">
            <Link
              to={routes.signIn}
              className="inline-flex items-center gap-2 text-sm text-white/35 transition-colors hover:text-white/65"
            >
              <FaArrowLeft className="h-3 w-3" />
              Back to Sign In
            </Link>
          </div>
        </div>
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
                ref={el => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                disabled={isLoading}
                autoComplete="one-time-code"
                aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
                className={`
                  h-14 w-12 rounded-xl border text-center text-xl font-bold
                  bg-white/[0.04] text-white
                  transition-all duration-150
                  outline-none
                  focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/40
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${digit
                    ? 'border-blue-500/40 bg-blue-500/[0.06] text-blue-300'
                    : 'border-white/[0.08] hover:border-white/15'
                  }
                  ${error ? 'border-red-500/30 bg-red-500/[0.04]' : ''}
                `}
              />
            ))}
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-900/20 p-4 text-sm text-red-300">
            <span className="shrink-0">⚠</span>
            {error}
          </div>
        ) : null}

        <Button
          type="button"
          onClick={() => handleVerify(digits.join(''))}
          loading={isLoading}
          disabled={digits.some(d => !d)}
          className="w-full"
          size="lg"
        >
          <FaShieldAlt className="h-4 w-4" />
          <span>{isLoading ? 'Verifying…' : 'Verify Email'}</span>
        </Button>

        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 text-center">
          <p className="mb-3 text-sm text-white/40">Didn't receive a code?</p>
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || isResending || !email}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300 disabled:cursor-not-allowed disabled:text-white/20"
          >
            <FaRedo className={`h-3 w-3 ${isResending ? 'animate-spin' : ''}`} />
            {isResending
              ? 'Sending…'
              : countdown > 0
                ? `Resend in ${countdown}s`
                : 'Resend code'}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <Link
            to={routes.signIn}
            className="inline-flex items-center gap-2 text-white/35 transition-colors hover:text-white/65"
          >
            <FaArrowLeft className="h-3 w-3" />
            Back to Sign In
          </Link>
          <Link
            to={routes.signUp}
            className="text-white/35 transition-colors hover:text-white/65"
          >
            Wrong email?
          </Link>
        </div>
      </div>
    </AuthPageShell>
  );
};

export default VerifyEmailPage;
