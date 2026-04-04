/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BETTER_SQLITE3_BINDING: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
