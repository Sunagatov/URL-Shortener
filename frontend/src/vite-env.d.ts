/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_REST_API_URL: string;
  readonly VITE_FRONTEND_LOG_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
