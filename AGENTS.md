# Latin Territory — Repository Instructions

These instructions complement the 14-section JAVIWARRIOR STUDIO global
`AGENTS.md`. Keep its engineering, security, Git, approval and communication
rules. Use this file for repository-specific facts; communicate in Spanish.

## 1. Source of truth and scope

- Inspect relevant code, `package.json`, `package-lock.json` and configuration
  before editing. Historical Markdown may describe obsolete APIs or scripts.
- Check Git status and preserve unrelated edits, including untracked files.
- Keep the integrated Next.js modular monolith. Do not introduce a separate
  backend, replace authentication, or assume Supabase/RLS is used here.
- Recheck installed types before using library APIs. This repository uses
  NextAuth v4; do not copy v5 callback behavior without verification.

## 2. Stack and package management

- Use npm and preserve `package-lock.json`; no alternate package managers.
- Preserve Next.js App Router, React, strict TypeScript, Tailwind and Prisma.
- Node must satisfy `package.json` (`>=20.9.0`). Do not invent a pinned version.
- Reuse existing dependencies. Do not perform unrelated upgrades.

## 3. Code locations

- Pages: `src/app/(main)`; Route Handlers: `src/app/api`.
- Server Actions: existing domain folders and `src/app/actions`.
- Shared services, schemas and policies: `src/lib`; use `@/*` imports.
- Prisma schema and migrations: `prisma`; use `src/lib/prisma.ts` singleton.
- Reuse domain components, `components/lh` and `--lh-*` design tokens.

## 4. Frontend and compatibility

- Prefer Server Components; add `use client` only when necessary.
- Preserve mobile layouts, accessibility, theme support and loading/error states.
- Keep Spanish/English dictionaries consistent when changing user-facing text.
- Preserve contracts consumed by web and Flutter. The Flutter client is a
  separate repository and must not be described as tested from backend checks.

## 5. Authentication and account policy

- Distinguish cookie-based NextAuth sessions, NextAuth-format mobile Bearer
  tokens (`/mobile/sign-in`, `/mobile/session`), and the separate mobile JWT
  plus opaque refresh protocol (`/mobile/login`, `/google`, `/apple`, `/refresh`).
- Do not interchange these token formats or extend their accepted audiences.
- All password logins must use `authenticateCredentials` in
  `src/lib/credential-auth.ts`. A missing/empty hash never authenticates.
- Never add default passwords, fallback credentials or automatic passwords for
  OAuth accounts. Continue using bcrypt for local passwords.
- Enforce existing, active, non-banned accounts at issuance and protected
  server boundaries using `account-policy.ts`; do not trust stale token roles.
- `lockedUntil` is a password-attempt lock shared by all password flows; it
  does not suspend OAuth, refresh or already authenticated sessions.
- Use verified provider subjects for OAuth. Only signed, verified email claims
  may establish an email-based link; client-supplied email is not identity proof.
- Check account status before linking providers. Keep account creation/linking
  atomic and do not persist identity tokens as access tokens.

## 6. Authorization and revocation

- Enforce ownership and role rules in APIs and Server Actions, including callers
  that use `getServerSession` directly. Middleware is only an early filter.
- Administrative operations must use `getAuthorizedAdminSession`; preserve
  per-action ADMIN/MODERATOR restrictions and corporate-domain requirements.
- Read current account state/roles without a cross-request authorization cache.
  DB errors must not authorize using cached claims.
- Ban changes revoke refresh tokens transactionally with the status and audit
  record. Do not silently reactivate revoked refresh tokens on unban.
- State checks do not permanently revoke stateless JWTs: an unexpired token
  may become usable again after unban. Durable session-version revocation is
  separate work requiring an approved schema/migration design.

## 7. Backend, persistence and cache

- Share validation, account checks and domain rules between APIs and Actions.
- Preserve per-resource ownership, publication terms, retention and soft deletes.
- Keep Prisma transactions for related state changes and audit records.
- Reuse the existing rate limiter. Its Redis outage behavior is fail-open;
  document that limitation rather than claiming guaranteed rate enforcement.
- Review TTL/invalidation when changing cached data. In-memory Maps are not
  distributed state; JSON cache dates must remain serializable.

## 8. Integrations and sensitive data

- Do not open `.env*`, credential stores, private keys, keystores or production
  data for ordinary development/review. Ask only if the task actually requires it.
- Never log passwords, hashes, OAuth identity tokens, refresh tokens or secrets.
- Keep server credentials server-side; treat `NEXT_PUBLIC_*` as public.
- Preserve SSRF defenses, timeouts, validation and failure handling in integrations.

## 9. Local checks and commands with effects

- Existing scripts: `npm run lint`, `npm test -- --run`, `npm run build`.
- Use `npm run test:auth` for the isolated authentication regressions. Its runner
  removes inherited application credentials and its config disables env files.
- Type check with the installed compiler: `./node_modules/.bin/tsc --noEmit
  --incremental false`. There is no `type-check` script to assume.
- Authentication regressions use Vitest Node environment and synthetic data.
  Mock Prisma, Redis, provider verification and signing configuration; never
  load real credentials or contact live services for these tests.
- Run focused regressions, then the existing suite, lint and type checking.
  Report failures and baseline failures separately; do not suppress them.
- Build runs `prisma generate` and Next.js may load local env files or query
  data during prerendering. Run it only in an appropriately isolated environment.
- Vitest/build/typecheck can write caches/generated files. Static audits must
  not execute them when no writes have been authorized.
- `db:migrate`, `db:reset`, `forums:init`, purges and normalization with `--apply`
  can modify data. Do not run them, production commands, deploys, commits or
  pushes without the authorization required by the user and global rules.

## 10. Delivery

- Report changed files, actual checks/results, security behavior and limitations.
- Keep fixes scoped, dependencies minimal and existing architecture intact.
- Never describe mocked regressions as live DB, browser, Flutter or production
  validation. Do not claim a patch was applied to an inaccessible repository.
