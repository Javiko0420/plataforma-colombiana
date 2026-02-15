import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const generatePasswordResetToken = async (email: string) => {
  // Generamos un token seguro
  const token = crypto.randomUUID();
  // Expira en 15 minutos
  const expires = new Date(new Date().getTime() + 15 * 60 * 1000);

  // Eliminamos tokens anteriores de este usuario para evitar spam
  const existingToken = await prisma.passwordResetToken.findFirst({
    where: { email },
  });

  if (existingToken) {
    await prisma.passwordResetToken.delete({
      where: { id: existingToken.id },
    });
  }

  // Creamos el nuevo token
  const passwordResetToken = await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return passwordResetToken;
};
