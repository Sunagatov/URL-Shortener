import type { ElementType, ReactNode } from 'react';
import { FaLink } from 'react-icons/fa';

type BrandStat = {
  label: string;
  value: string;
};

type BrandFeature = {
  icon?: ElementType;
  text: string;
};

interface AuthBrandPanelProps {
  badge?: ReactNode;
  className: string;
  description: string;
  features: BrandFeature[];
  heading: ReactNode;
  stats?: BrandStat[];
  footer?: ReactNode;
}

export function AuthBrandPanel({
  badge,
  className,
  description,
  features,
  footer,
  heading,
  stats,
}: AuthBrandPanelProps) {
  return (
    <div className={className}>
      <div className="absolute inset-0 bg-grid-dark pointer-events-none" />

      <div className="relative z-10 mb-16 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--avatar-border)] bg-[var(--avatar-bg)]">
          <FaLink className="h-4 w-4 text-[color:var(--avatar-text)]" />
        </div>
        <span
          className="text-lg font-bold text-[color:var(--text-primary)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Shorty URL
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center">
        {badge}
        <h2
          className="mb-5 text-4xl font-bold leading-[1.1] text-[color:var(--text-primary)] xl:text-5xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {heading}
        </h2>
        <p className="mb-10 max-w-sm text-base leading-relaxed text-[color:var(--text-muted)]">
          {description}
        </p>

        <div className="space-y-4">
          {features.map(feature => {
            const Icon = feature.icon;

            return (
              <div key={feature.text} className="flex items-center gap-3">
                {Icon ? (
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-[color:var(--avatar-border)] bg-[var(--avatar-bg)]">
                    <Icon className="h-3 w-3 text-[color:var(--avatar-text)]" />
                  </div>
                ) : (
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-[color:var(--avatar-border)] bg-[var(--avatar-bg)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--avatar-text)]" />
                  </div>
                )}
                <span className="text-sm text-[color:var(--text-secondary)]">{feature.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {stats ? (
        <div className="relative z-10 mt-10 grid grid-cols-3 gap-3">
          {stats.map(stat => (
            <div
              key={stat.label}
              className="rounded-xl border border-[color:var(--card-border)] bg-[var(--card-bg)] p-3 text-center"
            >
              <p
                className="text-lg font-bold text-[color:var(--text-primary)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {stat.value}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-widest text-[color:var(--text-muted)]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {footer ? <div className="relative z-10 mt-10">{footer}</div> : null}
    </div>
  );
}
