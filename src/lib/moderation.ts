/**
 * Content Moderation System
 * Integrates with OpenAI Moderation API to automatically flag inappropriate content
 */

import logger from './logger';
import { prisma } from './prisma';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODERATION_THRESHOLD = 0.7;
const OPENAI_MODERATION_URL = 'https://api.openai.com/v1/moderations';

export interface ModerationResult {
  flagged: boolean;
  categories: Record<string, boolean>;
  categoryScores: Record<string, number>;
  reason?: string;
}

/**
 * Check content with OpenAI Moderation API
 */
export async function moderateContent(
  content: string
): Promise<ModerationResult> {
  // If no API key, skip moderation but log warning
  if (!OPENAI_API_KEY || OPENAI_API_KEY === '') {
    logger.warn('OpenAI API key not configured, skipping moderation');
    return {
      flagged: false,
      categories: {},
      categoryScores: {},
    };
  }

  try {
    const response = await fetch(OPENAI_MODERATION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: content,
        model: 'text-moderation-latest',
      }),
    });

    if (!response.ok) {
      logger.error('OpenAI Moderation API error', {
        status: response.status,
        statusText: response.statusText,
      });
      // Don't throw, just return unflagged
      return {
        flagged: false,
        categories: {},
        categoryScores: {},
      };
    }

    const data = await response.json();
    const result = data.results[0];

    // Determine if content should be flagged
    const scores = Object.values(result.category_scores).filter((score): score is number => typeof score === 'number');
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    const flagged = result.flagged || maxScore >= MODERATION_THRESHOLD;

    // Get the reason (category with highest score)
    let reason: string | undefined;
    if (flagged) {
      const categories = result.categories as Record<string, boolean>;
      const flaggedCategory = Object.entries(categories).find(
        ([, value]) => value
      );
      if (flaggedCategory) {
        reason = formatCategoryName(flaggedCategory[0]);
      }
    }

    return {
      flagged,
      categories: result.categories,
      categoryScores: result.category_scores,
      reason,
    };
  } catch (error) {
    logger.error('Error calling OpenAI Moderation API', { error });
    // Don't throw, just return unflagged to not block user
    return {
      flagged: false,
      categories: {},
      categoryScores: {},
    };
  }
}

/**
 * Moderate a forum post
 */
export async function moderatePost(postId: string): Promise<void> {
  try {
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { content: true, authorId: true },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const moderation = await moderateContent(post.content);
    const scores = moderation.categoryScores
      ? Object.values(moderation.categoryScores).filter((score): score is number => typeof score === 'number')
      : [];
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;

    // Update post with moderation results
    await prisma.forumPost.update({
      where: { id: postId },
      data: {
        moderationScore: maxScore,
        isFlagged: moderation.flagged,
        flagReason: moderation.reason || null,
      },
    });

    // If flagged, decrease author reputation
    if (moderation.flagged) {
      await prisma.user.update({
        where: { id: post.authorId },
        data: {
          reputation: { decrement: 10 },
        },
      });

      logger.warn('Post flagged by moderation', {
        postId,
        authorId: post.authorId,
        reason: moderation.reason,
      });
    }
  } catch (error) {
    logger.error('Error moderating post', { error, postId });
    throw error;
  }
}

/**
 * Moderate a forum comment
 */
export async function moderateComment(commentId: string): Promise<void> {
  try {
    const comment = await prisma.forumComment.findUnique({
      where: { id: commentId },
      select: { content: true, authorId: true },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    const moderation = await moderateContent(comment.content);
    const scores = moderation.categoryScores
      ? Object.values(moderation.categoryScores).filter((score): score is number => typeof score === 'number')
      : [];
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;

    // Update comment with moderation results
    await prisma.forumComment.update({
      where: { id: commentId },
      data: {
        moderationScore: maxScore,
        isFlagged: moderation.flagged,
        flagReason: moderation.reason || null,
      },
    });

    // If flagged, decrease author reputation
    if (moderation.flagged) {
      await prisma.user.update({
        where: { id: comment.authorId },
        data: {
          reputation: { decrement: 10 },
        },
      });

      logger.warn('Comment flagged by moderation', {
        commentId,
        authorId: comment.authorId,
        reason: moderation.reason,
      });
    }
  } catch (error) {
    logger.error('Error moderating comment', { error, commentId });
    throw error;
  }
}

/**
 * Check if user should be auto-banned
 * User is banned if:
 * - Reputation falls below -50
 * - 5+ posts flagged in one day
 * - 10+ reports confirmed
 */
export async function checkAutoBan(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        reputation: true,
        isBanned: true,
      },
    });

    if (!user || user.isBanned) {
      return;
    }

    let shouldBan = false;
    let banReason = '';

    // Check reputation
    if (user.reputation < -50) {
      shouldBan = true;
      banReason = 'Low reputation score';
    }

    // Check flagged posts in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const flaggedPostsCount = await prisma.forumPost.count({
      where: {
        authorId: userId,
        isFlagged: true,
        createdAt: { gte: oneDayAgo },
      },
    });

    if (flaggedPostsCount >= 5) {
      shouldBan = true;
      banReason = 'Multiple flagged posts';
    }

    // Check confirmed reports
    const confirmedReports = await prisma.report.count({
      where: {
        OR: [
          {
            post: {
              authorId: userId,
            },
          },
          {
            comment: {
              authorId: userId,
            },
          },
        ],
        status: 'RESOLVED',
      },
    });

    if (confirmedReports >= 10) {
      shouldBan = true;
      banReason = 'Multiple confirmed reports';
    }

    // Ban user if criteria met
    if (shouldBan) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: true,
          reputation: { decrement: 20 },
        },
      });

      logger.warn('User auto-banned', { userId, reason: banReason });
    }
  } catch (error) {
    logger.error('Error checking auto-ban', { error, userId });
    throw error;
  }
}

/**
 * Format category name for display
 */
function formatCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    'hate': 'Hate speech',
    'hate/threatening': 'Threatening hate speech',
    'harassment': 'Harassment',
    'harassment/threatening': 'Threatening harassment',
    'self-harm': 'Self-harm',
    'self-harm/intent': 'Self-harm intent',
    'self-harm/instructions': 'Self-harm instructions',
    'sexual': 'Sexual content',
    'sexual/minors': 'Sexual content involving minors',
    'violence': 'Violence',
    'violence/graphic': 'Graphic violence',
  };

  return categoryMap[category] || category;
}

/**
 * Get flagged content for moderation review
 */
export async function getFlaggedContent(options: {
  type?: 'post' | 'comment';
  page?: number;
  limit?: number;
}) {
  const { type, page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  try {
    if (!type || type === 'post') {
      const posts = await prisma.forumPost.findMany({
        where: {
          isFlagged: true,
          isDeleted: false,
        },
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
              reputation: true,
            },
          },
          forum: {
            select: {
              name: true,
              topic: true,
            },
          },
          _count: {
            select: {
              reports: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      return { posts };
    }

    if (type === 'comment') {
      const comments = await prisma.forumComment.findMany({
        where: {
          isFlagged: true,
          isDeleted: false,
        },
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
              reputation: true,
            },
          },
          post: {
            select: {
              id: true,
              forum: {
                select: {
                  name: true,
                  topic: true,
                },
              },
            },
          },
          _count: {
            select: {
              reports: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      return { comments };
    }

    return { posts: [], comments: [] };
  } catch (error) {
    logger.error('Error fetching flagged content', { error });
    throw new Error('Failed to fetch flagged content');
  }
}

