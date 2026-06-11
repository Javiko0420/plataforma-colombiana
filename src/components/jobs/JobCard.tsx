import { JobOffer } from '@prisma/client';
import Link from 'next/link';
import { Clock, DollarSign, MapPin, Briefcase } from 'lucide-react';
import { LtBadge } from '@/components/lt/Badge';
import { JOB_CATEGORIES, categoryLabel } from '@/lib/constants/categories';

const CARD_ROTATIONS = [-1.5, 1.2, -0.8, 1.5, -1.2, 0.9, -1.4, 1.1];

export default function JobCard({ job, index = 0 }: { job: JobOffer; index?: number }) {
  const today = new Date();
  const expirationDate = new Date(job.expiresAt);
  const diffDays = Math.ceil(Math.abs(expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const rotation = CARD_ROTATIONS[index % CARD_ROTATIONS.length];

  return (
    <Link href={`/empleos/${job.id}`} className="block group" aria-label={`Ver oferta: ${job.title}`}>
      <article
        className="flex flex-col h-full rounded-[var(--lt-radius-md)] border-[2.2px] border-[var(--lt-ink)] overflow-hidden transition-all duration-200 group-hover:-translate-y-1"
        style={{
          background: 'var(--lt-paper)',
          boxShadow: 'var(--lt-shadow-sticker-lg)',
          transform: `rotate(${rotation}deg)`,
        }}
        data-lt-rotate="true"
      >
        {/* Cabecera con icono sticker */}
        <div
          className="flex items-center gap-3 px-5 py-4 border-b-[2px] border-[var(--lt-ink)]"
          style={{ background: 'var(--lt-bg)' }}
        >
          <div
            className="w-10 h-10 flex items-center justify-center rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] shrink-0"
            style={{ background: 'var(--lt-verde)', color: 'var(--lt-paper)', boxShadow: '2px 2px 0 var(--lt-ink)' }}
            aria-hidden="true"
          >
            <Briefcase className="w-5 h-5" />
          </div>
          <h3
            className="text-base font-bold leading-tight group-hover:text-[var(--lt-terracota)] transition-colors line-clamp-2 flex-1"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            {job.title}
          </h3>
        </div>

        {/* Cuerpo */}
        <div className="p-5 flex flex-col flex-1 gap-3">
          {/* Badges de metadatos */}
          <div className="flex flex-wrap gap-1.5">
            <LtBadge tone="terracota" rotate={-1}>{categoryLabel(JOB_CATEGORIES, job.category)}</LtBadge>
            <LtBadge tone="neutral" rotate={0.8}>{job.jobType}</LtBadge>
            <LtBadge tone="neutral" rotate={-0.5}>
              <MapPin className="w-3 h-3" aria-hidden="true" />
              {job.location}
            </LtBadge>
            {job.hourlyRate != null && (
              <LtBadge tone="sun" rotate={1}>
                <DollarSign className="w-3 h-3" aria-hidden="true" />
                {job.hourlyRate.toFixed(2)}/hr
              </LtBadge>
            )}
          </div>

          {/* Descripción */}
          <p
            className="text-sm leading-relaxed line-clamp-3 flex-1"
            style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
          >
            {job.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t-[1.6px] border-[var(--lt-ink)]/20">
            <span
              className="inline-flex items-center gap-1 text-xs font-medium"
              style={{ color: 'var(--lt-ink-soft)' }}
              aria-label={`Expira en ${diffDays} días`}
            >
              <Clock className="w-3.5 h-3.5" aria-hidden="true" style={{ color: 'var(--lt-sun-core)' }} />
              {diffDays}d restantes
            </span>
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] transition-all group-hover:-translate-y-0.5"
              style={{
                background: 'var(--lt-verde)',
                color: 'var(--lt-paper)',
                boxShadow: 'var(--lt-shadow-sticker)',
              }}
            >
              Ver detalles →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
