import type { FormEvent } from 'react';
import { FaCheck, FaExclamationTriangle, FaEye, FaEyeSlash, FaLock, FaTimes } from 'react-icons/fa';
import { Button } from '@/shared/ui';
import { passwordChecks, type PasswordStrength } from '@/shared/lib/passwordStrength';

interface PasswordChangeFormProps {
  confirmPassword: string;
  currentPassword: string;
  isLoading: boolean;
  newPassword: string;
  passwordStrength: PasswordStrength;
  passwordsMatch: boolean;
  setConfirmPassword: (value: string) => void;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  showConfirmPassword: boolean;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  onSubmit: () => Promise<unknown>;
  toggleConfirmPassword: () => void;
  toggleCurrentPassword: () => void;
  toggleNewPassword: () => void;
}

const inputClassName =
  'w-full rounded-xl border border-[color:var(--border)] bg-[var(--bg-alt)] px-4 py-3 pr-12 text-sm text-[color:var(--text-primary)] ' +
  'placeholder-[color:var(--text-muted)] transition-all duration-200 focus:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40';

function PasswordVisibilityToggle({ onToggle, show }: { onToggle: () => void; show: boolean }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text-secondary)]"
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      {show ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
    </button>
  );
}

export function PasswordChangeForm({
  confirmPassword,
  currentPassword,
  isLoading,
  newPassword,
  onSubmit,
  passwordStrength,
  passwordsMatch,
  setConfirmPassword,
  setCurrentPassword,
  setNewPassword,
  showConfirmPassword,
  showCurrentPassword,
  showNewPassword,
  toggleConfirmPassword,
  toggleCurrentPassword,
  toggleNewPassword,
}: PasswordChangeFormProps) {
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)] lg:col-span-3">
      <div className="flex items-center gap-3 border-b border-[color:var(--card-border)] px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-600/15">
          <FaLock className="h-4 w-4 text-[color:var(--avatar-text)]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[color:var(--text-primary)]">Change Password</p>
          <p className="text-xs text-[color:var(--text-muted)]">Update your account password</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
            Current Password
          </label>
          <div className="relative">
            <input
              id="current-password"
              name="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={event => setCurrentPassword(event.target.value)}
              required
              className={inputClassName}
              placeholder="Enter your current password"
              autoComplete="current-password"
            />
            <PasswordVisibilityToggle show={showCurrentPassword} onToggle={toggleCurrentPassword} />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
            New Password
          </label>
          <div className="relative">
            <input
              id="new-password"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={event => setNewPassword(event.target.value)}
              required
              className={inputClassName}
              placeholder="Enter your new password"
              autoComplete="new-password"
              aria-describedby="change-password-guidance"
            />
            <PasswordVisibilityToggle show={showNewPassword} onToggle={toggleNewPassword} />
          </div>
          <p id="change-password-guidance" className="mt-2 text-xs text-[color:var(--text-muted)]">
            Use 15 or more characters. Spaces and password-manager generated passwords are
            supported.
          </p>

          {newPassword ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-[color:var(--text-muted)]">
                  Strength
                </span>
                <span className={`text-xs font-semibold ${passwordStrength.textClass}`}>
                  {passwordStrength.strength}
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-[var(--card-border)]">
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
                      className={`flex items-center gap-1.5 text-xs ${isValid ? 'text-[color:var(--avatar-text)]' : 'text-[color:var(--text-muted)]'}`}
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
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirm-new-password"
              name="confirmNewPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
              required
              className={`${inputClassName} ${!passwordsMatch ? 'animate-error-shake border-red-500/30 focus:ring-red-500/30' : ''}`}
              placeholder="Confirm your new password"
              autoComplete="new-password"
            />
            <PasswordVisibilityToggle show={showConfirmPassword} onToggle={toggleConfirmPassword} />
          </div>
          {confirmPassword && !passwordsMatch ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-[color:var(--danger-text)]">
              <FaExclamationTriangle size={10} /> Passwords do not match
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={passwordStrength.strength === 'Weak' || !passwordsMatch}
          loading={isLoading}
          shake={Boolean(confirmPassword) && (!passwordsMatch || passwordStrength.strength === 'Weak')}
          className="w-full"
        >
          <FaLock className="h-4 w-4" />
          <span>{isLoading ? 'Updating…' : 'Update Password'}</span>
        </Button>
      </form>
    </div>
  );
}
