import { FaCalendarAlt, FaEnvelope, FaGlobe, FaPencilAlt, FaUser } from 'react-icons/fa';
import type { User } from '@/shared/auth/types';
import {
  formatUserDate,
  getUserDisplayName,
  getUserInitials,
} from '@/features/account/lib/userProfile';

interface UserProfileCardProps {
  user: User;
  onEdit: () => void;
}

export function UserProfileCard({ user, onEdit }: UserProfileCardProps) {
  const infoFields = [
    { icon: FaUser, label: 'First Name', value: user.firstName ?? '—' },
    { icon: FaUser, label: 'Last Name', value: user.lastName ?? '—' },
    { icon: FaEnvelope, label: 'Email', value: user.email, wide: true },
    { icon: FaGlobe, label: 'Country', value: user.country ?? '—' },
    {
      icon: FaCalendarAlt,
      label: 'Age',
      value: typeof user.age === 'number' ? `${user.age} years old` : '—',
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)] lg:col-span-2">
      <div className="relative border-b border-[color:var(--card-border)] bg-gradient-to-r from-[var(--bg-alt)] to-[var(--bg-alt)] px-6 py-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-[color:var(--avatar-border)] bg-[var(--avatar-bg)]">
            <span
              className="text-xl font-bold text-[color:var(--avatar-text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {getUserInitials(user)}
            </span>
          </div>
          <div>
            <h2
              className="text-lg font-bold text-[color:var(--text-primary)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {getUserDisplayName(user)}
            </h2>
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
          onClick={onEdit}
          className="absolute right-5 top-5 flex items-center gap-1.5 rounded-xl border border-[color:var(--border)] bg-[var(--card-bg)] px-3 py-1.5 text-xs text-[color:var(--text-secondary)] transition-all hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-[color:var(--avatar-text)]"
        >
          <FaPencilAlt className="h-3 w-3" />
          <span className="hidden sm:inline">Edit</span>
        </button>
      </div>

      <div className="p-5">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
          Personal Information
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {infoFields.map(field => {
            const Icon = field.icon;

            return (
              <div
                key={field.label}
                className={`flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[var(--card-bg)] p-3.5 ${field.wide ? 'md:col-span-2' : ''}`}
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-600/10">
                  <Icon className="h-3.5 w-3.5 text-[color:var(--avatar-text)]" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-[color:var(--text-muted)]">
                    {field.label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[color:var(--text-secondary)]">
                    {field.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
