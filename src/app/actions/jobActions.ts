'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const URL_SHORTENER_REGEX = /^(https?:\/\/)?(bit\.ly|tinyurl\.com|cutt\.ly|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|shorte\.st)\//i;

const JOB_POSTING_TERMS_VERSION = '2026-02-17';

export type JobOfferInput = {
  title: string;
  category: string;
  description: string;
  location: string;
  jobType: string;
  hourlyRate: number;
  email?: string;
  phone?: string;
  externalLink?: string;
};

export async function createJobOffer(data: JobOfferInput) {
  // 1. Obtener usuario desde la sesión del servidor (ignora cualquier dato del cliente)
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Acceso denegado: Debes iniciar sesión para publicar una oferta." };
  }

  // 2. Validación de salario por hora (obligatorio por requisito legal)
  if (!data.hourlyRate || data.hourlyRate <= 0) {
    return { error: "El salario por hora es obligatorio y debe ser mayor a 0 (requisito legal)." };
  }

  // 3. Validación de métodos de contacto
  if (!data.email && !data.phone && !data.externalLink) {
    return { error: "Se requiere al menos un método de contacto válido (email, teléfono o enlace)." };
  }

  // 4. Validación de acortadores de URL
  if (data.externalLink && URL_SHORTENER_REGEX.test(data.externalLink)) {
    return { error: "Por seguridad de la comunidad, no se permiten acortadores de URL en los enlaces externos." };
  }

  // 4. Calcular fechas de expiración (15 días exactos)
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 15 * 24 * 60 * 60 * 1000);

  try {
    // 5. Guardar en base de datos vinculando el autor de forma segura
    await prisma.jobOffer.create({
      data: {
        title: data.title,
        category: data.category,
        description: data.description,
        location: data.location,
        jobType: data.jobType,
        hourlyRate: data.hourlyRate,
        email: data.email,
        phone: data.phone,
        externalLink: data.externalLink,
        createdAt,
        expiresAt,
        user: { connect: { id: session.user.id } },
      },
    });
  } catch (error) {
    console.error("Error al crear oferta:", error);
    return { error: "Ocurrió un error al guardar la publicación. Por favor, intenta de nuevo." };
  }

  // 6. Revalidar y redirigir fuera del try-catch
  // (Next.js usa throw internamente en redirect, dentro de try-catch se rompería)
  revalidatePath('/empleos');
  redirect('/empleos');
}

export async function acceptJobPostingTerms() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Acceso denegado: Debes iniciar sesión." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        jobPostingTermsAcceptedAt: new Date(),
        jobPostingTermsVersion: JOB_POSTING_TERMS_VERSION,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error al registrar aceptación de términos:", error);
    return { error: "Error al registrar la aceptación. Intenta de nuevo." };
  }
}

export async function hasAcceptedJobPostingTerms(): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return false;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { jobPostingTermsAcceptedAt: true, jobPostingTermsVersion: true },
    });

    return (
      !!user?.jobPostingTermsAcceptedAt &&
      user?.jobPostingTermsVersion === JOB_POSTING_TERMS_VERSION
    );
  } catch {
    return false;
  }
}

export async function getUserJobOffers() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "No autorizado", data: [] };
  }

  try {
    const jobs = await prisma.jobOffer.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: jobs };
  } catch (error) {
    console.error("Error al obtener empleos del usuario:", error);
    return { error: "Fallo al conectar con la base de datos.", data: [] };
  }
}

export async function getJobOfferById(jobId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "No autorizado", data: null };
  }

  const userRole = (session.user as { role?: string }).role ?? 'USER';
  const isPrivileged = userRole === 'ADMIN' || userRole === 'MODERATOR';

  try {
    const job = await prisma.jobOffer.findFirst({
      where: {
        id: jobId,
        deletedAt: null,
        // Admins/moderadores pueden acceder a cualquier oferta
        ...(!isPrivileged && { userId: session.user.id }),
      },
    });

    if (!job) {
      return { error: "No se encontró la oferta o no tienes permisos para verla.", data: null };
    }

    return { success: true, data: job };
  } catch (error) {
    console.error("Error al obtener la oferta:", error);
    return { error: "Fallo al conectar con la base de datos.", data: null };
  }
}

export async function updateUserJobOffer(jobId: string, data: JobOfferInput) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "No autorizado" };
  }

  // Validación de salario por hora (obligatorio por requisito legal)
  if (!data.hourlyRate || data.hourlyRate <= 0) {
    return { error: "El salario por hora es obligatorio y debe ser mayor a 0 (requisito legal)." };
  }

  // Validación de métodos de contacto
  if (!data.email && !data.phone && !data.externalLink) {
    return { error: "Se requiere al menos un método de contacto válido (email, teléfono o enlace)." };
  }

  // Validación de acortadores de URL
  if (data.externalLink && URL_SHORTENER_REGEX.test(data.externalLink)) {
    return { error: "Por seguridad de la comunidad, no se permiten acortadores de URL en los enlaces externos." };
  }

  const userRole = (session.user as { role?: string }).role ?? 'USER';
  const isPrivileged = userRole === 'ADMIN' || userRole === 'MODERATOR';

  try {
    const result = await prisma.jobOffer.updateMany({
      where: {
        id: jobId,
        // Admins/moderadores pueden editar cualquier oferta
        ...(!isPrivileged && { userId: session.user.id }),
      },
      data: {
        title: data.title,
        category: data.category,
        description: data.description,
        location: data.location,
        jobType: data.jobType,
        hourlyRate: data.hourlyRate,
        email: data.email,
        phone: data.phone,
        externalLink: data.externalLink,
      },
    });

    if (result.count === 0) {
      return { error: "No se encontró la oferta o no tienes permisos para editarla." };
    }

    revalidatePath('/perfil');
    revalidatePath('/empleos');
    revalidatePath('/admin/empleos');

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar oferta:", error);
    return { error: "Ocurrió un error al actualizar la oferta. Por favor, intenta de nuevo." };
  }
}

export async function deleteUserJobOffer(jobId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "No autorizado" };
  }

  try {
    // updateMany para exigir que el jobId coincida con el userId,
    // evitando que un usuario elimine ofertas ajenas
    const result = await prisma.jobOffer.updateMany({
      where: {
        id: jobId,
        userId: session.user.id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    if (result.count === 0) {
      return { error: "No se encontró la oferta o no tienes permisos para eliminarla." };
    }

    revalidatePath('/perfil');
    revalidatePath('/empleos');

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar oferta:", error);
    return { error: "Ocurrió un error al intentar eliminar la oferta." };
  }
}
