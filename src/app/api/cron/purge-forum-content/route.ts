/**
 * Forum Content Purge Cron Job
 * Runs weekly to permanently delete (hard delete) forum content
 * that was soft-deleted more than 30 days ago.
 *
 * Retention policy: 30 days for legal/audit compliance, then permanent removal.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const RETENTION_DAYS = 30;

/**
 * POST /api/cron/purge-forum-content
 * Hard delete soft-deleted forum content older than retention period
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

    // Calculate cutoff date (30 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    // 1. Hard delete comments that were soft-deleted beyond retention period
    //    (must delete comments before posts due to foreign key constraints)
    const purgedComments = await prisma.forumComment.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: { lt: cutoffDate },
      },
    });

    // 2. Hard delete posts that were soft-deleted beyond retention period
    //    (remaining comments cascade via onDelete: Cascade)
    const purgedPosts = await prisma.forumPost.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: { lt: cutoffDate },
      },
    });

    logger.info('Forum content purge completed', {
      postsPurged: purgedPosts.count,
      commentsPurged: purgedComments.count,
      cutoffDate: cutoffDate.toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        retentionDays: RETENTION_DAYS,
        cutoffDate: cutoffDate.toISOString(),
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
