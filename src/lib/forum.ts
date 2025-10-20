/**
 * Forum Business Logic
 * Handles forum operations, post creation, and reputation management
 */

import { prisma } from './prisma';
import { ForumTopic, ReportReason, ReportStatus } from '@prisma/client';
import logger from './logger';

// Types
export interface CreatePostInput {
  content: string;
  forumId: string;
  authorId: string;
}

export interface CreateCommentInput {
  content: string;
  postId: string;
  authorId: string;
}

export interface CreateReportInput {
  reason: ReportReason;
  details?: string;
  reporterId: string;
  postId?: string;
  commentId?: string;
}

export interface ForumWithPosts {
  id: string;
  name: string;
  description: string;
  slug: string;
  topic: ForumTopic;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  postsCount: number;
}

export interface PostWithAuthor {
  id: string;
  content: string;
  isEdited: boolean;
  isDeleted: boolean;
  isFlagged: boolean;
  flagReason: string | null;
  likesCount: number;
  reportsCount: number;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    nickname: string | null;
    reputation: number;
  };
  commentsCount: number;
}

/**
 * Get active forums for today
 */
export async function getActiveForums(): Promise<ForumWithPosts[]> {
  try {
    const now = new Date();
    
    const forums = await prisma.forum.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { topic: 'asc' },
    });

    return forums.map((forum) => ({
      id: forum.id,
      name: forum.name,
      description: forum.description,
      slug: forum.slug,
      topic: forum.topic,
      startDate: forum.startDate,
      endDate: forum.endDate,
      isActive: forum.isActive,
      postsCount: forum._count.posts,
    }));
  } catch (error) {
    logger.error('Error fetching active forums', { error });
    // Re-throw the original error instead of a generic one for debugging
    throw error;
  }
}

/**
 * Get forum by ID
 */
export async function getForumById(forumId: string) {
  try {
    const forum = await prisma.forum.findUnique({
      where: { id: forumId },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!forum) {
      throw new Error('Forum not found');
    }

    return {
      id: forum.id,
      name: forum.name,
      description: forum.description,
      slug: forum.slug,
      topic: forum.topic,
      startDate: forum.startDate,
      endDate: forum.endDate,
      isActive: forum.isActive,
      isArchived: forum.isArchived,
      postsCount: forum._count.posts,
    };
  } catch (error) {
    logger.error('Error fetching forum', { error, forumId });
    throw error;
  }
}

/**
 * Get posts from a forum
 */
export async function getForumPosts(
  forumId: string,
  options: {
    page?: number;
    limit?: number;
    includeDeleted?: boolean;
  } = {}
): Promise<PostWithAuthor[]> {
  const { page = 1, limit = 50, includeDeleted = false } = options;
  const skip = (page - 1) * limit;

  try {
    const posts = await prisma.forumPost.findMany({
      where: {
        forumId,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            reputation: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return posts.map((post) => ({
      id: post.id,
      content: post.content,
      isEdited: post.isEdited,
      isDeleted: post.isDeleted,
      isFlagged: post.isFlagged,
      flagReason: post.flagReason,
      likesCount: post.likesCount,
      reportsCount: post.reportsCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: post.author.id,
        nickname: post.author.nickname || 'Anonymous',
        reputation: post.author.reputation,
      },
      commentsCount: post._count.comments,
    }));
  } catch (error) {
    logger.error('Error fetching forum posts', { error, forumId });
    throw new Error('Failed to fetch forum posts');
  }
}

/**
 * Get comments for a post
 */
export async function getPostComments(
  postId: string,
  options: { includeDeleted?: boolean } = {}
) {
  const { includeDeleted = false } = options;

  try {
    const comments = await prisma.forumComment.findMany({
      where: {
        postId,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            reputation: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      isEdited: comment.isEdited,
      isDeleted: comment.isDeleted,
      isFlagged: comment.isFlagged,
      flagReason: comment.flagReason,
      likesCount: comment.likesCount,
      reportsCount: comment.reportsCount,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: comment.author.id,
        nickname: comment.author.nickname || 'Anonymous',
        reputation: comment.author.reputation,
      },
    }));
  } catch (error) {
    logger.error('Error fetching post comments', { error, postId });
    throw new Error('Failed to fetch comments');
  }
}

/**
 * Create a new forum post
 */
export async function createPost(input: CreatePostInput) {
  const { content, forumId, authorId } = input;

  try {
    // Validate content length
    if (content.length < 1 || content.length > 500) {
      throw new Error('Content must be between 1 and 500 characters');
    }

    // Check if user is banned
    const user = await prisma.user.findUnique({
      where: { id: authorId },
      select: { isBanned: true, nickname: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isBanned) {
      throw new Error('User is banned from posting');
    }

    if (!user.nickname) {
      throw new Error('User must set a nickname before posting');
    }

    // Check if forum exists and is active
    const forum = await prisma.forum.findUnique({
      where: { id: forumId },
      select: { isActive: true },
    });

    if (!forum) {
      throw new Error('Forum not found');
    }

    if (!forum.isActive) {
      throw new Error('Forum is not active');
    }

    // Create the post
    const post = await prisma.forumPost.create({
      data: {
        content,
        authorId,
        forumId,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            reputation: true,
          },
        },
      },
    });

    logger.info('Forum post created', { postId: post.id, authorId });

    return post;
  } catch (error) {
    logger.error('Error creating forum post', { error, authorId, forumId });
    throw error;
  }
}

/**
 * Create a comment on a post
 */
export async function createComment(input: CreateCommentInput) {
  const { content, postId, authorId } = input;

  try {
    // Validate content length
    if (content.length < 1 || content.length > 500) {
      throw new Error('Content must be between 1 and 500 characters');
    }

    // Check if user is banned
    const user = await prisma.user.findUnique({
      where: { id: authorId },
      select: { isBanned: true, nickname: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isBanned) {
      throw new Error('User is banned from commenting');
    }

    if (!user.nickname) {
      throw new Error('User must set a nickname before commenting');
    }

    // Check if post exists and is not deleted
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { isDeleted: true },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.isDeleted) {
      throw new Error('Cannot comment on deleted post');
    }

    // Create the comment
    const comment = await prisma.forumComment.create({
      data: {
        content,
        authorId,
        postId,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            reputation: true,
          },
        },
      },
    });

    logger.info('Forum comment created', { commentId: comment.id, authorId });

    return comment;
  } catch (error) {
    logger.error('Error creating forum comment', { error, authorId, postId });
    throw error;
  }
}

/**
 * Like a post
 */
export async function likePost(postId: string, userId: string) {
  try {
    const post = await prisma.forumPost.update({
      where: { id: postId },
      data: {
        likesCount: { increment: 1 },
      },
      include: {
        author: {
          select: { id: true, reputation: true },
        },
      },
    });

    // Update author reputation (+5 points)
    await prisma.user.update({
      where: { id: post.authorId },
      data: {
        reputation: { increment: 5 },
      },
    });

    logger.info('Post liked', { postId, userId });

    return post;
  } catch (error) {
    logger.error('Error liking post', { error, postId, userId });
    throw new Error('Failed to like post');
  }
}

/**
 * Like a comment
 */
export async function likeComment(commentId: string, userId: string) {
  try {
    const comment = await prisma.forumComment.update({
      where: { id: commentId },
      data: {
        likesCount: { increment: 1 },
      },
      include: {
        author: {
          select: { id: true, reputation: true },
        },
      },
    });

    // Update author reputation (+2 points)
    await prisma.user.update({
      where: { id: comment.authorId },
      data: {
        reputation: { increment: 2 },
      },
    });

    logger.info('Comment liked', { commentId, userId });

    return comment;
  } catch (error) {
    logger.error('Error liking comment', { error, commentId, userId });
    throw new Error('Failed to like comment');
  }
}

/**
 * Report a post or comment
 */
export async function createReport(input: CreateReportInput) {
  const { reason, details, reporterId, postId, commentId } = input;

  try {
    if (!postId && !commentId) {
      throw new Error('Must specify either postId or commentId');
    }

    if (postId && commentId) {
      throw new Error('Cannot report both post and comment');
    }

    // Check if user has already reported this content
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId,
        ...(postId ? { postId } : { commentId }),
      },
    });

    if (existingReport) {
      throw new Error('You have already reported this content');
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reason,
        details,
        reporterId,
        postId,
        commentId,
        status: ReportStatus.PENDING,
      },
    });

    // Increment reports count
    if (postId) {
      const post = await prisma.forumPost.update({
        where: { id: postId },
        data: {
          reportsCount: { increment: 1 },
        },
      });

      // Auto-flag if reports >= 3
      if (post.reportsCount >= 3 && !post.isFlagged) {
        await prisma.forumPost.update({
          where: { id: postId },
          data: {
            isFlagged: true,
            flagReason: 'Multiple user reports',
          },
        });
      }
    } else if (commentId) {
      const comment = await prisma.forumComment.update({
        where: { id: commentId },
        data: {
          reportsCount: { increment: 1 },
        },
      });

      // Auto-flag if reports >= 3
      if (comment.reportsCount >= 3 && !comment.isFlagged) {
        await prisma.forumComment.update({
          where: { id: commentId },
          data: {
            isFlagged: true,
            flagReason: 'Multiple user reports',
          },
        });
      }
    }

    logger.info('Report created', { reportId: report.id, reporterId });

    return report;
  } catch (error) {
    logger.error('Error creating report', { error, reporterId });
    throw error;
  }
}

/**
 * Update user nickname
 */
export async function updateUserNickname(userId: string, nickname: string) {
  try {
    // Validate nickname
    const nicknameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!nicknameRegex.test(nickname)) {
      throw new Error(
        'Nickname must be 3-20 characters and contain only letters, numbers, and underscores'
      );
    }

    // Check if nickname is already taken
    const existingUser = await prisma.user.findUnique({
      where: { nickname },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new Error('Nickname is already taken');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { nickname },
      select: {
        id: true,
        nickname: true,
        reputation: true,
        isBanned: true,
      },
    });

    logger.info('User nickname updated', { userId, nickname });

    return user;
  } catch (error) {
    logger.error('Error updating nickname', { error, userId });
    throw error;
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        reputation: true,
        isBanned: true,
        createdAt: true,
        _count: {
          select: {
            forumPosts: true,
            forumComments: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      nickname: user.nickname,
      reputation: user.reputation,
      isBanned: user.isBanned,
      createdAt: user.createdAt,
      postsCount: user._count.forumPosts,
      commentsCount: user._count.forumComments,
    };
  } catch (error) {
    logger.error('Error fetching user profile', { error, userId });
    throw error;
  }
}

