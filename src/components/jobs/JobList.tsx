import { JobOffer } from '@prisma/client';
import JobCard from './JobCard';
import Link from 'next/link';
import { SunMotif } from '@/components/lt/SunMotif';
import { LtButton } from '@/components/lt/Button';

export default function JobList({ jobs }: { jobs: JobOffer[] }) {
  if (jobs.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-[var(--lt-radius-lg)] border-[2px] border-dashed border-[var(--lt-ink)]"
        style={{ background: 'var(--lt-paper)' }}
      >
        <div aria-hidden="true" className="mb-5 opacity-30">
          <SunMotif size={72} />
        </div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
        >
          No se encontraron ofertas
        </h3>
        <p
          className="text-sm max-w-md mx-auto mb-6"
          style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
        >
          No hay oportunidades activas con estos filtros en este momento. Intenta con otros criterios de búsqueda o vuelve más tarde.
        </p>
        <Link href="/empleos/publicar">
          <LtButton variant="sticker" tone="verde" size="md" rotate={-1}>
            Publicar una oferta
          </LtButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-max">
      {jobs.map((job, i) => (
        <JobCard key={job.id} job={job} index={i} />
      ))}
    </div>
  );
}
