const isEnabled = (value: string | undefined): boolean => value === 'true';

export const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '';

export const features = {
  authTurnstile:
    turnstileSiteKey.length > 0 && isEnabled(import.meta.env.VITE_TURNSTILE_AUTH_ENABLED),
  urlCreateTurnstile:
    turnstileSiteKey.length > 0 && isEnabled(import.meta.env.VITE_TURNSTILE_URL_CREATE_ENABLED),
} as const;
