import { createRequire } from 'node:module'
import net from 'node:net'

// Keeps every test file hermetic: no real credentials and no outbound network.
//
// 1. The generated Prisma client loads the project-root `.env` the first time
//    it is required (no opt-out), which would hand real DATABASE_URL and
//    secrets to any test that forgets to mock Prisma or fetch. Trigger that
//    load once here (Node caches the module) and drop what it added, plus any
//    credential-looking variable inherited from the shell.
const inherited = new Set(Object.keys(process.env))
createRequire(import.meta.url)('@prisma/client')
const CREDENTIAL = /^(DATABASE_URL|DIRECT_URL|REDIS_URL|KV_.+)$|(_SECRET|_TOKEN|_API_KEY|_PASSWORD)$/
for (const key of Object.keys(process.env)) {
  if (!inherited.has(key) || CREDENTIAL.test(key)) delete process.env[key]
}
// `new PrismaClient()` reloads `.env` again, but dotenv never overrides a
// variable that is already set: pin the connection strings to a closed
// loopback port so an unmocked query fails fast instead of reaching a real DB.
const BLOCKED_DB = 'postgresql://hermetic-tests:blocked@127.0.0.1:9/blocked'
process.env.DATABASE_URL = BLOCKED_DB
process.env.DIRECT_URL = BLOCKED_DB

// 2. Fail fast on real network access. Tests must stub fetch/clients; a
//    connection to anything but loopback means a missing mock.
const LOOPBACK = /^(localhost|127\.|::1$)/
const connect = net.Socket.prototype.connect
// net.connect()/http hand Socket#connect a normalized `[options, callback]`
// array; direct calls may pass `(options)`, `(port, host)` or `(path)`.
function targetHost(args: unknown[]): string {
  const normalized = Array.isArray(args[0])
  const first: unknown = normalized ? (args[0] as unknown[])[0] : args[0]
  if (first && typeof first === 'object') {
    const opts = first as { host?: unknown; path?: unknown }
    if (typeof opts.path === 'string') return '' // IPC socket, not network
    return typeof opts.host === 'string' ? opts.host : ''
  }
  if (typeof first === 'string') return '' // IPC path
  return !normalized && typeof args[1] === 'string' ? args[1] : ''
}
net.Socket.prototype.connect = function (this: net.Socket, ...args: unknown[]) {
  const host = targetHost(args)
  if (host && !LOOPBACK.test(host)) {
    throw new Error(`Tests must not open network connections (attempted: ${host}). Mock the client or fetch.`)
  }
  return connect.apply(this, args as Parameters<typeof connect>)
} as typeof connect
