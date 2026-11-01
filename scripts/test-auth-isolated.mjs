import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const result = spawnSync(process.execPath, [
  fileURLToPath(new URL('../node_modules/vitest/vitest.mjs', import.meta.url)),
  'run', '--config', 'vitest.auth.config.ts',
], {
  cwd: root,
  // Pass only process essentials; do not inherit application credentials.
  env: { PATH: process.env.PATH ?? '', TMPDIR: tmpdir(), NODE_ENV: 'test' },
  stdio: 'inherit',
})
if (result.error) {
  console.error('Could not start isolated authentication tests:', result.error.message)
}
process.exitCode = result.status ?? 1
