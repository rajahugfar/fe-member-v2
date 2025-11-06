/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_LINE_URL: string
  readonly VITE_FACEBOOK_URL: string
  readonly VITE_SUPPORT_PHONE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// NodeJS namespace for setTimeout/setInterval types
declare namespace NodeJS {
  type Timeout = number
}

