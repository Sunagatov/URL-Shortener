import React from 'react';
import { landingStats } from './landingContent';

export function LandingStatsSection() {
  return (
    <section className="relative overflow-hidden bg-[#060612] py-20">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:gap-0">
          {landingStats.map((stat, index) => (
            <React.Fragment key={stat.label}>
              <div className="text-center">
                <div
                  className={`mb-1.5 bg-gradient-to-br ${stat.gradient} bg-clip-text text-4xl font-bold text-transparent md:text-5xl`}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {stat.number}
                </div>
                <div className="text-sm tracking-wide text-white/30">{stat.label}</div>
              </div>
              {index < landingStats.length - 1 ? (
                <div className="hidden h-12 w-px bg-white/[0.08] sm:block" />
              ) : null}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
