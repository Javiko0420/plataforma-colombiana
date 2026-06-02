/**
 * Forum Content Purge Cron Job
 * Runs weekly to permanently delete archived forums and all their content
 * (posts and comments) once the forum's endDate is older than 7 days.
 *
 * Retention policy: 7 days after forum end before permanent removal.
 * Eligibility is based on forum.endDate, not soft-delete flags.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const RETENTION_DAYS = 7;

/**
 * POST /api/cron/purge-forum-content
 * Hard delete archived forums and their content when endDate exceeds retention period
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized purge cron attempt', {
        ip: request.headers.get('x-forwarded-for'),
      });
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.info('Starting forum content purge cron job', {
      retentionDays: RETENTION_DAYS,
    });

    // Calculate cutoff date (7 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    // 1. Find archived forums whose endDate is older than the retention period
    const eligibleForums = await prisma.forum.findMany({
      where: {
        isArchived: true,
        endDate: { lt: cutoffDate },
      },
      select: { id: true, slug: true, endDate: true },
    });

    if (eligibleForums.length === 0) {
      logger.info('No forums eligible for purge', {
        cutoffDate: cutoffDate.toISOString(),
        retentionDays: RETENTION_DAYS,
      });
      return NextResponse.json({
        success: true,
        message: 'No forums eligible for purge',
        timestamp: new Date().toISOString(),
      });
    }

    const forumIds = eligibleForums.map((f) => f.id);

    // 2. Hard delete comments (foreign key: comment → post → forum)
    const purgedComments = await prisma.forumComment.deleteMany({
      where: { post: { forumId: { in: forumIds } } },
    });

    // 3. Hard delete posts
    const purgedPosts = await prisma.forumPost.deleteMany({
      where: { forumId: { in: forumIds } },
    });

    // 4. Hard delete the archived forums themselves
    const purgedForums = await prisma.forum.deleteMany({
      where: { id: { in: forumIds } },
    });

    logger.info('Forum content purge completed', {
      forumsPurged: purgedForums.count,
      postsPurged: purgedPosts.count,
      commentsPurged: purgedComments.count,
      cutoffDate: cutoffDate.toISOString(),
      retentionDays: RETENTION_DAYS,
    });

    return NextResponse.json({
      success: true,
      data: {
        retentionDays: RETENTION_DAYS,
        cutoffDate: cutoffDate.toISOString(),
        forumsPurged: purgedForums.count,
        postsPurged: purgedPosts.count,
        commentsPurged: purgedComments.count,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in forum content purge cron job', { error });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to purge forum content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for manual testing (only in development)
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, error: 'Not available in production' },
      { status: 403 }
    );
  }

  return POST(request);
}
