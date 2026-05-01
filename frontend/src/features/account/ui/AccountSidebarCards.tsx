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
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/25">
          Account Stats
        </p>
        <div className="flex items-center justify-between border-b border-white/[0.06] py-2">
          <span className="text-xs text-white/40">Member Since</span>
          <span
            className="text-xs font-semibold text-white/70"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {user.createdAt ? formatUserDate(user.createdAt) : '—'}
          </span>
        </div>
        <p className="mt-3 text-xs text-white/20">
          Usage analytics will appear here when available.
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/25">
          Quick Actions
        </p>
        <div className="space-y-1">
          <button
            type="button"
            onClick={onEditProfile}
            className="w-full rounded-xl p-3 text-left text-white/50 transition-all hover:bg-white/[0.06] hover:text-white/80"
          >
            <div className="flex items-center gap-3">
              <FaPencilAlt className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-xs font-medium">Edit Profile</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onNavigate(routes.security)}
            className="w-full rounded-xl p-3 text-left text-white/50 transition-all hover:bg-white/[0.06] hover:text-white/80"
          >
            <div className="flex items-center gap-3">
              <FaShieldAlt className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-xs font-medium">Change Password</span>
            </div>
          </button>
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-dashed border-white/[0.06] p-3 text-left text-white/20"
          >
            <div className="flex items-center gap-3">
              <FaDownload className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-xs font-medium">Export Data</span>
              <span className="ml-auto rounded-full border border-white/[0.08] bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-white/25">
                Soon
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
