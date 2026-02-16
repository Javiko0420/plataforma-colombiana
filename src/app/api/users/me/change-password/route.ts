/**
 * Change Password API
 * POST /api/users/me/change-password
 * Allows authenticated users (credential-based) to change their password.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PasswordSecurity } from '@/lib/password-security';
import { logger } from '@/lib/logger';
import { changePasswordSchema } from '@/lib/validations';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = changePasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Google-only users don't have a local password
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Tu cuenta usa Google Login. Cambia tu contraseña desde tu cuenta de Google.',
        },
        { status: 400 }
      );
    }

    const isCurrentValid = await PasswordSecurity.verifyPassword(
      validatedData.currentPassword,
      user.password
    );

    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: 'La contraseña actual es incorrecta' },
        { status: 400 }
      );
    }

    const hashedPassword = await PasswordSecurity.hashPassword(
      validatedData.newPassword
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    logger.info('Password changed successfully', {
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada correctamente',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    logger.error('Error in POST /api/users/me/change-password', { error });

    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
