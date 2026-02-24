import { prisma } from '@/lib/prisma';
import JobFilters from '@/components/jobs/JobFilters';
import JobList from '@/components/jobs/JobList';
import { HeartHandshake } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EmpleosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; location?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';
  const category = resolvedParams.category || '';
  const location = resolvedParams.location || '';

  const activeJobs = await prisma.jobOffer.findMany({
    where: {
      deletedAt: null,
      expiresAt: { gt: new Date() },
      ...(query && {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(category && { category }),
      ...(location && { location }),
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-16">
      {/* Cabecera con gradiente cálido */}
      <div className="bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 pt-12 pb-8 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Muro de <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-500">Empleos</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Encuentra tu próxima oportunidad profesional en Australia o publica vacantes para hacer crecer tu equipo.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner de Seguridad Amigable */}
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-5 flex items-start sm:items-center gap-4 shadow-sm">
          <div className="bg-blue-100 dark:bg-blue-800/50 p-2 rounded-full shrink-0">
            <HeartHandshake className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-blue-900 dark:text-blue-300 font-bold text-sm md:text-base">
              ¡Nuestra comunidad es un espacio seguro!
            </h3>
            <p className="text-blue-700 dark:text-blue-400/80 text-sm mt-1">
              Recuerda que todas las postulaciones a través de la plataforma son 100% gratuitas. Si alguien te solicita un pago para participar en un proceso de selección, por favor repórtalo inmediatamente.
            </p>
          </div>
        </div>

        {/* Filtros */}
        <JobFilters />

        {/* Resultados */}
        <div className="mt-10">
          <JobList jobs={activeJobs} />
        </div>
      </main>
    </div>
  );
}
