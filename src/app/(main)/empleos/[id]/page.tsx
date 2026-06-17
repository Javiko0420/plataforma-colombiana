import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { JOB_CATEGORIES, categoryLabel } from '@/lib/constants/categories';
import { Briefcase, MapPin, Clock, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import JobDetailActions from '@/components/jobs/JobDetailActions';

const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`;

const neutralChip: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  fontSize: 12.5, fontWeight: 600, color: 'var(--lh-fg2)',
  background: 'var(--lh-surface2)', border: '1px solid var(--lh-border2)',
  padding: '6px 11px', borderRadius: 99,
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const job = await prisma.jobOffer.findUnique({ where: { id } });

  if (!job || job.deletedAt !== null || job.expiresAt < new Date()) {
    return {
      title: 'Oferta no disponible | Latin Territory',
      description: 'Esta oferta de empleo ya no se encuentra disponible en nuestra plataforma.',
    };
  }

  const shortDescription = job.description.length > 150
    ? `${job.description.substring(0, 150)}...`
    : job.description;

  const pageTitle = `${job.title} en Latin Territory`;

  return {
    title: pageTitle,
    description: shortDescription,
    openGraph: {
      title: pageTitle,
      description: shortDescription,
      url: `https://tudominio.com/empleos/${job.id}`,
      siteName: 'Latin Territory',
      locale: 'es_ES',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: shortDescription,
    },
  };
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.jobOffer.findUnique({ where: { id } });

  if (!job || job.deletedAt !== null || job.expiresAt < new Date()) {
    notFound();
  }

  const postedDate = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date(job.createdAt));

  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', paddingBottom: '5rem', paddingTop: '2rem', fontFamily: 'var(--lh-font)' }}>
      <div className="lh-container" style={{ maxWidth: 1100 }}>

        {/* Botón volver */}
        <Link href="/empleos" className="lh-btn lh-btn--sm lh-btn--secondary" style={{ marginBottom: 28 }}>
          <ArrowLeft size={16} aria-hidden="true" /> Empleos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Columna principal ── */}
          <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="lh-card" style={{ padding: 'clamp(22px,4vw,32px)' }}>
              {/* Encabezado */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <span
                  aria-hidden="true"
                  style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 15, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: tint('var(--lh-green)'), color: 'var(--lh-green)' }}
                >
                  <Briefcase size={26} />
                </span>
                <h1 className="lh-h2" style={{ fontSize: 'clamp(24px,3.4vw,34px)', margin: 0 }}>{job.title}</h1>
              </div>

              {/* Metadatos */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                <span style={{ ...neutralChip, color: 'var(--lh-green)', background: tint('var(--lh-green)'), border: 'none' }}>
                  <Briefcase size={12} aria-hidden="true" /> {categoryLabel(JOB_CATEGORIES, job.category)}
                </span>
                <span style={neutralChip}><MapPin size={12} aria-hidden="true" /> {job.location}</span>
                <span style={neutralChip}><Clock size={12} aria-hidden="true" /> {job.jobType}</span>
                <span style={neutralChip}><Calendar size={12} aria-hidden="true" /> {postedDate}</span>
                {job.hourlyRate != null && (
                  <span style={{ ...neutralChip, color: 'var(--lh-warm)', background: tint('var(--lh-warm)'), border: 'none' }}>
                    <DollarSign size={12} aria-hidden="true" /> {job.hourlyRate.toFixed(2)} AUD/hora
                  </span>
                )}
              </div>

              {/* Descripción del puesto */}
              <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 19, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--lh-fg)', margin: '0 0 14px' }}>
                Descripción del puesto
              </h2>
              <div style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--lh-fg2)', whiteSpace: 'pre-wrap' }}>
                {job.description}
              </div>
            </div>

            {/* Mensaje de confianza */}
            <div
              role="note"
              style={{ borderRadius: 16, border: '1px solid var(--lh-border)', background: 'var(--lh-surface)', padding: '18px 20px', textAlign: 'center' }}
            >
              <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--lh-fg2)', margin: 0 }}>
                Al postularte, menciona que encontraste esta oferta en la comunidad de{' '}
                <strong style={{ color: 'var(--lh-fg)', fontWeight: 600 }}>Latin Territory</strong>. ¡Mucho éxito en tu proceso!
              </p>
            </div>
          </div>

          {/* ── Sidebar de acciones ── */}
          <div className="lg:col-span-1">
            <JobDetailActions
              job={{
                id: job.id,
                title: job.title,
                email: job.email,
                phone: job.phone,
                externalLink: job.externalLink,
                expiresAt: job.expiresAt,
              }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
