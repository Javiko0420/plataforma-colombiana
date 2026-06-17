import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import { BUSINESS_CATEGORIES, categoryLabel } from '@/lib/constants/categories'
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

const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`

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
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', paddingBottom: '5rem', fontFamily: 'var(--lh-font)' }}>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', height: 'clamp(220px,32vw,320px)', overflow: 'hidden', borderBottom: '1px solid var(--lh-border2)', background: 'var(--lh-surface2)' }}>
        {business.images && business.images.length > 0 ? (
          <>
            <Image src={business.images[0]} alt={`Portada de ${business.name}`} fill style={{ objectFit: 'cover', opacity: 0.6 }} priority />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--lh-bg) 0%, transparent 65%)' }} />
          </>
        ) : (
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
            <span style={{ fontFamily: 'var(--lh-font)', fontSize: 'clamp(40px,9vw,110px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-.04em', color: 'var(--lh-fg3)', opacity: 0.25 }}>
              {categoryLabel(BUSINESS_CATEGORIES, business.category)}
            </span>
          </div>
        )}

        {/* Botón volver */}
        <Link href="/directorio" className="lh-btn lh-btn--sm lh-btn--secondary" style={{ position: 'absolute', top: 20, left: 20, zIndex: 20 }} aria-label="Volver al directorio">
          <ArrowLeft size={16} aria-hidden="true" /> Directorio
        </Link>

        {/* Botón editar (solo dueño) */}
        {session?.user?.id === business.ownerId && (
          <Link href={`/negocio/editar/${business.slug}`} className="lh-btn lh-btn--sm lh-btn--primary" style={{ position: 'absolute', top: 20, right: 20, zIndex: 20 }} aria-label="Editar este negocio">
            <Edit size={16} aria-hidden="true" /> Editar negocio
          </Link>
        )}
      </div>

      {/* ── Cuerpo ── */}
      <div className="lh-container" style={{ marginTop: -64, position: 'relative', zIndex: 10 }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Columna principal ── */}
          <div className="lg:col-span-2">
            <div className="lh-card" style={{ padding: 'clamp(22px,4vw,32px)' }}>
              {/* Encabezado */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4" style={{ marginBottom: 24 }}>
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 11px', borderRadius: 99, background: tint('var(--lh-terra)'), color: 'var(--lh-terra)', fontSize: 12.5, fontWeight: 600 }}>
                      {categoryLabel(BUSINESS_CATEGORIES, business.category)}
                    </span>
                    {business.isVerified && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 99, background: tint('var(--lh-green)'), color: 'var(--lh-green)', fontSize: 12.5, fontWeight: 600 }}>
                        <CheckCircle2 size={12} aria-hidden="true" /> Verificado
                      </span>
                    )}
                  </div>

                  <h1 className="lh-h2" style={{ fontSize: 'clamp(26px,3.6vw,36px)', margin: '0 0 10px' }}>{business.name}</h1>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, marginBottom: 12, color: 'var(--lh-fg2)' }}>
                    <MapPin size={15} style={{ color: 'var(--lh-terra)', flexShrink: 0 }} aria-hidden="true" />
                    <span>{business.city || 'Australia'}{business.state && `, ${business.state}`}</span>
                  </div>

                  {averageRating && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 99, background: tint('var(--lh-warm)'), color: 'var(--lh-warm)' }} aria-label={`Calificación promedio: ${averageRating} de 5`}>
                      <Star size={15} style={{ fill: 'currentColor' }} aria-hidden="true" />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{averageRating}</span>
                      <span style={{ fontSize: 12, opacity: 0.75 }}>({business.reviews.length})</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }} className="md:items-end">
                  <ShareButton title={business.name} text={`Mira este negocio: ${business.name}`} />
                  <ReportBusinessButton businessId={business.id} />
                </div>
              </div>

              <div style={{ height: 1, background: 'var(--lh-border2)', margin: '0 0 24px' }} />

              {/* Descripción */}
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 19, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--lh-fg)', margin: '0 0 14px' }}>Sobre nosotros</h2>
                <p style={{ whiteSpace: 'pre-line', lineHeight: 1.65, fontSize: 15, color: 'var(--lh-fg2)', margin: 0 }}>{business.description}</p>
              </div>

              {/* Galería */}
              {business.images && business.images.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--lh-font)', fontSize: 19, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--lh-fg)', margin: '0 0 14px' }}>
                    <ImageIcon size={18} style={{ color: 'var(--lh-terra)' }} aria-hidden="true" /> Galería
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {business.images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`group ${idx === 0 ? 'col-span-2 row-span-2' : ''}`}
                        style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--lh-border)', height: idx === 0 ? 260 : 124 }}
                      >
                        <Image src={img} alt={`Foto ${idx + 1} de ${business.name}`} fill className="group-hover:scale-105" style={{ objectFit: 'cover', transition: 'transform .5s cubic-bezier(.22,.61,.36,1)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ height: 1, background: 'var(--lh-border2)', margin: '0 0 28px' }} />

              {/* Reseñas */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 20, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--lh-fg)', margin: '0 0 20px' }}>
                    Opiniones ({business.reviews.length})
                  </h2>
                  <ReviewsList reviews={business.reviews} />
                </div>
                <div>
                  <div style={{ position: 'sticky', top: 88 }}>
                    <ReviewForm businessId={business.id} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar de contacto ── */}
          <div>
            <div className="lh-card" style={{ padding: 24, position: 'sticky', top: 88 }}>
              <h3 style={{ fontFamily: 'var(--lh-font)', fontSize: 17, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--lh-fg)', margin: '0 0 18px' }}>
                Contacto directo
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {business.address && (
                  <ContactRow
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address + ', ' + (business.city || 'Australia'))}`}
                    target="_blank"
                    icon={<MapPin size={16} />}
                    label="Dirección"
                    value={business.address}
                    color="var(--lh-terra)"
                    truncate
                  />
                )}

                {business.whatsapp && (
                  <a
                    href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lh-btn lh-btn--md"
                    style={{ width: '100%', background: 'var(--lh-green)', color: '#fff' }}
                    aria-label={`WhatsApp de ${business.name}`}
                  >
                    <MessageCircle size={18} aria-hidden="true" /> WhatsApp
                  </a>
                )}

                {business.phone && (
                  <ContactRow href={`tel:${business.phone}`} icon={<Phone size={16} />} label="Teléfono" value={business.phone} color="var(--lh-accent)" />
                )}

                {business.email && (
                  <ContactRow href={`mailto:${business.email}`} icon={<Mail size={16} />} label="Email" value={business.email} color="var(--lh-accent)" truncate />
                )}

                {business.website && (
                  <ContactRow href={business.website} target="_blank" icon={<Globe size={16} />} label="Sitio web" value={business.website} color="var(--lh-accent)" truncate />
                )}

                {business.instagram && (
                  <ContactRow href={`https://instagram.com/${business.instagram.replace(/^@/, '')}`} target="_blank" icon={<Instagram size={16} />} label="Instagram" value={`@${business.instagram.replace(/^@/, '')}`} color="var(--lh-terra)" />
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
  color,
  truncate = false,
}: {
  href: string
  target?: string
  icon: React.ReactNode
  label: string
  value: string
  color: string
  truncate?: boolean
}) {
  return (
    <a
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 12, borderRadius: 12, border: '1px solid var(--lh-border)', background: 'var(--lh-surface)', textDecoration: 'none', transition: 'background .18s' }}
    >
      <span aria-hidden="true" style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: `color-mix(in oklch, ${color} 14%, transparent)`, color }}>
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'var(--lh-mono)', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--lh-fg3)', margin: 0 }}>{label}</p>
        <p className={truncate ? 'truncate' : ''} style={{ fontSize: 14, fontWeight: 500, color: 'var(--lh-fg)', margin: 0 }}>{value}</p>
      </div>
    </a>
  )
}
