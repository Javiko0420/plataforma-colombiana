/**
 * Forums API
 * GET /api/forums - List active forums
 */

import { NextResponse } from 'next/server';
import { getActiveForums } from '@/lib/forum';
import logger from '@/lib/logger';
import ErrorHandler from '@/lib/error-handler';

export const dynamic = 'force-dynamic';

/**
 * GET /api/forums
 * Returns list of active forums for today
 */
export async function GET() {
  try {
    const forums = await getActiveForums();

    return NextResponse.json({
      success: true,
      data: forums,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in GET /api/forums', { error });
    return ErrorHandler.handleError(error);
  }
}

