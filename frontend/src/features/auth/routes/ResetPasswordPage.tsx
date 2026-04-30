import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCheck,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaLock,
  FaShieldAlt,
  FaTimes,
} from 'react-icons/fa';
import { routes } from '@/app/routes';
import { resetPassword } from '@/features/auth/api/passwordResetApi';
import { AuthBrandPanel } from '@/features/auth/ui/AuthBrandPanel';
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell';
import { authInputClassName } from '@/features/auth/ui/authStyles';
import {
  getPasswordStrength,
  passwordChecks,
} from '@/features/account/model/passwordStrength';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { Button } from '@/shared/ui';

const brandPanel = (
  <AuthBrandPanel
    className="auth-brand-panel relative hidden flex-shrink-0 flex-col overflow-hidden px-12 py-16 lg:flex lg:w-[480px] xl:w-[520px]"
    heading={
      <>
        Choose a strong
        <br />
        <span className="gradient-text-animated">new password.</span>
      </>
    }
    description="Pick something you'll remember but others won't guess. We'll keep it safe."
    features={[
      { icon: FaLock, text: 'Minimum 8 characters' },
      { icon: FaShieldAlt, text: 'Mix letters, numbers & symbols' },
      { icon: FaKey, text: 'Never reuse previous passwords' },
    ]}
    stats={[
      { value: '256-bit', label: 'Encryption' },
      { value: 'Hashed', label: 'Storage' },
      { value: '99.9%', label: 'Uptime' },
    ]}
  />
);

function PasswordVisibilityToggle({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/25 transition-colors hover:text-white/55"
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      {show ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
    </button>
  );
}

const ResetPasswordPage: React.FC = () => {
  usePageTitle('Reset Password');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = getPasswordStrength(newPassword);
  const passwordsMatch = confirmPassword.length === 0 || newPassword === confirmPassword;

  if (!token) {
    return (
      <AuthPageShell
        title="Invalid reset link"
        description="This link is missing a reset token"
        brandPanel={brandPanel}
      >
        <div className="animate-fade-up space-y-5">
          <div className="flex flex-col items-center py-6">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/25 bg-red-500/10">
              <FaExclamationTriangle className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-center text-sm text-white/45">
              The reset link you followed is invalid or incomplete. Please request a new one.
            </p>
          </div>

          <Link to={routes.forgotPassword}>
            <Button className="w-full" size="lg">
              Request a new reset link
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

  if (success) {
    return (
      <AuthPageShell
        title="Password updated!"
        description="Your account password has been changed successfully"
        brandPanel={brandPanel}
      >
        <div className="animate-fade-up space-y-5">
          <div className="flex flex-col items-center py-4">
            <div className="relative mb-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-500/25 bg-emerald-500/12">
                <FaShieldAlt className="h-8 w-8 text-emerald-400" />
              </div>
              <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20">
                <FaCheck className="h-3 w-3 text-emerald-400" />
              </div>
            </div>
            <p className="text-center text-sm text-white/45">
              You can now sign in with your new password. This reset link has been invalidated.
            </p>
          </div>

          <Link to={routes.signIn}>
            <Button className="w-full" size="lg">
              <FaLock className="h-4 w-4" />
              Sign In Now
            </Button>
          </Link>
        </div>
      </AuthPageShell>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (passwordStrength.strength === 'Weak') {
      setError('Please choose a stronger password.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({ token, newPassword });
      setSuccess(true);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to reset password. The link may have expired.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageShell
      title="Set a new password"
      description="Choose a strong password to secure your account"
      brandPanel={brandPanel}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="reset-new"
            className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-white/30"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="reset-new"
              type={showNew ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={event => setNewPassword(event.target.value)}
              placeholder="Create a strong password"
              autoComplete="new-password"
              autoFocus
              className={`${authInputClassName} pr-12`}
            />
            <PasswordVisibilityToggle show={showNew} onToggle={() => setShowNew(v => !v)} />
          </div>

          {newPassword ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-white/30">
                  Strength
                </span>
                <span className={`text-xs font-semibold ${passwordStrength.textClass}`}>
                  {passwordStrength.strength}
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-white/[0.07]">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${passwordStrength.barClass}`}
                  style={{ width: passwordStrength.width }}
                />
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {passwordChecks.map(check => {
                  const isValid = check.isValid(newPassword);
                  return (
                    <div
                      key={check.getLabel()}
                      className={`flex items-center gap-1.5 text-xs ${isValid ? 'text-blue-400' : 'text-white/20'}`}
                    >
                      {isValid ? <FaCheck size={9} /> : <FaTimes size={9} />}
                      <span>{check.getLabel()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="reset-confirm"
            className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-white/30"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="reset-confirm"
              type={showConfirm ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
              placeholder="Confirm your new password"
              autoComplete="new-password"
              className={`${authInputClassName} pr-12 ${
                confirmPassword && !passwordsMatch ? 'border-red-500/30 focus:ring-red-500/30' : ''
              }`}
            />
            <PasswordVisibilityToggle
              show={showConfirm}
              onToggle={() => setShowConfirm(v => !v)}
            />
          </div>
          {confirmPassword && !passwordsMatch ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
              <FaExclamationTriangle size={10} />
              Passwords do not match
            </p>
          ) : confirmPassword && passwordsMatch ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
              <FaCheck size={10} />
              Passwords match
            </p>
          ) : null}
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-900/20 p-4 text-sm text-red-300">
            <span className="shrink-0">⚠</span>
            {error}
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={passwordStrength.strength === 'Weak' || (confirmPassword.length > 0 && !passwordsMatch)}
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          <FaLock className="h-4 w-4" />
          <span>{isLoading ? 'Updating…' : 'Reset Password'}</span>
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
    </AuthPageShell>
  );
};

export default ResetPasswordPage;
