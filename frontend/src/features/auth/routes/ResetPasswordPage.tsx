import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaKey, FaLock, FaShieldAlt } from 'react-icons/fa';
import { routes } from '@/app/routes';
import { resetPassword } from '@/features/auth/api/passwordResetApi';
import { AuthBrandPanel } from '@/features/auth/ui/AuthBrandPanel';
import {
  AuthAlert,
  AuthBackLink,
  AuthChecklist,
  AuthPrimaryLink,
  AuthStatusIcon,
  AuthStatusView,
  AuthSupportCard,
  PasswordVisibilityToggle,
} from '@/features/auth/ui/AuthFlowElements';
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell';
import { authInputClassName } from '@/features/auth/ui/authStyles';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';
import { getPasswordStrength, passwordChecks } from '@/shared/lib/passwordStrength';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { Button } from '@/shared/ui';

const resetPasswordBrandPanel = (
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
  const isWeakPassword = passwordStrength.strength === 'Weak';
  const isSubmitDisabled = isWeakPassword || (confirmPassword.length > 0 && !passwordsMatch);

  useEffect(() => {
    if (!searchParams.get('token')) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('token');
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (isWeakPassword) {
      setError('Use at least 15 characters. A passphrase or password manager works well.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({ token, newPassword });
      setSuccess(true);
    } catch (submitError: unknown) {
      setError(getApiErrorMessage(submitError, 'Failed to reset password. The link may have expired.'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthPageShell
        title="Recovery link unavailable"
        description="This page needs a valid recovery token before you can choose a new password."
        brandPanel={resetPasswordBrandPanel}
      >
        <AuthStatusView
          title="Token missing"
          description="The recovery link you followed is missing information or has already been cleaned up. Request a fresh one to continue."
          icon={(
            <AuthStatusIcon badge="error">
              <FaLock className="h-8 w-8 text-red-400" />
            </AuthStatusIcon>
          )}
          action={(
            <>
              <AuthPrimaryLink to={routes.forgotPassword}>Request a new reset link</AuthPrimaryLink>
              <div className="text-center">
                <AuthBackLink to={routes.signIn}>Back to Sign In</AuthBackLink>
              </div>
            </>
          )}
        />
      </AuthPageShell>
    );
  }

  if (success) {
    return (
      <AuthPageShell
        title="Password updated"
        description="Your new password is ready to use the next time you sign in."
        brandPanel={resetPasswordBrandPanel}
      >
        <AuthStatusView
          title="You can sign in now"
          description="You can now sign in with your new password. Older recovery links no longer work."
          icon={(
            <AuthStatusIcon badge="success">
              <FaShieldAlt className="h-8 w-8 text-emerald-400" />
            </AuthStatusIcon>
          )}
          action={(
            <>
              <AuthSupportCard>
                <p className="text-sm text-[color:var(--text-secondary)]">
                  Your password manager can now save this update the next time you sign in.
                </p>
              </AuthSupportCard>
              <AuthPrimaryLink to={routes.signIn}>
                <>
                  <FaLock className="h-4 w-4" />
                  Continue to Sign In
                </>
              </AuthPrimaryLink>
            </>
          )}
        />
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      title="Create a new password"
      description="Use a long password or passphrase. Password managers work especially well here."
      brandPanel={resetPasswordBrandPanel}
    >
      <>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthSupportCard>
            <p className="text-sm text-[color:var(--text-secondary)]">
              Use 15 or more characters. Spaces are supported, and the browser can suggest a generated
              password if you prefer.
            </p>
          </AuthSupportCard>

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
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Create a strong password"
                autoComplete="new-password"
                spellCheck={false}
                autoFocus
                className={`${authInputClassName} pr-12`}
                aria-describedby="reset-password-guidance"
              />
              <PasswordVisibilityToggle show={showNew} onToggle={() => setShowNew((value) => !value)} />
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
                  <span className="text-[10px] uppercase tracking-widest text-white/30">Strength</span>
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
                <AuthChecklist
                  items={passwordChecks.map((check) => ({
                    label: check.getLabel(),
                    passes: check.isValid(newPassword),
                  }))}
                />
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
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm your new password"
                autoComplete="new-password"
                spellCheck={false}
                className={`${authInputClassName} pr-12 ${
                  confirmPassword && !passwordsMatch
                    ? 'animate-error-shake border-red-500/30 focus:ring-red-500/30'
                    : ''
                }`}
              />
              <PasswordVisibilityToggle
                show={showConfirm}
                onToggle={() => setShowConfirm((value) => !value)}
              />
            </div>
            {confirmPassword && !passwordsMatch ? (
              <p className="mt-2 text-xs text-red-400">Passwords do not match</p>
            ) : confirmPassword ? (
              <p className="mt-2 text-xs text-emerald-400">Passwords match</p>
            ) : null}
          </div>

          {error ? <AuthAlert>{error}</AuthAlert> : null}

          <Button
            type="submit"
            disabled={isSubmitDisabled}
            loading={isLoading}
            shake={Boolean(confirmPassword) && (!passwordsMatch || passwordStrength.strength === 'Weak')}
            className="w-full"
            size="lg"
          >
            <FaLock className="h-4 w-4" />
            <span>{isLoading ? 'Updating…' : 'Save New Password'}</span>
          </Button>
        </form>

        <div className="mt-6 text-center">
          <AuthBackLink to={routes.signIn}>Back to Sign In</AuthBackLink>
        </div>
      </>
    </AuthPageShell>
  );
};

export default ResetPasswordPage;
