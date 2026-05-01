import { FaCheck, FaTimes } from 'react-icons/fa';
import { getPasswordStrength, passwordChecks } from '@/shared/lib/passwordStrength';

type SignUpPasswordStrengthPanelProps = {
  password: string;
};

export function SignUpPasswordStrengthPanel({
  password,
}: SignUpPasswordStrengthPanelProps) {
  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.18em] text-white/30">
          Password strength
        </span>
        <span className={`text-xs font-semibold ${passwordStrength.textClass}`}>
          {password ? passwordStrength.strength : 'Start typing'}
        </span>
      </div>
      <div className="mt-2 h-1 w-full rounded-full bg-white/[0.07]">
        <div
          className={`h-1 rounded-full transition-all duration-300 ${
            password ? passwordStrength.barClass : 'bg-white/10'
          }`}
          style={{ width: password ? passwordStrength.width : '18%' }}
        />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {passwordChecks.map((check) => {
          const passes = check.isValid(password);

          return (
            <div
              key={check.getLabel()}
              className={`flex items-center gap-1.5 text-xs ${
                passes ? 'text-emerald-400' : 'text-white/25'
              }`}
            >
              {passes ? (
                <FaCheck className="h-2.5 w-2.5" />
              ) : (
                <FaTimes className="h-2.5 w-2.5" />
              )}
              <span>{check.getLabel()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
