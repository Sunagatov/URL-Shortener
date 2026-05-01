import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaEnvelope, FaInbox } from 'react-icons/fa';
import { routes } from '@/app/routes';
import { maskEmailAddress } from '@/features/auth/lib/maskEmailAddress';
import { useForgotPasswordFlow } from '@/features/auth/model/useForgotPasswordFlow';
import {
  AuthAlert,
  AuthBackLink,
  AuthStatusIcon,
  AuthStatusView,
  AuthSupportCard,
} from '@/features/auth/ui/AuthFlowElements';
import { forgotPasswordBrandPanel } from '@/features/auth/ui/AuthRoutePanels';
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell';
import { authInputClassName } from '@/features/auth/ui/authStyles';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { Button } from '@/shared/ui';

const recoveryHints = [
  'Look in your inbox, spam, and promotions folders',
  'The newest recovery link automatically replaces older ones',
  'Keep this tab open while you check your email',
];

const ForgotPasswordPage: React.FC = () => {
  usePageTitle('Forgot Password');
  const {
    cooldownSeconds,
    email,
    error,
    inlineNotice,
    isLoading,
    isResending,
    resend,
    reset,
    setEmail,
    submit,
    submitted,
    submittedEmail,
  } = useForgotPasswordFlow();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await submit();
  };

  if (submitted) {
    return (
      <AuthPageShell
        title="Check your email"
        description={`If an account exists for ${maskEmailAddress(submittedEmail)}, recovery instructions are on the way.`}
        brandPanel={forgotPasswordBrandPanel}
      >
        <AuthStatusView
          title="Recovery requested"
          description={(
            <>
              <p className="text-sm text-white/40">Recovery requested for</p>
              <p className="mt-1 break-all text-sm font-semibold text-white">{submittedEmail}</p>
            </>
          )}
          icon={(
            <AuthStatusIcon badge="success">
              <FaInbox className="h-8 w-8 text-emerald-400" />
            </AuthStatusIcon>
          )}
          action={(
            <>
              <AuthSupportCard>
                <div className="space-y-3">
                  {recoveryHints.map((hint) => (
                    <div key={hint} className="flex items-start gap-2.5 text-sm text-white/45">
                      <FaCheck className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500/70" />
                      <span>{hint}</span>
                    </div>
                  ))}
                </div>
              </AuthSupportCard>

              {inlineNotice ? (
                <AuthSupportCard>
                  <p className="text-sm text-[color:var(--text-secondary)]">{inlineNotice}</p>
                </AuthSupportCard>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={() => void resend(submittedEmail)}
                  loading={isResending}
                  disabled={cooldownSeconds > 0}
                >
                  <FaEnvelope className="h-4 w-4" />
                  <span>{cooldownSeconds > 0 ? `Resend in ${cooldownSeconds}s` : 'Resend email'}</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="w-full"
                  onClick={() => reset(submittedEmail)}
                >
                  Try a different email
                </Button>
              </div>

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
      title="Recover your account"
      description="Enter your email and, if an account exists, we'll send recovery instructions."
      brandPanel={forgotPasswordBrandPanel}
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
              onChange={(event) => setEmail(event.target.value)}
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

        {error ? <AuthAlert>{error}</AuthAlert> : null}

        <Button type="submit" loading={isLoading} className="w-full" size="lg">
          <FaEnvelope className="h-4 w-4" />
          <span>{isLoading ? 'Sending…' : 'Email Recovery Link'}</span>
        </Button>
      </form>

      <div className="mt-6 text-center">
        <AuthBackLink to={routes.signIn}>Back to Sign In</AuthBackLink>
      </div>

      <p className="mt-6 text-center text-sm text-white/30">
        Don't have an account?{' '}
        <Link
          to={routes.signUp}
          className="font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
        >
          Sign up for free
        </Link>
      </p>
    </AuthPageShell>
  );
};

export default ForgotPasswordPage;
