import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Briefcase, MapPin, Clock, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import JobDetailActions from '@/components/jobs/JobDetailActions';
import { LtBadge } from '@/components/lt/Badge';
import { SunMotif } from '@/components/lt/SunMotif';
import { Squiggle } from '@/components/lt/Squiggle';
import { HandDrawnUnderline } from '@/components/lt/HandDrawnUnderline';

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
    <div style={{ background: 'var(--lt-bg)', minHeight: '100vh', paddingBottom: '5rem', paddingTop: '2rem' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Botón volver */}
        <Link
          href="/empleos"
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-[var(--lt-radius-pill)] border-[1.6px] border-[var(--lt-ink)] text-sm font-semibold transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--lt-terracota)]"
          style={{ background: 'var(--lt-paper)', color: 'var(--lt-ink)', boxShadow: 'var(--lt-shadow-sticker)' }}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Empleos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Columna principal ── */}
          <div className="lg:col-span-2 space-y-6">
            <div
              className="rounded-[var(--lt-radius-lg)] border-[2.2px] border-[var(--lt-ink)] p-6 md:p-8"
              style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker-lg)' }}
            >
              {/* Encabezado */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-14 h-14 rounded-[var(--lt-radius-sm)] flex items-center justify-center border-[2px] border-[var(--lt-ink)] shrink-0"
                  style={{ background: 'var(--lt-verde)', color: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
                  aria-hidden="true"
                >
                  <Briefcase className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1
                    className="text-2xl md:text-3xl font-black leading-tight"
                    style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                  >
                    {job.title}
                  </h1>
                </div>
              </div>
              <HandDrawnUnderline width={200} color="var(--lt-sun-core)" thickness={2.5} className="mb-6" aria-hidden="true" />

              {/* Badges de metadatos */}
              <div className="flex flex-wrap gap-2 mb-8">
                <LtBadge tone="terracota" rotate={-1}>
                  <Briefcase className="w-3 h-3" aria-hidden="true" />
                  {job.category}
                </LtBadge>
                <LtBadge tone="neutral" rotate={0.8}>
                  <MapPin className="w-3 h-3" aria-hidden="true" />
                  {job.location}
                </LtBadge>
                <LtBadge tone="neutral" rotate={-0.5}>
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  {job.jobType}
                </LtBadge>
                <LtBadge tone="neutral" rotate={1}>
                  <Calendar className="w-3 h-3" aria-hidden="true" />
                  {postedDate}
                </LtBadge>
                {job.hourlyRate != null && (
                  <LtBadge tone="sun" rotate={-1.2}>
                    <DollarSign className="w-3 h-3" aria-hidden="true" />
                    {job.hourlyRate.toFixed(2)} AUD/hora
                  </LtBadge>
                )}
              </div>

              <Squiggle width={160} height={10} color="var(--lt-terracota)" amplitude={3} className="mb-6" aria-hidden="true" />

              {/* Descripción del puesto */}
              <div>
                <h2
                  className="text-xl font-bold mb-4"
                  style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                >
                  Descripción del Puesto
                </h2>
                <div
                  className="leading-relaxed whitespace-pre-wrap"
                  style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
                >
                  {job.description}
                </div>
              </div>
            </div>

            {/* Mensaje de confianza */}
            <div
              className="rounded-[var(--lt-radius-md)] border-[1.6px] border-[var(--lt-ink)] p-5 text-center relative overflow-hidden"
              style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
              role="note"
            >
              <div aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.07]">
                <SunMotif size={80} />
              </div>
              <p
                className="text-sm relative"
                style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
              >
                Al postularte, recuerda mencionar que encontraste esta oferta a través de la comunidad de{' '}
                <strong style={{ color: 'var(--lt-ink)' }}>Latin Territory</strong>. ¡Mucho éxito en tu proceso!
              </p>
            </div>
          </div>

          {/* ── Sidebar de acciones ── */}
          <div className="lg:col-span-1 relative">
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
