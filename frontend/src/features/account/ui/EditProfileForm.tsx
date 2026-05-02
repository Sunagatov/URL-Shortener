import type { ElementType, InputHTMLAttributes } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { FaCalendarAlt, FaEnvelope, FaGlobe, FaLock, FaTimes, FaUser } from 'react-icons/fa';
import {
  formatUserDate,
  getUserDisplayName,
  getUserInitials,
} from '@/features/account/lib/userProfile';
import { useEditProfileForm } from '@/features/account/model/useEditProfileForm';
import type { User } from '@/shared/auth/types';
import { Button } from '@/shared/ui';

interface EditProfileFormProps {
  user: User;
  onCancel: () => void;
  onSuccess: (updated: User) => void;
}

interface ProfileFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  error?: { message?: string };
  icon: ElementType;
  label: string;
  registration: UseFormRegisterReturn;
}

const fieldInputClass =
  'w-full rounded-xl border border-[color:var(--border)] bg-[var(--bg-alt)] py-3 pl-10 pr-4 text-sm text-[color:var(--text-primary)] ' +
  'placeholder-[color:var(--text-muted)] transition-all duration-200 focus:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40';

function ProfileField({ error, icon: Icon, label, registration, ...inputProps }: ProfileFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--text-muted)]" />
        <input
          {...registration}
          {...inputProps}
          className={`${fieldInputClass} ${error ? 'animate-error-shake border-red-500/30 focus:ring-red-500/30' : ''}`}
        />
      </div>
      {error?.message ? <p className="mt-1 text-xs text-[color:var(--danger-text)]">{error.message}</p> : null}
    </div>
  );
}

export function EditProfileForm({ user, onCancel, onSuccess }: EditProfileFormProps) {
  const { errors, handleCancel, handleSubmit, isLoading, onSubmit, register, serverError } =
    useEditProfileForm(user, onSuccess, onCancel);
  const hasValidationErrors = Object.keys(errors).length > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-500/20 bg-[var(--card-bg)] lg:col-span-2">
      <div className="relative border-b border-[color:var(--card-border)] bg-gradient-to-r from-[var(--bg-alt)] to-[var(--bg-alt)] px-6 py-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-[color:var(--avatar-border)] bg-[var(--avatar-bg)] ring-2 ring-blue-500/10 ring-offset-2 ring-offset-[#060612]">
            <span
              className="text-xl font-bold text-[color:var(--avatar-text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {getUserInitials(user)}
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className="text-lg font-bold text-[color:var(--text-primary)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {getUserDisplayName(user)}
              </h2>
              <span className="rounded-full border border-[color:var(--avatar-border)] bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[color:var(--avatar-text)]">
                Editing
              </span>
            </div>
            <p className="text-sm text-[color:var(--text-muted)]">{user.email}</p>
            {user.createdAt ? (
              <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                Member since {formatUserDate(user.createdAt)}
              </p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="absolute right-5 top-5 flex items-center gap-1.5 rounded-xl border border-[color:var(--border)] bg-[var(--card-bg)] px-3 py-1.5 text-xs text-[color:var(--text-muted)] transition-all hover:border-[color:var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[color:var(--text-secondary)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FaTimes className="h-3 w-3" />
          <span className="hidden sm:inline">Cancel</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-5">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
          Edit Personal Information
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ProfileField
              registration={register('firstName')}
              id="edit-first-name"
              type="text"
              label="First Name"
              icon={FaUser}
              placeholder="John"
              autoComplete="given-name"
              error={errors.firstName}
            />
            <ProfileField
              registration={register('lastName')}
              id="edit-last-name"
              type="text"
              label="Last Name"
              icon={FaUser}
              placeholder="Doe"
              autoComplete="family-name"
              error={errors.lastName}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ProfileField
              registration={register('country')}
              id="edit-country"
              type="text"
              label="Country"
              icon={FaGlobe}
              placeholder="United States"
              autoComplete="country-name"
              error={errors.country}
            />
            <ProfileField
              registration={register('age')}
              id="edit-age"
              type="number"
              label="Age"
              icon={FaCalendarAlt}
              placeholder="25"
              min="13"
              max="120"
              error={errors.age}
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
              Email Address
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--text-muted)]" />
              <input
                type="email"
                value={user.email}
                readOnly
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-[color:var(--border)] bg-[var(--card-bg)] py-3 pl-10 pr-10 text-sm text-[color:var(--text-muted)]"
              />
              <FaLock className="absolute right-3.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[color:var(--text-muted)]" />
            </div>
            <p className="mt-1 text-[10px] text-[color:var(--text-muted)]">Email address cannot be changed</p>
          </div>
        </div>

        {serverError ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-[color:var(--danger)] bg-[var(--danger-bg)] p-4 text-sm text-[color:var(--danger-text)]">
            <span className="shrink-0">⚠</span>
            {serverError}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            onClick={handleCancel}
            variant="ghost"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" loading={isLoading} shake={hasValidationErrors} className="w-full sm:w-auto">
            <span>{isLoading ? 'Saving…' : 'Save Changes'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
