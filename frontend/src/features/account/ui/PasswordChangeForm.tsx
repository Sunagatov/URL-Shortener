import type { FormEvent } from 'react';
import { FaCheck, FaExclamationTriangle, FaEye, FaEyeSlash, FaLock, FaTimes } from 'react-icons/fa';
import { Button } from '@/shared/ui';
import { passwordChecks, type PasswordStrength } from '@/features/account/model/passwordStrength';

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
  'w-full rounded-xl border border-white/[0.08] bg-[#0d0f1c] px-4 py-3 pr-12 text-sm text-white ' +
  'placeholder-white/25 transition-all duration-200 focus:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40';

function PasswordVisibilityToggle({ onToggle, show }: { onToggle: () => void; show: boolean }) {
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
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04] lg:col-span-3">
      <div className="flex items-center gap-3 border-b border-white/[0.07] px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-600/15">
          <FaLock className="h-4 w-4 text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Change Password</p>
          <p className="text-xs text-white/35">Update your account password</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={event => setCurrentPassword(event.target.value)}
              required
              className={inputClassName}
              placeholder="Enter your current password"
            />
            <PasswordVisibilityToggle show={showCurrentPassword} onToggle={toggleCurrentPassword} />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-white/30">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={event => setNewPassword(event.target.value)}
              required
              className={inputClassName}
              placeholder="Enter your new password"
            />
            <PasswordVisibilityToggle show={showNewPassword} onToggle={toggleNewPassword} />
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
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
              required
              className={`${inputClassName} ${!passwordsMatch ? 'border-red-500/30 focus:ring-red-500/30' : ''}`}
              placeholder="Confirm your new password"
            />
            <PasswordVisibilityToggle show={showConfirmPassword} onToggle={toggleConfirmPassword} />
          </div>
          {confirmPassword && !passwordsMatch ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
              <FaExclamationTriangle size={10} /> Passwords do not match
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={passwordStrength.strength === 'Weak' || !passwordsMatch}
          loading={isLoading}
          className="w-full"
        >
          <FaLock className="h-4 w-4" />
          <span>{isLoading ? 'Updating…' : 'Update Password'}</span>
        </Button>
      </form>
    </div>
  );
}
