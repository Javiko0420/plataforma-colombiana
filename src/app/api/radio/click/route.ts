import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { registerClick } from '@/lib/radio-browser'

export const runtime = 'edge'

const bodySchema = z.object({
  stationUuid: z.string().uuid(),
})

/**
 * Forwards a play event to Radio Browser so the station's clickcount
 * (used for "popular" rankings) reflects real usage. Best-effort: this
 * endpoint always returns success to avoid blocking user playback.
 */
export async function POST(request: NextRequest) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }
  const parsed = bodySchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 })
  }

  void registerClick(parsed.data.stationUuid)
  return NextResponse.json({ success: true })
}
