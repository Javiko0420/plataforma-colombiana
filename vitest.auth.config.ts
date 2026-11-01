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
    include: [
      'src/lib/__tests__/authentication.test.ts',
      'src/lib/__tests__/nextauth-session.test.ts',
      'src/lib/__tests__/password-verification.test.ts',
      'src/lib/__tests__/mobile-token-verification.test.ts',
    ],
  },
})
