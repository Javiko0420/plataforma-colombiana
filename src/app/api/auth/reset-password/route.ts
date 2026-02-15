import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // 1. Validar el token
    const existingToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!existingToken) {
      return NextResponse.json(
        { error: "El token es inválido o no existe" },
        { status: 400 }
      );
    }

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
      return NextResponse.json(
        { error: "El token ha expirado. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    // 2. Verificar que el usuario exista
    const existingUser = await prisma.user.findUnique({
      where: { email: existingToken.email },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "El usuario no existe" },
        { status: 400 }
      );
    }

    // 3. Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Actualizar usuario y borrar token en una transacción atómica
    await prisma.$transaction([
      prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.delete({
        where: { id: existingToken.id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en reset-password:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
