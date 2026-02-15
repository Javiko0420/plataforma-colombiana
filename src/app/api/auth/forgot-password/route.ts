import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "El correo es requerido" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    });

    if (!user) {
      // Por seguridad, siempre devolvemos OK aunque el usuario no exista
      // Esto evita ataques de enumeración de correos
      return NextResponse.json({ success: true });
    }

    // Verificar si el usuario usa EXCLUSIVAMENTE Google (no tiene contraseña local)
    const isGoogleAccount = user.accounts.some(
      (acc) => acc.provider === "google"
    );
    if (isGoogleAccount && !user.password) {
      return NextResponse.json(
        {
          error:
            "Este correo está asociado a una cuenta de Google. Para cambiar tu contraseña, hazlo directamente desde los ajustes de tu cuenta de Google.",
        },
        { status: 403 }
      );
    }

    const passwordResetToken = await generatePasswordResetToken(email);

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password?token=${passwordResetToken.token}`;

    // Disparamos el correo real a través de Zoho
    await sendPasswordResetEmail(email, resetLink);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
