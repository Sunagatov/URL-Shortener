import React, { useEffect, useRef, useState } from 'react';
import { landingStats } from './landingContent';

function parseStatNumber(raw: string): { target: number; suffix: string; decimals: number } {
  if (raw === '24/7') return { target: 24, suffix: '/7', decimals: 0 };
  const match = raw.match(/^(\d+\.?\d*)(.*)/);
  if (!match) return { target: 0, suffix: raw, decimals: 0 };
  const decimals = match[1].includes('.') ? match[1].split('.')[1].length : 0;
  return { target: parseFloat(match[1]), suffix: match[2], decimals };
}

function useCountUp(target: number, decimals: number, active: boolean, duration = 1800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, decimals, duration]);

  return value;
}

type Stat = (typeof landingStats)[number];

function StatItem({ stat, active }: { stat: Stat; active: boolean }) {
  const { target, suffix, decimals } = parseStatNumber(stat.number);
  const count = useCountUp(target, decimals, active);
  const display = decimals > 0 ? count.toFixed(decimals) : Math.round(count);

  return (
    <div className="flex min-w-[44vw] flex-shrink-0 snap-center flex-col items-center px-4 text-center sm:min-w-0 sm:flex-1 sm:px-0">
      <div className="mb-1.5 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${stat.dotColor} animate-pulse`} />
        <span
          className={`bg-gradient-to-br ${stat.gradient} bg-clip-text text-4xl font-bold text-transparent md:text-5xl`}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {display}{suffix}
        </span>
      </div>
      <div className="text-sm tracking-wide text-white/50">{stat.label}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-widest text-white/20">{stat.sublabel}</div>
    </div>
  );
}

export function LandingStatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[#060612] py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <div
          className="flex flex-row gap-0 overflow-x-auto snap-x snap-mandatory sm:overflow-visible sm:snap-none sm:items-center sm:justify-between
            [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
        >
          {landingStats.map((stat, index) => (
            <React.Fragment key={stat.label}>
              <StatItem stat={stat} active={active} />
              {index < landingStats.length - 1 && (
                <div className="hidden h-12 w-px flex-shrink-0 bg-white/[0.08] sm:block" />
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="mt-5 text-center text-[11px] tracking-widest text-white/15 sm:hidden">
          swipe to explore
        </p>
      </div>
    </section>
  );
}
