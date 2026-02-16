import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  // Verificación del token del Cron de Vercel
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Acceso no autorizado al sistema', { status: 401 });
  }

  // Calcular la fecha límite de retención (30 días atrás)
  const retentionLimit = new Date();
  retentionLimit.setDate(retentionLimit.getDate() - 30);

  try {
    const purgeResult = await prisma.jobOffer.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: retentionLimit } },
          { deletedAt: { lt: retentionLimit } }
        ]
      }
    });

    return NextResponse.json({
      status: 'success',
      message: 'Protocolo de purga completado.',
      recordsDeleted: purgeResult.count
    });
  } catch (error) {
    console.error('Fallo en el protocolo de purga:', error);
    return NextResponse.json(
      { status: 'error', message: 'Fallo crítico durante la limpieza de la base de datos.' },
      { status: 500 }
    );
  }
}
