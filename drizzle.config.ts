import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './electron/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './fragmemo.db',
  },
})
