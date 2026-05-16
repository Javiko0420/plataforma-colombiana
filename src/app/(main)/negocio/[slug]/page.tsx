import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import {
  MapPin, Globe, Phone, Mail, MessageCircle,
  CheckCircle2, ArrowLeft, ImageIcon, Edit, Star,
  ExternalLink, Instagram,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import ShareButton from "@/components/ui/share-button"
import { ReportBusinessButton } from "@/components/ui/report-business-button"
import ReviewForm from "@/components/reviews/review-form"
import ReviewsList from "@/components/reviews/reviews-list"
import { LtBadge } from '@/components/lt/Badge'
import { LtButton } from '@/components/lt/Button'
import { SunMotif } from '@/components/lt/SunMotif'
import { Squiggle } from '@/components/lt/Squiggle'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug
  const business = await prisma.business.findUnique({
    where: { slug },
    select: { name: true, description: true, images: true }
  })
  if (!business) return { title: 'Negocio no encontrado' }
  return {
    title: `${business.name} | Latin Territory`,
    description: business.description.substring(0, 160),
    openGraph: { images: business.images[0] ? [business.images[0]] : [] }
  }
}

export default async function BusinessDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug
  const session = await getServerSession(authOptions)

  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      owner: { select: { name: true, image: true } },
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!business) notFound()

  const averageRating = business.reviews.length
    ? (business.reviews.reduce((acc, r) => acc + r.rating, 0) / business.reviews.length).toFixed(1)
    : null

  return (
    <div style={{ background: 'var(--lt-bg)', minHeight: '100vh', paddingBottom: '5rem' }}>

      {/* ── HERO ── */}
      <div
        className="relative h-56 md:h-80 overflow-hidden border-b-[2px] border-[var(--lt-ink)]"
        style={{ background: 'var(--lt-paper)' }}
      >
        {business.images && business.images.length > 0 ? (
          <>
            <Image
              src={business.images[0]}
              alt={`Portada de ${business.name}`}
              fill
              className="object-cover opacity-50 scale-105"
              priority
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--lt-ink) 0%, transparent 60%)' }} />
          </>
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: 'var(--lt-bg)' }} />
            <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center opacity-10">
              <SunMotif size={280} />
            </div>
          </>
        )}

        {/* Nombre como watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <span
            className="text-5xl md:text-8xl font-black uppercase tracking-tighter select-none truncate max-w-4xl px-4 opacity-[0.07]"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            {business.category}
          </span>
        </div>

        {/* Botón volver */}
        <Link
          href="/directorio"
          className="absolute top-5 left-5 z-20 flex items-center gap-2 px-4 py-2 rounded-[var(--lt-radius-pill)] border-[1.6px] border-[var(--lt-ink)] text-sm font-semibold transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--lt-terracota)]"
          style={{ background: 'var(--lt-paper)', color: 'var(--lt-ink)', boxShadow: 'var(--lt-shadow-sticker)' }}
          aria-label="Volver al directorio"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Directorio
        </Link>

        {/* Botón editar (solo dueño) */}
        {session?.user?.id === business.ownerId && (
          <Link
            href={`/negocio/editar/${business.slug}`}
            className="absolute top-5 right-5 z-20 flex items-center gap-2 px-4 py-2 rounded-[var(--lt-radius-pill)] border-[1.6px] border-[var(--lt-ink)] text-sm font-semibold transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--lt-sun)]"
            style={{ background: 'var(--lt-sun)', color: 'var(--lt-ink)', boxShadow: 'var(--lt-shadow-sticker)' }}
            aria-label="Editar este negocio"
          >
            <Edit className="w-4 h-4" aria-hidden="true" />
            Editar Negocio
          </Link>
        )}
      </div>

      {/* ── Cuerpo ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Columna principal ── */}
          <div className="lg:col-span-2 space-y-8">
            <div
              className="rounded-[var(--lt-radius-lg)] border-[2.2px] border-[var(--lt-ink)] p-6 md:p-8"
              style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker-lg)' }}
            >
              {/* Encabezado */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <LtBadge tone="terracota" rotate={-1}>{business.category}</LtBadge>
                    {business.isVerified && (
                      <LtBadge tone="verde" rotate={1}>
                        <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Verificado
                      </LtBadge>
                    )}
                  </div>

                  <h1
                    className="text-3xl md:text-4xl font-black mb-2"
                    style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                  >
                    {business.name}
                  </h1>

                  <div className="flex items-center gap-2 text-sm mb-3" style={{ color: 'var(--lt-ink-soft)' }}>
                    <MapPin className="w-4 h-4 shrink-0" style={{ color: 'var(--lt-terracota)' }} aria-hidden="true" />
                    <span>{business.city || 'Australia'}{business.state && `, ${business.state}`}</span>
                  </div>

                  {averageRating && (
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--lt-radius-pill)] border-[1.6px] border-[var(--lt-ink)]"
                      style={{ background: 'var(--lt-sun)', color: 'var(--lt-ink)', boxShadow: '2px 2px 0 var(--lt-ink)' }}
                      aria-label={`Calificación promedio: ${averageRating} de 5`}
                    >
                      <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                      <span className="font-bold text-sm">{averageRating}</span>
                      <span className="text-xs opacity-70">({business.reviews.length})</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-start md:items-end gap-2">
                  <ShareButton title={business.name} text={`Mira este negocio: ${business.name}`} />
                  <ReportBusinessButton businessId={business.id} />
                </div>
              </div>

              <Squiggle width={200} height={10} color="var(--lt-terracota)" amplitude={3} className="mb-6" aria-hidden="true" />

              {/* Descripción */}
              <div className="mb-8">
                <h2
                  className="text-xl font-bold mb-4"
                  style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                >
                  Sobre nosotros
                </h2>
                <p
                  className="whitespace-pre-line leading-relaxed"
                  style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
                >
                  {business.description}
                </p>
              </div>

              {/* Galería */}
              {business.images && business.images.length > 0 && (
                <div className="mb-8">
                  <h2
                    className="text-xl font-bold mb-4 flex items-center gap-2"
                    style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                  >
                    <ImageIcon className="w-5 h-5" style={{ color: 'var(--lt-terracota)' }} aria-hidden="true" />
                    Galería
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {business.images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-[var(--lt-radius-sm)] overflow-hidden border-[2px] border-[var(--lt-ink)] group cursor-pointer ${idx === 0 ? 'col-span-2 row-span-2 h-64 md:h-auto' : 'h-32'}`}
                        style={{ boxShadow: 'var(--lt-shadow-sticker)' }}
                      >
                        <Image
                          src={img}
                          alt={`Foto ${idx + 1} de ${business.name}`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Squiggle width={200} height={10} color="var(--lt-sun)" amplitude={3} className="mb-8" aria-hidden="true" />

              {/* Reseñas */}
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <h2
                    className="text-2xl font-bold mb-6"
                    style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                  >
                    Opiniones ({business.reviews.length})
                  </h2>
                  <ReviewsList reviews={business.reviews} />
                </div>
                <div>
                  <div className="sticky top-24">
                    <ReviewForm businessId={business.id} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar de contacto ── */}
          <div>
            <div
              className="rounded-[var(--lt-radius-lg)] border-[2.2px] border-[var(--lt-ink)] p-6 sticky top-24"
              style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker-lg)' }}
            >
              <h3
                className="text-lg font-bold mb-5"
                style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
              >
                Contacto Directo
              </h3>

              <div className="space-y-3">
                {business.address && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address + ', ' + (business.city || 'Australia'))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] transition-all hover:-translate-y-0.5 group"
                    style={{ background: 'var(--lt-bg)', boxShadow: 'var(--lt-shadow-sticker)' }}
                    aria-label="Abrir dirección en Google Maps"
                  >
                    <div
                      className="w-9 h-9 flex items-center justify-center rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] shrink-0 group-hover:scale-110 transition-transform"
                      style={{ background: 'var(--lt-terracota)', color: 'var(--lt-paper)' }}
                      aria-hidden="true"
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--lt-ink-soft)' }}>Dirección</p>
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--lt-ink)' }}>{business.address}</p>
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--lt-terracota)' }}>
                        Abrir mapa <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </span>
                    </div>
                  </a>
                )}

                {business.whatsapp && (
                  <a
                    href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] font-bold text-sm transition-all hover:-translate-y-0.5"
                    style={{ background: 'var(--lt-verde)', color: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
                    aria-label={`WhatsApp de ${business.name}`}
                  >
                    <MessageCircle className="w-5 h-5" aria-hidden="true" />
                    WhatsApp
                  </a>
                )}

                {business.phone && (
                  <ContactRow
                    href={`tel:${business.phone}`}
                    icon={<Phone className="w-4 h-4" />}
                    label="Teléfono"
                    value={business.phone}
                    tone="sun"
                  />
                )}

                {business.email && (
                  <ContactRow
                    href={`mailto:${business.email}`}
                    icon={<Mail className="w-4 h-4" />}
                    label="Email"
                    value={business.email}
                    tone="sun"
                  />
                )}

                {business.website && (
                  <ContactRow
                    href={business.website}
                    target="_blank"
                    icon={<Globe className="w-4 h-4" />}
                    label="Sitio Web"
                    value={business.website}
                    tone="sun"
                    truncate
                  />
                )}

                {business.instagram && (
                  <ContactRow
                    href={`https://instagram.com/${business.instagram.replace(/^@/, '')}`}
                    target="_blank"
                    icon={<Instagram className="w-4 h-4" />}
                    label="Instagram"
                    value={`@${business.instagram.replace(/^@/, '')}`}
                    tone="accent"
                  />
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Sub-componente de fila de contacto
───────────────────────────────────────── */
function ContactRow({
  href,
  target,
  icon,
  label,
  value,
  tone,
  truncate = false,
}: {
  href: string
  target?: string
  icon: React.ReactNode
  label: string
  value: string
  tone: 'sun' | 'accent'
  truncate?: boolean
}) {
  const bg = tone === 'sun' ? 'var(--lt-sun)' : 'var(--lt-accent)'
  const iconColor = tone === 'sun' ? 'var(--lt-ink)' : 'var(--lt-paper)'

  return (
    <a
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      className="flex items-center gap-3 p-3 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] transition-all hover:-translate-y-0.5 group"
      style={{ background: 'var(--lt-bg)', boxShadow: 'var(--lt-shadow-sticker)' }}
    >
      <div
        className="w-9 h-9 flex items-center justify-center rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] shrink-0 group-hover:scale-110 transition-transform"
        style={{ background: bg, color: iconColor }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--lt-ink-soft)' }}>{label}</p>
        <p className={`text-sm font-medium ${truncate ? 'truncate' : ''}`} style={{ color: 'var(--lt-ink)' }}>{value}</p>
      </div>
    </a>
  )
}
