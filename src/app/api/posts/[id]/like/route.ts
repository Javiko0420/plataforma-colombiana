/**
 * Post Like API
 * POST /api/posts/[id]/like - Like a post
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { likePost } from '@/lib/forum';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/error-handler';

export const dynamic = 'force-dynamic';

/**
 * POST /api/posts/[id]/like
 * Like a post
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const post = await likePost(postId, session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        postId: post.id,
        likesCount: post.likesCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in POST /api/posts/[id]/like', { error });
    return handleApiError(error);
  }
}

