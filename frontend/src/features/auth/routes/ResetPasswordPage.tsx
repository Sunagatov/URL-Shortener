import React from 'react';
import { FaCheck, FaExclamationTriangle, FaLock, FaShieldAlt } from 'react-icons/fa';
import { routes } from '@/app/routes';
import { useResetPasswordFlow } from '@/features/auth/model/useResetPasswordFlow';
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
import { resetPasswordBrandPanel } from '@/features/auth/ui/AuthRoutePanels';
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell';
import { authInputClassName } from '@/features/auth/ui/authStyles';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { passwordChecks } from '@/shared/lib/passwordStrength';
import { Button } from '@/shared/ui';

const ResetPasswordPage: React.FC = () => {
  usePageTitle('Reset Password');
  const {
    confirmPassword,
    error,
    isLoading,
    isSubmitDisabled,
    newPassword,
    passwordStrength,
    passwordsMatch,
    setConfirmPassword,
    setNewPassword,
    showConfirm,
    showNew,
    submit,
    success,
    toggleConfirmVisibility,
    toggleNewVisibility,
    token,
  } = useResetPasswordFlow();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await submit();
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
              <FaExclamationTriangle className="h-8 w-8 text-red-400" />
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
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthSupportCard>
          <p className="text-sm text-[color:var(--text-secondary)]">
            Use 15 or more characters. Spaces are supported, and the browser can suggest a
            generated password if you prefer.
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
            <PasswordVisibilityToggle show={showNew} onToggle={toggleNewVisibility} />
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
                confirmPassword && !passwordsMatch ? 'border-red-500/30 focus:ring-red-500/30' : ''
              } ${confirmPassword && !passwordsMatch ? 'animate-error-shake' : ''}`}
            />
            <PasswordVisibilityToggle show={showConfirm} onToggle={toggleConfirmVisibility} />
          </div>
          {confirmPassword && !passwordsMatch ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
              <FaExclamationTriangle size={10} />
              Passwords do not match
            </p>
          ) : confirmPassword ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
              <FaCheck size={10} />
              Passwords match
            </p>
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
    </AuthPageShell>
  );
};

export default ResetPasswordPage;
