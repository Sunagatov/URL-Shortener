/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_BACKEND_REST_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
