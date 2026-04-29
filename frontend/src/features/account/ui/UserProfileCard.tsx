import { FaCalendarAlt, FaEnvelope, FaGlobe, FaLock, FaUser } from 'react-icons/fa';
import type { User } from '@/shared/types';
import { formatUserDate, getUserDisplayName, getUserInitials } from '@/features/users/model/userProfile';

interface UserProfileCardProps {
  user: User;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const infoFields = [
    { icon: FaUser, label: 'First Name', value: user.firstName ?? '—' },
    { icon: FaUser, label: 'Last Name', value: user.lastName ?? '—' },
    { icon: FaEnvelope, label: 'Email', value: user.email, wide: true },
    { icon: FaGlobe, label: 'Country', value: user.country ?? '—' },
    { icon: FaCalendarAlt, label: 'Age', value: typeof user.age === 'number' ? `${user.age} years old` : '—' },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04] lg:col-span-2">
      <div className="relative border-b border-white/[0.07] bg-gradient-to-r from-[#0d1628] to-[#0a0e20] px-6 py-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-blue-500/25 bg-blue-600/20">
            <span
              className="text-xl font-bold text-blue-300"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {getUserInitials(user)}
            </span>
          </div>
          <div>
            <h2
              className="text-lg font-bold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {getUserDisplayName(user)}
            </h2>
            <p className="text-sm text-white/45">{user.email}</p>
            {user.createdAt ? (
              <p className="mt-1 text-xs text-white/25">
                Member since {formatUserDate(user.createdAt)}
              </p>
            ) : null}
          </div>
        </div>
        <div className="group absolute right-5 top-5">
          <button
            type="button"
            disabled
            className="flex items-center gap-1.5 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.03] px-3 py-1.5 text-xs text-white/25 cursor-not-allowed"
          >
            <FaLock className="h-3 w-3" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#0d0f1e] px-2.5 py-1.5 text-xs text-white/55 opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
            Coming soon
          </div>
        </div>
      </div>

      <div className="p-5">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/25">
          Personal Information
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {infoFields.map((field) => {
            const Icon = field.icon;

            return (
              <div
                key={field.label}
                className={`flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5 ${field.wide ? 'md:col-span-2' : ''}`}
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-600/10">
                  <Icon className="h-3.5 w-3.5 text-blue-400/70" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-white/30">
                    {field.label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-white/85">{field.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
