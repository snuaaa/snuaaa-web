/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_SERVER_URL: string;
  readonly REACT_APP_SENTRY_DSN?: string;
  readonly REACT_APP_SENTRY_ENVIRONMENT?: string;
}
