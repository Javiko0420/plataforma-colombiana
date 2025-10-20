/**
 * User Profile API
 * GET /api/users/me - Get current user profile
 * PATCH /api/users/me - Update current user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserProfile, updateUserNickname } from '@/lib/forum';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/error-handler';
import { validateNicknameInput } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/me
 * Get current user profile
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const profile = await getUserProfile(session.user.id);

    return NextResponse.json({
      success: true,
      data: profile,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in GET /api/users/me', { error });
    return handleApiError(error);
  }
}

/**
 * PATCH /api/users/me
 * Update current user profile (nickname)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = validateNicknameInput(body);

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

    const user = await updateUserNickname(
      session.user.id,
      validation.data.nickname
    );

    return NextResponse.json({
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in PATCH /api/users/me', { error });
    return handleApiError(error);
  }
}

