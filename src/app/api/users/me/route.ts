/**
 * User Profile API
 * GET /api/users/me - Get current user profile
 * PUT /api/users/me - Update current user profile (full update)
 * PATCH /api/users/me - Update current user profile (partial - nickname only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserProfile, updateUserNickname } from '@/lib/forum';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/error-handler';
import { validateNicknameInput } from '@/lib/validations';
import { z } from 'zod';

// Validación completa para actualización de usuario
const userUpdateSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  nickname: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")), // Para la foto de perfil
});

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
 * PUT /api/users/me
 * Update current user profile (full update: name, nickname, image)
 */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = userUpdateSchema.parse(body);

    // Actualizar usuario en BD
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        nickname: validatedData.nickname || null,
        image: validatedData.image || null,
      },
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    logger.error('Error in PUT /api/users/me', { error });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
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

