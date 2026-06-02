/**
 * Archived Forums API
 * GET /api/forums/archived - List archived forums within a retention window
 *
 * Query params:
 *   days (optional, default 7, max 30) — how many days back to include
 */

import { NextRequest, NextResponse } from 'next/server';
import { getArchivedForums } from '@/lib/forum';
import logger from '@/lib/logger';
import ErrorHandler from '@/lib/error-handler';

export const dynamic = 'force-dynamic';

/**
 * GET /api/forums/archived
 * Returns archived forums whose endDate falls within the last `days` days
 */
export async function GET(request: NextRequest) {
  try {
    const rawDays = request.nextUrl.searchParams.get('days');
    const parsed = parseInt(rawDays ?? '', 10);
    const days = Math.min(Math.max(Number.isFinite(parsed) ? parsed : 7, 1), 30);

    const forums = await getArchivedForums(days);

    return NextResponse.json({
      success: true,
      data: forums,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in GET /api/forums/archived', { error });
    return ErrorHandler.handleError(error);
  }
}
