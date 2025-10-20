/**
 * Forum by ID API
 * GET /api/forums/[id] - Get forum details
 */

import { NextRequest, NextResponse } from 'next/server';
import { getForumById } from '@/lib/forum';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/error-handler';

export const dynamic = 'force-dynamic';

/**
 * GET /api/forums/[id]
 * Returns forum details by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Forum ID is required' },
        { status: 400 }
      );
    }

    const forum = await getForumById(id);

    return NextResponse.json({
      success: true,
      data: forum,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in GET /api/forums/[id]', { error });
    return handleApiError(error);
  }
}

