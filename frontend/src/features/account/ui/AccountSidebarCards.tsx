import { FaDownload, FaPencilAlt, FaShieldAlt } from 'react-icons/fa';
import { routes } from '@/app/routes';
import { formatUserDate } from '@/features/account/lib/userProfile';
import type { User } from '@/shared/auth/types';

interface AccountSidebarCardsProps {
  onEditProfile: () => void;
  onNavigate: (path: string) => void;
  user: User;
}

export function AccountSidebarCards({ onEditProfile, onNavigate, user }: AccountSidebarCardsProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)] p-5">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
          Account Stats
        </p>
        <div className="flex items-center justify-between border-b border-[color:var(--border)] py-2">
          <span className="text-xs text-[color:var(--text-muted)]">Member Since</span>
          <span
            className="text-xs font-semibold text-[color:var(--text-secondary)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {user.createdAt ? formatUserDate(user.createdAt) : '—'}
          </span>
        </div>
        <p className="mt-3 text-xs text-[color:var(--text-muted)]">
          Usage analytics will appear here when available.
        </p>
      </div>

      <div className="rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)] p-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
          Quick Actions
        </p>
        <div className="space-y-1">
          <button
            type="button"
            onClick={onEditProfile}
            className="w-full rounded-xl p-3 text-left text-[color:var(--text-secondary)] transition-all hover:bg-[var(--surface-hover)] hover:text-[color:var(--text-secondary)]"
          >
            <div className="flex items-center gap-3">
              <FaPencilAlt className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-xs font-medium">Edit Profile</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onNavigate(routes.security)}
            className="w-full rounded-xl p-3 text-left text-[color:var(--text-secondary)] transition-all hover:bg-[var(--surface-hover)] hover:text-[color:var(--text-secondary)]"
          >
            <div className="flex items-center gap-3">
              <FaShieldAlt className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-xs font-medium">Change Password</span>
            </div>
          </button>
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-dashed border-[color:var(--border)] p-3 text-left text-[color:var(--text-muted)]"
          >
            <div className="flex items-center gap-3">
              <FaDownload className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-xs font-medium">Export Data</span>
              <span className="ml-auto rounded-full border border-[color:var(--border)] bg-[var(--card-bg)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--text-muted)]">
                Soon
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
