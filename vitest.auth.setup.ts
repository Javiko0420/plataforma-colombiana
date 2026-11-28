import { createRequire } from 'node:module'

// The generated Prisma client loads the project-root `.env` the first time it
// is required, with no opt-out. `envDir: false` does not cover it, so real
// application credentials would leak into these isolated regressions.
// Trigger that load once here (Node caches the module for later imports) and
// remove every variable it added.
const inherited = new Set(Object.keys(process.env))
createRequire(import.meta.url)('@prisma/client')
for (const key of Object.keys(process.env)) {
  if (!inherited.has(key)) delete process.env[key]
}

const leaked = ['DATABASE_URL', 'NEXTAUTH_SECRET'].filter(key => key in process.env)
if (leaked.length > 0) {
  throw new Error(`Isolated auth tests must not see application credentials: ${leaked.join(', ')}`)
}
