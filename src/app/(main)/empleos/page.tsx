import { prisma } from '@/lib/prisma';
import JobFilters from '@/components/jobs/JobFilters';
import JobList from '@/components/jobs/JobList';
import { HeartHandshake } from 'lucide-react';
import { PageHeader } from '@/components/lh/PageHeader';

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
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', paddingBottom: '4rem', fontFamily: 'var(--lh-font)' }}>

      <PageHeader
        eyebrow="Oportunidades"
        title="Muro de empleos"
        subtitle="Encuentra tu próxima oportunidad profesional en Australia o publica vacantes para hacer crecer tu equipo."
        accent="var(--lh-green)"
      />

      <main className="lh-container" style={{ paddingTop: 40 }}>

        {/* ── Banner de seguridad ── */}
        <div
          role="note"
          aria-label="Aviso de seguridad de la comunidad"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 14,
            padding: '16px 18px', marginBottom: 28,
            borderRadius: 16,
            background: 'color-mix(in oklch, var(--lh-green) 8%, var(--lh-surface))',
            border: '1px solid color-mix(in oklch, var(--lh-green) 22%, transparent)',
          }}
        >
          <span
            aria-hidden="true"
            style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--lh-green)', color: '#fff' }}
          >
            <HeartHandshake size={20} />
          </span>
          <div>
            <h3 style={{ fontFamily: 'var(--lh-font)', fontSize: 15, fontWeight: 600, color: 'var(--lh-fg)', margin: '0 0 3px' }}>
              Nuestra comunidad es un espacio seguro
            </h3>
            <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--lh-fg2)', margin: 0 }}>
              Todas las postulaciones a través de la plataforma son 100% gratuitas. Si alguien te solicita un pago para participar en un proceso de selección, repórtalo de inmediato.
            </p>
          </div>
        </div>

        {/* Filtros */}
        <JobFilters />

        {/* Resultados */}
        <div style={{ marginTop: 32 }}>
          <JobList jobs={activeJobs} />
        </div>
      </main>
    </div>
  );
}
