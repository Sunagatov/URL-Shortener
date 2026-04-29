import { FaClock, FaKey, FaLock, FaShieldAlt } from 'react-icons/fa';

const securityFeatures = [
  { icon: FaLock, label: 'Password Protection', description: 'Account is protected' },
  { icon: FaShieldAlt, label: 'Account Security', description: 'Regular monitoring' },
  { icon: FaKey, label: 'Data Encryption', description: 'All data is encrypted' },
] as const;

export function SecurityStatusCard() {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-600/15">
          <FaShieldAlt className="h-4 w-4 text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Security Status</p>
          <p className="text-xs text-white/30">Summary not available yet</p>
        </div>
      </div>

      <div className="space-y-2">
        {securityFeatures.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.label}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3"
            >
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-blue-500/15 bg-blue-600/10">
                <Icon className="h-3 w-3 text-blue-400/70" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white/75">{feature.label}</p>
                <p className="truncate text-[10px] text-white/30">{feature.description}</p>
              </div>
              <span className="flex-shrink-0 rounded-full border border-emerald-500/20 bg-emerald-900/30 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                Active
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5">
        <FaClock className="h-3.5 w-3.5 flex-shrink-0 text-white/25" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Last Password Change
          </p>
          <p className="mt-0.5 text-xs text-white/25">
            Password change history is not available yet.
          </p>
        </div>
      </div>
    </div>
  );
}
