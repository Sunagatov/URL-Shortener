import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCheck,
  FaClock,
  FaEnvelope,
  FaInbox,
  FaLock,
  FaShieldAlt,
} from 'react-icons/fa';
import { routes } from '@/app/routes';
import { requestPasswordReset } from '@/features/auth/api/passwordResetApi';
import { AuthBrandPanel } from '@/features/auth/ui/AuthBrandPanel';
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell';
import { authInputClassName } from '@/features/auth/ui/authStyles';
import { getApiErrorStatus } from '@/shared/lib/apiErrors';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { Button } from '@/shared/ui';

const brandPanel = (
  <AuthBrandPanel
    className="auth-brand-panel relative hidden flex-shrink-0 flex-col overflow-hidden px-12 py-16 lg:flex lg:w-[480px] xl:w-[520px]"
    heading={
      <>
        Reset your password,
        <br />
        <span className="gradient-text-animated">securely.</span>
      </>
    }
    description="We'll email you a one-time reset link. It takes less than a minute to regain access."
    features={[
      { icon: FaLock, text: 'Private, one-time recovery link' },
      { icon: FaClock, text: 'Latest link wins automatically' },
      { icon: FaShieldAlt, text: 'Neutral responses protect your privacy' },
    ]}
    stats={[
      { value: '<1 min', label: 'Recovery time' },
      { value: '15 min', label: 'Link lifetime' },
      { value: '1 link', label: 'Active at a time' },
    ]}
  />
);

const RESEND_COOLDOWN_SECONDS = 30;

function maskEmailAddress(email: string): string {
  const [localPart, domain] = email.split('@');

  if (!localPart || !domain) {
    return email;
  }

  const visibleLocal = localPart.slice(0, 2);
  const hiddenLocal = '•'.repeat(Math.max(localPart.length - visibleLocal.length, 1));
  const [domainName, ...domainTail] = domain.split('.');
  const visibleDomain = domainName.slice(0, 1);
  const hiddenDomain = '•'.repeat(Math.max(domainName.length - visibleDomain.length, 1));

  return `${visibleLocal}${hiddenLocal}@${visibleDomain}${hiddenDomain}${domainTail.length ? `.${domainTail.join('.')}` : ''}`;
}

const ForgotPasswordPage: React.FC = () => {
  usePageTitle('Forgot Password');
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [error, setError] = useState('');
  const [inlineNotice, setInlineNotice] = useState('');

  useEffect(() => {
    if (!submitted || cooldownSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldownSeconds(seconds => (seconds <= 1 ? 0 : seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds, submitted]);

  const completeSubmission = (targetEmail: string, notice?: string) => {
    setSubmittedEmail(targetEmail);
    setSubmitted(true);
    setInlineNotice(notice ?? '');
    setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
  };

  const sendRecoveryLink = async (targetEmail: string, mode: 'initial' | 'resend') => {
    if (mode === 'initial') {
      setError('');
      setIsLoading(true);
    } else {
      setInlineNotice('');
      setIsResending(true);
    }

    try {
      await requestPasswordReset(targetEmail);
      completeSubmission(
        targetEmail,
        mode === 'resend' ? 'If that account exists, we sent a fresh recovery email.' : ''
      );
    } catch (err: unknown) {
      if (getApiErrorStatus(err) !== undefined) {
        completeSubmission(
          targetEmail,
          mode === 'resend' ? 'If that account exists, we sent a fresh recovery email.' : ''
        );
        return;
      }

      if (mode === 'initial') {
        setError('We could not reach the server. Please check your connection and try again.');
      } else {
        setInlineNotice('We could not send another email right now. Please try again shortly.');
      }
    } finally {
      if (mode === 'initial') {
        setIsLoading(false);
      } else {
        setIsResending(false);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await sendRecoveryLink(email.trim(), 'initial');
  };

  if (submitted) {
    return (
      <AuthPageShell
        title="Check your email"
        description={`If an account exists for ${maskEmailAddress(submittedEmail)}, recovery instructions are on the way.`}
        brandPanel={brandPanel}
      >
        <div className="animate-fade-up space-y-5">
          <div className="flex flex-col items-center py-4">
            <div className="relative mb-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-500/25 bg-emerald-500/12">
                <FaInbox className="h-8 w-8 text-emerald-400" />
              </div>
              <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20">
                <FaCheck className="h-3 w-3 text-emerald-400" />
              </div>
            </div>

            <div className="mb-2 text-center">
              <p className="text-sm text-white/40">Recovery requested for</p>
              <p className="mt-1 break-all text-sm font-semibold text-white">{submittedEmail}</p>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-4 space-y-3">
            {[
              'Look in your inbox, spam, and promotions folders',
              'The newest recovery link automatically replaces older ones',
              'Keep this tab open while you check your email',
            ].map(hint => (
              <div key={hint} className="flex items-start gap-2.5 text-sm text-white/45">
                <FaCheck className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500/70" />
                <span>{hint}</span>
              </div>
            ))}
          </div>

          {inlineNotice ? (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 text-sm text-white/60">
              {inlineNotice}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => void sendRecoveryLink(submittedEmail, 'resend')}
              loading={isResending}
              disabled={cooldownSeconds > 0}
            >
              <FaEnvelope className="h-4 w-4" />
              <span>
                {cooldownSeconds > 0 ? `Resend in ${cooldownSeconds}s` : 'Resend email'}
              </span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => {
                setSubmitted(false);
                setEmail(submittedEmail);
                setInlineNotice('');
              }}
            >
              Try a different email
            </Button>
          </div>

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
      title="Recover your account"
      description="Enter your email and, if an account exists, we'll send recovery instructions."
      brandPanel={brandPanel}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="forgot-email"
            className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-white/30"
          >
            Email Address
          </label>
          <div className="relative">
            <FaEnvelope className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
            <input
              id="forgot-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="your@email.com"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoFocus
              className={`${authInputClassName} pl-10`}
            />
          </div>
          <p className="mt-2 text-xs text-white/35">
            We keep this response neutral so no one can use it to confirm whether an account
            exists.
          </p>
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-900/20 p-4 text-sm text-red-300">
            <span className="shrink-0">⚠</span>
            {error}
          </div>
        ) : null}

        <Button type="submit" loading={isLoading} className="w-full" size="lg">
          <FaEnvelope className="h-4 w-4" />
          <span>{isLoading ? 'Sending…' : 'Email Recovery Link'}</span>
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to={routes.signIn}
          className="inline-flex items-center gap-2 text-sm text-white/35 transition-colors hover:text-white/65"
        >
          <FaArrowLeft className="h-3 w-3" />
          Back to Sign In
        </Link>
      </div>

      <p className="mt-6 text-center text-sm text-white/30">
        Don't have an account?{' '}
        <Link
          to={routes.signUp}
          className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
        >
          Sign up for free
        </Link>
      </p>
    </AuthPageShell>
  );
};

export default ForgotPasswordPage;
