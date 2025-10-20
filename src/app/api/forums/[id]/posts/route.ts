/**
 * Forum Posts API
 * GET /api/forums/[id]/posts - Get posts from a forum
 * POST /api/forums/[id]/posts - Create a new post
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getForumPosts, createPost } from '@/lib/forum';
import { moderatePost } from '@/lib/moderation';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/error-handler';
import { validateForumPostInput } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/**
 * GET /api/forums/[id]/posts
 * Returns posts from a forum with pagination
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Forum ID is required' },
        { status: 400 }
      );
    }

    const posts = await getForumPosts(id, { page, limit });

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in GET /api/forums/[id]/posts', { error });
    return handleApiError(error);
  }
}

/**
 * POST /api/forums/[id]/posts
 * Create a new post in the forum
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: forumId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!forumId) {
      return NextResponse.json(
        { success: false, error: 'Forum ID is required' },
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

    // Create post
    const post = await createPost({
      content: validation.data.content,
      forumId,
      authorId: session.user.id,
    });

    // Moderate post asynchronously (don't await to not block response)
    moderatePost(post.id).catch((error) => {
      logger.error('Error moderating post', { error, postId: post.id });
    });

    return NextResponse.json(
      {
        success: true,
        data: post,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error in POST /api/forums/[id]/posts', { error });
    return handleApiError(error);
  }
}

