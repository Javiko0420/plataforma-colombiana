/**
 * Post Comments API
 * GET /api/posts/[id]/comments - Get comments from a post
 * POST /api/posts/[id]/comments - Create a new comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPostComments, createComment } from '@/lib/forum';
import { moderateComment } from '@/lib/moderation';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/error-handler';
import { validateForumPostInput } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/**
 * GET /api/posts/[id]/comments
 * Returns comments from a post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const comments = await getPostComments(postId);

    return NextResponse.json({
      success: true,
      data: comments,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in GET /api/posts/[id]/comments', { error });
    return handleApiError(error);
  }
}

/**
 * POST /api/posts/[id]/comments
 * Create a new comment on a post
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

    const body = await request.json();
    const validation = validateForumPostInput(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Create comment
    const comment = await createComment({
      content: validation.data.content,
      postId,
      authorId: session.user.id,
    });

    // Moderate comment asynchronously
    moderateComment(comment.id).catch((error) => {
      logger.error('Error moderating comment', { error, commentId: comment.id });
    });

    return NextResponse.json(
      {
        success: true,
        data: comment,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error in POST /api/posts/[id]/comments', { error });
    return handleApiError(error);
  }
}

