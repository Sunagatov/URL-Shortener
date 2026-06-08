import { landingFeatures } from './landingContent';

export function LandingFeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--bg-alt)] py-16 bg-grid-dark md:py-28">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent pointer-events-none" />

      <div className="mx-auto max-w-6xl px-6">
        <div className="relative z-10 mb-16 text-center">
          <span className="mb-4 inline-block rounded-full border border-blue-400/15 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-[color:var(--avatar-text)]">
            Why Shorty URL
          </span>
          <h2
            className="mb-4 text-4xl font-bold leading-tight text-[color:var(--text-primary)] md:text-5xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Everything you need,
            <br className="hidden md:block" /> nothing you don't
          </h2>
          <p className="mx-auto max-w-xl text-lg text-[color:var(--text-muted)]">
            Powerful tools designed to make link management simple, fast, and insightful.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {landingFeatures.map(feature => {
            const Icon = feature.icon;

            return (
              <div key={feature.title} className="gradient-border-card p-6">
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg ${feature.glow}`}
                >
                  <Icon className="h-5 w-5 text-[color:var(--text-on-accent)]" />
                </div>
                <h3 className="mb-2 text-base font-bold text-[color:var(--text-primary)]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[color:var(--text-muted)]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
