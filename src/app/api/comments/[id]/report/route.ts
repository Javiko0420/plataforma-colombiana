/**
 * Comment Report API
 * POST /api/comments/[id]/report - Report a comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createReport } from '@/lib/forum';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/error-handler';
import { validateReportInput } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/**
 * POST /api/comments/[id]/report
 * Report a comment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!commentId) {
      return NextResponse.json(
        { success: false, error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = validateReportInput(body);

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

    const report = await createReport({
      reason: validation.data.reason,
      details: validation.data.details,
      reporterId: session.user.id,
      commentId,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          reportId: report.id,
          message: 'Report submitted successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error in POST /api/comments/[id]/report', { error });
    return handleApiError(error);
  }
}

