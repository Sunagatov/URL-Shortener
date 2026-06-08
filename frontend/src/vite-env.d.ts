/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_REST_API_URL: string;
  readonly VITE_FRONTEND_LOG_ENDPOINT?: string;
  readonly VITE_GOOGLE_OAUTH_CLIENT_ID?: string;
  readonly VITE_TURNSTILE_AUTH_ENABLED?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_TURNSTILE_URL_CREATE_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
