import { prisma } from '@/lib/prisma';
import JobFilters from '@/components/jobs/JobFilters';
import JobList from '@/components/jobs/JobList';
import { HeartHandshake } from 'lucide-react';
import { SunMotif } from '@/components/lt/SunMotif';
import { LeafSprig } from '@/components/lt/LeafSprig';
import { HandDrawnUnderline } from '@/components/lt/HandDrawnUnderline';

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
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ background: 'var(--lt-bg)', minHeight: '100vh', paddingBottom: '4rem' }}>

      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden border-b-[2px] border-[var(--lt-ink)] py-16 px-4"
        style={{ background: 'var(--lt-paper)' }}
      >
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
          <SunMotif size={300} className="absolute opacity-[0.07]" style={{ top: '-50px', right: '-30px' }} />
          <LeafSprig size={100} className="absolute opacity-20" style={{ bottom: '10px', left: '16px', transform: 'rotate(-18deg)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto text-center space-y-4">
          <h1
            className="text-4xl md:text-5xl font-black tracking-tight"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            Muro de <em style={{ color: 'var(--lt-terracota)', fontStyle: 'italic' }}>Empleos</em>
          </h1>
          <div className="flex justify-center" aria-hidden="true">
            <HandDrawnUnderline width={220} color="var(--lt-sun-core)" thickness={3} />
          </div>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
          >
            Encuentra tu próxima oportunidad profesional en Australia o publica vacantes para hacer crecer tu equipo.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        {/* ── Banner de seguridad ── */}
        <div
          className="mb-8 flex items-start sm:items-center gap-4 p-5 rounded-[var(--lt-radius-md)] border-[2px] border-[var(--lt-ink)]"
          style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
          role="note"
          aria-label="Aviso de seguridad de la comunidad"
        >
          <div
            className="p-2 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] shrink-0"
            style={{ background: 'var(--lt-verde)', color: 'var(--lt-paper)', boxShadow: '2px 2px 0 var(--lt-ink)' }}
            aria-hidden="true"
          >
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h3
              className="font-bold text-sm md:text-base mb-1"
              style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
            >
              ¡Nuestra comunidad es un espacio seguro!
            </h3>
            <p className="text-sm" style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}>
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
