/**
 * Forum Renewal Cron Job
 * Runs daily at 00:00 Australia/Sydney time
 * Archives old forums and creates new ones
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

    // Get current time in Australia/Sydney timezone
    const now = new Date();
    const sydneyTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'Australia/Sydney' })
    );

    // Set start time to 00:00:00 today
    const startDate = new Date(sydneyTime);
    startDate.setHours(0, 0, 0, 0);

    // Set end time to 23:59:59 today
    const endDate = new Date(sydneyTime);
    endDate.setHours(23, 59, 59, 999);

    // Archive old active forums
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

    // Create new forums for today
    const forum1 = await prisma.forum.create({
      data: {
        name: 'Foro Diario 1',
        description:
          'Foro general para discusiones diarias sobre Colombia y la comunidad.',
        slug: `daily-1-${sydneyTime.toISOString().split('T')[0]}`,
        topic: ForumTopic.DAILY_1,
        startDate,
        endDate,
        isActive: true,
        isArchived: false,
      },
    });

    const forum2 = await prisma.forum.create({
      data: {
        name: 'Foro Diario 2',
        description:
          'Segundo foro para temas variados y conversaciones alternativas.',
        slug: `daily-2-${sydneyTime.toISOString().split('T')[0]}`,
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
      date: sydneyTime.toISOString().split('T')[0],
    });

    return NextResponse.json({
      success: true,
      data: {
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
        sydneyTime: sydneyTime.toISOString(),
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

