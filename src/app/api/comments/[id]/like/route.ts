/**
 * Comment Like API
 * POST /api/comments/[id]/like - Like a comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/get-auth-user';
import { likeComment } from '@/lib/forum';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/error-handler';

export const dynamic = 'force-dynamic';

/**
 * POST /api/comments/[id]/like
 * Like a comment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    const userId = await getAuthUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!commentId) {
      return NextResponse.json(
        { success: false, error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    const comment = await likeComment(commentId, userId);

    return NextResponse.json({
      success: true,
      data: {
        commentId: comment.id,
        likesCount: comment.likesCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in POST /api/comments/[id]/like', { error });
    return handleApiError(error);
  }
}

