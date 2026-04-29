/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_REST_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
