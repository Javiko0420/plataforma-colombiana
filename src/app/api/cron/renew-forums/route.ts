/**
 * Forum Renewal Cron Job
 * Runs daily at 23:59 Australia/Brisbane time (13:59 UTC)
 * Deletes forum content, archives old forums, and creates new ones for the next day
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { ForumTopic } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds for Vercel

/**
 * POST /api/cron/renew-forums
 * Archive old forums and create new daily forums
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron job attempt', {
        ip: request.headers.get('x-forwarded-for'),
      });
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.info('Starting forum renewal cron job');

    // Get current time in Australia/Brisbane timezone
    const now = new Date();
    const brisbaneTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'Australia/Brisbane' })
    );

    // New forums are for TOMORROW (cron runs at 23:59, still "today")
    const tomorrow = new Date(brisbaneTime);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Set start time to 00:00:00 tomorrow
    const startDate = new Date(tomorrow);
    startDate.setHours(0, 0, 0, 0);

    // Set end time to 23:59:59 tomorrow
    const endDate = new Date(tomorrow);
    endDate.setHours(23, 59, 59, 999);

    // 1. Get forums that will be archived (preserve their custom names/descriptions)
    const forumsToArchive = await prisma.forum.findMany({
      where: { isActive: true },
      select: { id: true, slug: true, name: true, description: true, topic: true },
    });

    const forumIds = forumsToArchive.map((f) => f.id);

    // 2. Soft delete all content from expiring forums (retained 30 days for legal/audit, then hard deleted)
    if (forumIds.length > 0) {
      const softDeleteTimestamp = new Date();

      const softDeletedPosts = await prisma.forumPost.updateMany({
        where: {
          forumId: { in: forumIds },
          isDeleted: false,
        },
        data: {
          isDeleted: true,
          deletedAt: softDeleteTimestamp,
        },
      });

      const softDeletedComments = await prisma.forumComment.updateMany({
        where: {
          post: { forumId: { in: forumIds } },
          isDeleted: false,
        },
        data: {
          isDeleted: true,
          deletedAt: softDeleteTimestamp,
        },
      });

      logger.info('Soft-deleted forum content', {
        forums: forumIds.length,
        postsSoftDeleted: softDeletedPosts.count,
        commentsSoftDeleted: softDeletedComments.count,
        retentionDays: 30,
      });
    }

    // 3. Archive old active forums
    const archivedResult = await prisma.forum.updateMany({
      where: {
        isActive: true,
      },
      data: {
        isActive: false,
        isArchived: true,
      },
    });

    logger.info('Archived old forums', { count: archivedResult.count });

    // 4. Create new forums for tomorrow, carrying over custom names/descriptions
    const previousDaily1 = forumsToArchive.find((f) => f.topic === ForumTopic.DAILY_1);
    const previousDaily2 = forumsToArchive.find((f) => f.topic === ForumTopic.DAILY_2);

    const forum1 = await prisma.forum.create({
      data: {
        name: previousDaily1?.name || 'Foro Diario 1',
        description:
          previousDaily1?.description ||
          'Foro general para discusiones diarias sobre Colombia y la comunidad.',
        slug: `daily-1-${tomorrow.toISOString().split('T')[0]}`,
        topic: ForumTopic.DAILY_1,
        startDate,
        endDate,
        isActive: true,
        isArchived: false,
      },
    });

    const forum2 = await prisma.forum.create({
      data: {
        name: previousDaily2?.name || 'Foro Diario 2',
        description:
          previousDaily2?.description ||
          'Segundo foro para temas variados y conversaciones alternativas.',
        slug: `daily-2-${tomorrow.toISOString().split('T')[0]}`,
        topic: ForumTopic.DAILY_2,
        startDate,
        endDate,
        isActive: true,
        isArchived: false,
      },
    });

    logger.info('Created new daily forums', {
      forum1Id: forum1.id,
      forum2Id: forum2.id,
      date: tomorrow.toISOString().split('T')[0],
    });

    return NextResponse.json({
      success: true,
      data: {
        contentDeleted: forumIds.length > 0,
        forumsCleanedUp: forumIds.length,
        archived: archivedResult.count,
        created: [
          {
            id: forum1.id,
            topic: forum1.topic,
            slug: forum1.slug,
          },
          {
            id: forum2.id,
            topic: forum2.topic,
            slug: forum2.slug,
          },
        ],
        brisbaneTime: brisbaneTime.toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in forum renewal cron job', { error });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to renew forums',
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

  // Allow manual testing in development
  return POST(request);
}

