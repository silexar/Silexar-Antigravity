/**
 * Silexar Pulse - Drizzle Kit Configuration
 * Used for schema migrations: npm run db:generate / db:migrate / db:push
 */

import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
  verbose: true,
  strict: false,
})
