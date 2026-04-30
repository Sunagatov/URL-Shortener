import React, { useEffect, useState } from 'react';
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
      { icon: FaLock, text: '15+ characters supported' },
      { icon: FaShieldAlt, text: 'Passphrases and password managers welcome' },
      { icon: FaKey, text: 'Only the latest recovery link stays active' },
    ]}
    stats={[
      { value: '64 char', label: 'Password support' },
      { value: '1 link', label: 'Active recovery link' },
      { value: 'Private', label: 'Recovery flow' },
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [token] = useState(() => searchParams.get('token')?.trim() ?? '');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = getPasswordStrength(newPassword);
  const passwordsMatch = confirmPassword.length === 0 || newPassword === confirmPassword;

  useEffect(() => {
    if (!searchParams.get('token')) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('token');
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  if (!token) {
    return (
      <AuthPageShell
        title="Recovery link unavailable"
        description="This page needs a valid recovery token before you can choose a new password."
        brandPanel={brandPanel}
      >
        <div className="animate-fade-up space-y-5">
          <div className="flex flex-col items-center py-6">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/25 bg-red-500/10">
              <FaExclamationTriangle className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-center text-sm text-white/45">
              The recovery link you followed is missing information or has already been cleaned up.
              Request a fresh one to continue.
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
        title="Password updated"
        description="Your new password is ready to use the next time you sign in."
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
              You can now sign in with your new password. Older recovery links no longer work.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-4 text-sm text-white/55">
            Your password manager can now save this update the next time you sign in.
          </div>

          <Link to={routes.signIn}>
            <Button className="w-full" size="lg">
              <FaLock className="h-4 w-4" />
              Continue to Sign In
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
      setError('Use at least 15 characters. A passphrase or password manager works well.');
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
      title="Create a new password"
      description="Use a long password or passphrase. Password managers work especially well here."
      brandPanel={brandPanel}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-4 text-sm text-white/55">
          Use 15 or more characters. Spaces are supported, and the browser can suggest a generated
          password if you prefer.
        </div>

        <div>
          <label
            htmlFor="new-password"
            className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-white/30"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="new-password"
              name="newPassword"
              type={showNew ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={event => setNewPassword(event.target.value)}
              placeholder="Create a strong password"
              autoComplete="new-password"
              spellCheck={false}
              autoFocus
              className={`${authInputClassName} pr-12`}
              aria-describedby="reset-password-guidance"
            />
            <PasswordVisibilityToggle show={showNew} onToggle={() => setShowNew(v => !v)} />
          </div>
          <div
            id="reset-password-guidance"
            className="mt-2 flex items-center justify-between text-xs text-white/35"
          >
            <span>Long passphrases and password-manager generated passwords are supported.</span>
            <span>{newPassword.length}/64</span>
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
            htmlFor="confirm-new-password"
            className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-white/30"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirm-new-password"
              name="confirmNewPassword"
              type={showConfirm ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
              placeholder="Confirm your new password"
              autoComplete="new-password"
              spellCheck={false}
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
          <span>{isLoading ? 'Updating…' : 'Save New Password'}</span>
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
