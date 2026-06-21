import { NextResponse } from 'next/server'
import { WORLDCUP_DEFAULT_SUNSET_AT } from '@/lib/sports/worldcup/constants'
import { WorldCupConfigResponseSchema } from '@/lib/sports/worldcup/schemas'
import { wcLogger } from '@/lib/sports/worldcup/logger'

// Output depends on the current instant (sunset check), so never statically cache.
export const dynamic = 'force-dynamic'

/**
 * Resolves the configured sunset instant for the temporary World Cup campaign.
 * Falls back to the default if WORLDCUP_SUNSET_AT is unset or unparseable.
 */
function resolveSunset(): Date {
  const raw = process.env.WORLDCUP_SUNSET_AT
  if (!raw) return new Date(WORLDCUP_DEFAULT_SUNSET_AT)

  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) {
    wcLogger.warn('invalid WORLDCUP_SUNSET_AT, using default', { raw })
    return new Date(WORLDCUP_DEFAULT_SUNSET_AT)
  }
  return parsed
}

/** Manual kill switch — enabled unless WORLDCUP_ENABLED is explicitly "false". */
function manualFlagEnabled(): boolean {
  return process.env.WORLDCUP_ENABLED?.toLowerCase().trim() !== 'false'
}

/**
 * GET /api/sports/worldcup/config
 *
 * Feature flag for the temporary World Cup campaign in the mobile app.
 * `enabled` is computed server-side (manual flag AND not past the sunset), so the
 * client can trust it directly without relying on the device clock. Public,
 * read-only, no sensitive data — consistent with the rest of the worldcup module.
 */
export async function GET() {
  const sunset = resolveSunset()
  const now = new Date()

  const enabled = manualFlagEnabled() && now.getTime() < sunset.getTime()

  const payload = {
    enabled,
    sunsetAt: sunset.toISOString(),
    cachedAt: now.toISOString(),
  }

  const parsed = WorldCupConfigResponseSchema.safeParse(payload)
  if (!parsed.success) {
    wcLogger.error('config payload failed self-validation', { issues: parsed.error.issues })
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to build config payload' } },
      { status: 500 }
    )
  }

  wcLogger.info('served worldcup config', { enabled, sunsetAt: payload.sunsetAt })

  // no-store so CDNs/proxies don't serve a stale enabled:true past the sunset.
  return NextResponse.json(parsed.data, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
