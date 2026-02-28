/**
 * Mobile session: validate Bearer token and return current user + expiry.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMobileToken } from '@/lib/mobile-auth'

export async function GET(req: NextRequest) {
  try {
    const token = await getMobileToken(req)
    if (!token?.sub || !token.email) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const exp = (token as { exp?: number }).exp
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: token.sub,
          email: token.email,
          name: token.name ?? null,
          role: token.role,
          hasCompletedProfile: token.hasCompletedProfile ?? false,
        },
        ...(typeof exp === 'number' && { expiresAt: exp }),
      },
    })
  } catch (error) {
    console.error('Mobile session error:', error)
    return NextResponse.json(
      { success: false, error: 'No autorizado' },
      { status: 401 }
    )
  }
}
