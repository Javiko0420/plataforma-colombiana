import path from 'node:path'
import { defineConfig } from 'vitest/config'
import base from './vitest.config'

export default defineConfig({
  ...base,
  // These regressions must never load developer or production .env files.
  envDir: false,
  cacheDir: path.resolve(__dirname, 'node_modules/.cache/vitest-auth'),
  test: {
    ...base.test,
    environment: 'node',
    // Must run first: strips credentials Prisma loads from `.env` on import.
    setupFiles: ['./vitest.auth.setup.ts', ...[base.test?.setupFiles ?? []].flat()],
    include: [
      'src/lib/__tests__/authentication.test.ts',
      'src/lib/__tests__/nextauth-session.test.ts',
      'src/lib/__tests__/password-verification.test.ts',
      'src/lib/__tests__/mobile-token-verification.test.ts',
    ],
  },
})
