/**
 * Forums Trending API
 * GET /api/forums/trending - Most relevant threads across active forums
 * (most commented, then most liked, then newest). Powers the landing widget.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTrendingThreads } from '@/lib/forum';
import logger from '@/lib/logger';
import ErrorHandler from '@/lib/error-handler';

export const dynamic = 'force-dynamic';

/**
 * GET /api/forums/trending
 *
 * Query params:
 *   - limit: number (default 3, max 10)
 *
 * Response 200: { success, data: ForumHubThread[], timestamp }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(10, Math.max(1, parseInt(searchParams.get('limit') || '3', 10)));

    const data = await getTrendingThreads(limit);

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in GET /api/forums/trending', { error });
    return ErrorHandler.handleError(error);
  }
}
