import type { FormEvent } from 'react';
import { FaCheck, FaExclamationTriangle, FaLock } from 'react-icons/fa';
import { routes } from '@/app/routes';
import {
  AuthAlert,
  AuthBackLink,
  AuthChecklist,
  AuthSupportCard,
  PasswordVisibilityToggle,
} from '@/features/auth/ui/AuthFlowElements';
import { authInputClassName } from '@/features/auth/ui/authStyles';
import { passwordChecks } from '@/shared/lib/passwordStrength';
import { Button } from '@/shared/ui';

type ResetPasswordStrength = {
  barClass: string;
  strength: string;
  textClass: string;
  width: string;
};

type ResetPasswordFormProps = {
  confirmPassword: string;
  error: string;
  isLoading: boolean;
  isSubmitDisabled: boolean;
  newPassword: string;
  passwordStrength: ResetPasswordStrength;
  passwordsMatch: boolean;
  showConfirm: boolean;
  showNew: boolean;
  onConfirmPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onToggleConfirmVisibility: () => void;
  onToggleNewVisibility: () => void;
};

export function ResetPasswordForm({
  confirmPassword,
  error,
  isLoading,
  isSubmitDisabled,
  newPassword,
  passwordStrength,
  passwordsMatch,
  showConfirm,
  showNew,
  onConfirmPasswordChange,
  onNewPasswordChange,
  onSubmit,
  onToggleConfirmVisibility,
  onToggleNewVisibility,
}: ResetPasswordFormProps) {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-5">
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
              onChange={(event) => onNewPasswordChange(event.target.value)}
              placeholder="Create a strong password"
              autoComplete="new-password"
              spellCheck={false}
              autoFocus
              className={`${authInputClassName} pr-12`}
              aria-describedby="reset-password-guidance"
            />
            <PasswordVisibilityToggle show={showNew} onToggle={onToggleNewVisibility} />
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
              onChange={(event) => onConfirmPasswordChange(event.target.value)}
              placeholder="Confirm your new password"
              autoComplete="new-password"
              spellCheck={false}
              className={`${authInputClassName} pr-12 ${
                confirmPassword && !passwordsMatch
                  ? 'animate-error-shake border-red-500/30 focus:ring-red-500/30'
                  : ''
              }`}
            />
            <PasswordVisibilityToggle show={showConfirm} onToggle={onToggleConfirmVisibility} />
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
    </>
  );
}
