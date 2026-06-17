import { JobOffer } from '@prisma/client';
import Link from 'next/link';
import { Clock, DollarSign, MapPin, Briefcase, ArrowRight } from 'lucide-react';
import { JOB_CATEGORIES, categoryLabel } from '@/lib/constants/categories';

/** Tinte suave de un color del sistema */
const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`;

const neutralChip: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  fontSize: 12, fontWeight: 600, color: 'var(--lh-fg2)',
  background: 'var(--lh-surface2)', border: '1px solid var(--lh-border2)',
  padding: '5px 10px', borderRadius: 99,
};

export default function JobCard({ job }: { job: JobOffer; index?: number }) {
  const today = new Date();
  const expirationDate = new Date(job.expiresAt);
  const diffDays = Math.ceil(Math.abs(expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Link href={`/empleos/${job.id}`} className="block group" aria-label={`Ver oferta: ${job.title}`} style={{ height: '100%' }}>
      <article className="lh-card lh-card--interactive" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20 }}>
        {/* Cabecera */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <span
            aria-hidden="true"
            style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: tint('var(--lh-green)'), color: 'var(--lh-green)' }}
          >
            <Briefcase size={20} />
          </span>
          <h3 className="line-clamp-2" style={{ fontFamily: 'var(--lh-font)', fontSize: 16.5, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--lh-fg)', lineHeight: 1.25, margin: 0 }}>
            {job.title}
          </h3>
        </div>

        {/* Metadatos */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          <span style={{ ...neutralChip, color: 'var(--lh-green)', background: tint('var(--lh-green)'), border: 'none' }}>
            {categoryLabel(JOB_CATEGORIES, job.category)}
          </span>
          <span style={neutralChip}>{job.jobType}</span>
          <span style={neutralChip}>
            <MapPin size={12} aria-hidden="true" /> {job.location}
          </span>
          {job.hourlyRate != null && (
            <span style={{ ...neutralChip, color: 'var(--lh-warm)', background: tint('var(--lh-warm)'), border: 'none' }}>
              <DollarSign size={12} aria-hidden="true" /> {job.hourlyRate.toFixed(2)}/hr
            </span>
          )}
        </div>

        {/* Descripción */}
        <p className="line-clamp-3" style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--lh-fg2)', margin: '0 0 16px', flex: 1 }}>
          {job.description}
        </p>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--lh-border2)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 500, color: 'var(--lh-fg3)' }} aria-label={`Expira en ${diffDays} días`}>
            <Clock size={14} aria-hidden="true" /> {diffDays}d restantes
          </span>
          <span className="lh-seemore" style={{ fontSize: 13.5, color: 'var(--lh-green)' }}>
            Ver detalles <ArrowRight size={15} />
          </span>
        </div>
      </article>
    </Link>
  );
}
