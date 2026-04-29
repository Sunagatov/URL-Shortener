import { FaDownload, FaLock, FaShieldAlt } from 'react-icons/fa';
import { routes } from '@/app/routes';
import type { User } from '@/shared/types';
import { formatUserDate } from '@/features/users/model/userProfile';

interface AccountSidebarCardsProps {
  onNavigate: (path: string) => void;
  user: User;
}

type QuickAction = {
  disabled?: true;
  icon: typeof FaLock | typeof FaShieldAlt | typeof FaDownload;
  label: string;
  path?: string;
};

const quickActions: QuickAction[] = [
  { icon: FaLock, label: 'Edit Profile', disabled: true },
  { icon: FaShieldAlt, label: 'Change Password', path: routes.security },
  { icon: FaDownload, label: 'Export Data', disabled: true },
];

export function AccountSidebarCards({ onNavigate, user }: AccountSidebarCardsProps) {
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
          {quickActions.map(action => {
            const Icon = action.icon;

            return (
              <button
                key={action.label}
                type="button"
                disabled={action.disabled}
                onClick={action.path ? () => onNavigate(action.path as string) : undefined}
                className={`w-full rounded-xl p-3 text-left transition-all ${
                  action.disabled
                    ? 'cursor-not-allowed border border-dashed border-white/[0.06] text-white/20'
                    : 'text-white/50 hover:bg-white/[0.06] hover:text-white/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="text-xs font-medium">{action.label}</span>
                  {action.disabled ? (
                    <span className="ml-auto rounded-full border border-white/[0.08] bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-white/25">
                      Soon
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
