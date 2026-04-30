import React, { useState } from 'react';
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
import { getApiErrorMessage } from '@/shared/lib/apiErrors';
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
      { icon: FaLock, text: 'Secure, one-time reset link' },
      { icon: FaClock, text: 'Link expires in 15 minutes' },
      { icon: FaShieldAlt, text: 'Your account stays encrypted' },
    ]}
    stats={[
      { value: '<1 min', label: 'Recovery time' },
      { value: '256-bit', label: 'Encryption' },
      { value: '99.9%', label: 'Uptime' },
    ]}
  />
);

const ForgotPasswordPage: React.FC = () => {
  usePageTitle('Forgot Password');
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await requestPasswordReset(email.trim());
      setSubmittedEmail(email.trim());
      setSubmitted(true);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to send reset link. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthPageShell
        title="Check your inbox"
        description={`We sent a reset link to ${submittedEmail}`}
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
              <p className="text-sm text-white/40">Reset link sent to</p>
              <p className="mt-1 break-all text-sm font-semibold text-white">{submittedEmail}</p>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-4 space-y-3">
            {[
              'Check your inbox and spam folder',
              'The link expires in 15 minutes',
              'Only the most recent link will work',
            ].map(hint => (
              <div key={hint} className="flex items-start gap-2.5 text-sm text-white/45">
                <FaCheck className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500/70" />
                <span>{hint}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setEmail(submittedEmail);
            }}
            className="w-full rounded-xl border border-white/[0.08] bg-transparent py-3 text-sm font-medium text-white/50 transition-all duration-200 hover:border-white/15 hover:text-white/70"
          >
            Try a different email
          </button>

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
      title="Forgot your password?"
      description="Enter your email and we'll send you a secure reset link"
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
              type="email"
              required
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              autoFocus
              className={`${authInputClassName} pl-10`}
            />
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-900/20 p-4 text-sm text-red-300">
            <span className="shrink-0">⚠</span>
            {error}
          </div>
        ) : null}

        <Button type="submit" loading={isLoading} className="w-full" size="lg">
          <FaEnvelope className="h-4 w-4" />
          <span>{isLoading ? 'Sending…' : 'Send Reset Link'}</span>
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
