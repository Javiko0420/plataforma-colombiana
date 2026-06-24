/**
 * Forum Business Logic
 * Handles forum operations, post creation, and reputation management
 */

import { prisma } from './prisma';
import { ForumTopic, ReportReason, ReportStatus } from '@prisma/client';
import logger from './logger';
import { ConflictError } from './error-handler';

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
  /** User role — ADMIN/MODERATOR bypass duplicate report restriction */
  userRole?: string;
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
  isArchived?: boolean;
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
    const forums = await prisma.forum.findMany({
      where: { isActive: true },
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

// ─── Hub data (rooms + trending) ──────────────────────────────────────────

/** A single thread preview shown in a room card or in the trending strip. */
export interface ForumHubThread {
  id: string;
  forumSlug: string;
  forumName: string;
  /** Derived from `content`: newlines stripped, truncated to ~70 chars. */
  displayTitle: string;
  authorNickname: string;
  createdAt: Date;
  likesCount: number;
  commentsCount: number;
  /** Color identity inherited from the owning forum (0=accent, 1=terra…). */
  colorIdx: number;
}

/** An active forum rendered as a "live room" with its top threads. */
export interface ForumHubRoom {
  id: string;
  name: string;
  description: string;
  slug: string;
  topic: ForumTopic;
  endDate: Date;
  colorIdx: number;
  postsCount: number;
  participantsCount: number;
  threads: ForumHubThread[];
}

export interface ForumsHubData {
  rooms: ForumHubRoom[];
  trending: ForumHubThread[];
}

/** Collapse whitespace/newlines and truncate to `max` chars with an ellipsis. */
function deriveDisplayTitle(content: string, max = 70): string {
  const oneLine = content.replace(/\s+/g, ' ').trim();
  if (oneLine.length <= max) return oneLine;
  return `${oneLine.slice(0, max).trimEnd()}…`;
}

/** Shape a raw post + resolved forum/color into a serializable hub thread. */
function toHubThread(input: {
  id: string;
  content: string;
  createdAt: Date;
  likesCount: number;
  commentsCount: number;
  forumSlug: string;
  forumName: string;
  nickname: string | null;
  colorIdx: number;
}): ForumHubThread {
  return {
    id: input.id,
    forumSlug: input.forumSlug,
    forumName: input.forumName,
    displayTitle: deriveDisplayTitle(input.content),
    authorNickname: input.nickname || 'Anonymous',
    createdAt: input.createdAt,
    likesCount: input.likesCount,
    commentsCount: input.commentsCount,
    colorIdx: input.colorIdx,
  };
}

/**
 * Aggregated data for the /foros hub: each active forum with its top 3 threads
 * and live stats, plus a flat "trending" list across all active forums.
 *
 * Resolved in 3 queries (no N+1):
 *   1. forums + nested top-3 posts (single findMany with nested take/orderBy)
 *   2. one groupBy → distinct participants AND non-deleted post counts per forum
 *   3. trending posts ordered by comment count across all active forums
 */
export async function getForumsHubData(): Promise<ForumsHubData> {
  try {
    // 1. Active forums, each with its top 3 posts (most liked, then newest).
    const forums = await prisma.forum.findMany({
      where: { isActive: true },
      orderBy: { topic: 'asc' },
      include: {
        posts: {
          where: { isDeleted: false },
          orderBy: [{ likesCount: 'desc' }, { createdAt: 'desc' }],
          take: 3,
          include: {
            author: { select: { nickname: true } },
            _count: { select: { comments: true } },
          },
        },
      },
    });

    if (forums.length === 0) {
      return { rooms: [], trending: [] };
    }

    const forumIds = forums.map((f) => f.id);

    // Color identity is assigned by forum order (topic asc): 1st→0, 2nd→1…
    const colorByForumId = new Map<string, number>();
    forums.forEach((f, i) => colorByForumId.set(f.id, i));

    // 2. Single groupBy gives, per forum: distinct participants (row count)
    //    and non-deleted post total (sum of per-author counts). No N+1.
    const grouped = await prisma.forumPost.groupBy({
      by: ['forumId', 'authorId'],
      where: { forumId: { in: forumIds }, isDeleted: false },
      _count: { _all: true },
    });

    const statsByForumId = new Map<string, { participants: number; posts: number }>();
    for (const row of grouped) {
      const prev = statsByForumId.get(row.forumId) ?? { participants: 0, posts: 0 };
      prev.participants += 1;
      prev.posts += row._count._all;
      statsByForumId.set(row.forumId, prev);
    }

    // 3. Trending: most-commented posts across all active forums.
    const trendingPosts = await prisma.forumPost.findMany({
      where: { isDeleted: false, forum: { isActive: true } },
      orderBy: [
        { comments: { _count: 'desc' } },
        { likesCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 5,
      include: {
        author: { select: { nickname: true } },
        forum: { select: { slug: true, name: true } },
        _count: { select: { comments: true } },
      },
    });

    const rooms: ForumHubRoom[] = forums.map((forum) => {
      const colorIdx = colorByForumId.get(forum.id) ?? 0;
      const stats = statsByForumId.get(forum.id) ?? { participants: 0, posts: 0 };

      return {
        id: forum.id,
        name: forum.name,
        description: forum.description,
        slug: forum.slug,
        topic: forum.topic,
        endDate: forum.endDate,
        colorIdx,
        postsCount: stats.posts,
        participantsCount: stats.participants,
        threads: forum.posts.map((post) =>
          toHubThread({
            id: post.id,
            content: post.content,
            createdAt: post.createdAt,
            likesCount: post.likesCount,
            commentsCount: post._count.comments,
            forumSlug: forum.slug,
            forumName: forum.name,
            nickname: post.author.nickname,
            colorIdx,
          })
        ),
      };
    });

    const trending: ForumHubThread[] = trendingPosts.map((post) =>
      toHubThread({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        likesCount: post.likesCount,
        commentsCount: post._count.comments,
        forumSlug: post.forum.slug,
        forumName: post.forum.name,
        nickname: post.author.nickname,
        colorIdx: colorByForumId.get(post.forumId) ?? 0,
      })
    );

    return { rooms, trending };
  } catch (error) {
    logger.error('Error fetching forums hub data', { error });
    throw error;
  }
}

/**
 * Most-relevant threads across all active forums (most commented, then most
 * liked, then newest). Powers the landing "Conversaciones que conectan" widget.
 * Standalone + light (2 queries): active forum ids for color identity, then the
 * ranked posts. colorIdx follows forum order (topic asc), matching the hub.
 */
export async function getTrendingThreads(limit = 3): Promise<ForumHubThread[]> {
  try {
    const activeForums = await prisma.forum.findMany({
      where: { isActive: true },
      orderBy: { topic: 'asc' },
      select: { id: true },
    });

    if (activeForums.length === 0) return [];

    const colorByForumId = new Map<string, number>();
    activeForums.forEach((f, i) => colorByForumId.set(f.id, i));

    const posts = await prisma.forumPost.findMany({
      where: { isDeleted: false, forum: { isActive: true } },
      orderBy: [
        { comments: { _count: 'desc' } },
        { likesCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      include: {
        author: { select: { nickname: true } },
        forum: { select: { slug: true, name: true } },
        _count: { select: { comments: true } },
      },
    });

    return posts.map((post) =>
      toHubThread({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        likesCount: post.likesCount,
        commentsCount: post._count.comments,
        forumSlug: post.forum.slug,
        forumName: post.forum.name,
        nickname: post.author.nickname,
        colorIdx: colorByForumId.get(post.forumId) ?? 0,
      })
    );
  } catch (error) {
    logger.error('Error fetching trending threads', { error });
    throw error;
  }
}

/**
 * Get recently archived forums within the retention window
 */
export async function getArchivedForums(limitDays = 7): Promise<ForumWithPosts[]> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - limitDays);

    const forums = await prisma.forum.findMany({
      where: {
        isArchived: true,
        endDate: { gte: cutoffDate },
      },
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { endDate: 'desc' },
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
      isArchived: forum.isArchived,
      postsCount: forum._count.posts,
    }));
  } catch (error) {
    logger.error('Error fetching archived forums', { error });
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
  const { reason, details, reporterId, postId, commentId, userRole } = input;
  const isPrivileged = userRole === 'ADMIN' || userRole === 'MODERATOR';

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
      // ADMIN/MODERATOR: delete previous report to allow re-testing the flow
      if (isPrivileged) {
        await prisma.report.delete({ where: { id: existingReport.id } });
      } else {
        throw new ConflictError('You have already reported this content');
      }
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
        name: true,
        email: true,
        nickname: true,
        image: true,
        phoneNumber: true,
        dateOfBirth: true,
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
      name: user.name,
      email: user.email,
      nickname: user.nickname,
      image: user.image,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
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

