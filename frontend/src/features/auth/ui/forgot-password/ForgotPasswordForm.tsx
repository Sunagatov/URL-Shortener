import { Link } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import { routes } from '@/app/routes';
import { AuthAlert, AuthBackLink } from '@/features/auth/ui/AuthFlowElements';
import { authInputClassName } from '@/features/auth/ui/authStyles';
import { Button } from '@/shared/ui';

type ForgotPasswordFormProps = {
  email: string;
  error: string;
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
};

export function ForgotPasswordForm({
  email,
  error,
  isLoading,
  onEmailChange,
  onSubmit,
}: ForgotPasswordFormProps) {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-5">
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
              onChange={(event) => onEmailChange(event.target.value)}
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
    </>
  );
}
