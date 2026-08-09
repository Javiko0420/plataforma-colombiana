import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin, Building2, Sparkles } from 'lucide-react'
import { BUSINESS_CATEGORIES, categoryLabel } from '@/lib/constants/categories'
import { getHomeBusinesses, type HomeBusiness } from '@/lib/home-data'
import { logger } from '@/lib/logger'

/*
 * Server Component: los datos llegan en el HTML inicial (SEO + sin pop-in).
 * El hover de las tarjetas es CSS (.lh-hover-lift, definido en el <style>
 * scoped del home) — no necesita hidratación.
 */

const chip = (v: string) => `color-mix(in oklch,${v} 14%,transparent)`
const isPaid = (plan: HomeBusiness['plan']) => plan === 'PREMIUM' || plan === 'SPONSOR'

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))',
  gap: 18,
}

/* ─── Sección completa (async server): datos cacheados 5 min ─── */
export async function FeaturedBusinesses() {
  let businesses: HomeBusiness[]
  try {
    businesses = await getHomeBusinesses()
  } catch (error) {
    logger.error('Error loading home featured businesses', { error })
    return (
      <p style={{ fontSize: 14.5, color: 'var(--lh-fg2)', padding: '8px 2px' }}>
        No pudimos cargar los negocios en este momento. Intenta recargar la página.
      </p>
    )
  }

  // Vacío (aún no hay negocios registrados)
  if (businesses.length === 0) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center', borderRadius: 20, background: 'var(--lh-surface)', border: '1px solid var(--lh-border)' }}>
        <Building2 size={30} style={{ color: 'var(--lh-fg3)', opacity: 0.5 }} aria-hidden="true" />
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--lh-fg)', margin: '12px 0 4px' }}>
          Todavía no hay negocios destacados
        </p>
        <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: '0 0 18px' }}>
          Sé el primero en aparecer aquí y conecta con la comunidad latina.
        </p>
        <Link
          href="/registrar-negocio"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 12, background: 'var(--lh-accent)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}
        >
          Registra tu negocio gratis
        </Link>
      </div>
    )
  }

  return (
    <div style={gridStyle}>
      {businesses.map(business => <BusinessCard key={business.id} business={business} />)}
    </div>
  )
}

/* ─── Tarjeta de negocio destacado ─── */
function BusinessCard({ business }: { business: HomeBusiness }) {
  const hasImage = business.images && business.images.length > 0
  const paid = isPaid(business.plan)

  return (
    <Link
      href={`/negocio/${business.slug}`}
      className="lh-hover-lift"
      style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--lh-surface)', border: '1px solid var(--lh-border)', textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
    >
      {/* Imagen / placeholder */}
      <div style={{ position: 'relative', height: 148, background: 'var(--lh-surface2)', overflow: 'hidden' }}>
        {hasImage ? (
          <Image src={business.images[0]} alt={business.name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 1024px) 100vw, 25vw" />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
            <Building2 size={48} style={{ color: 'var(--lh-fg3)', opacity: 0.4 }} />
          </div>
        )}

        {/* Badge "Destacado" (slots comerciales) */}
        {paid && (
          <span style={{ position: 'absolute', top: 12, left: 12, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 99, background: 'var(--lh-accent)', color: '#fff', fontSize: 11.5, fontWeight: 600, boxShadow: '0 6px 16px -6px var(--lh-accent)' }}>
            <Sparkles size={12} /> Destacado
          </span>
        )}

        {/* Rating real (solo si tiene reseñas) */}
        {business.rating !== null && (
          <span style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 99, background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(8px)', fontSize: 12.5, fontWeight: 600, color: '#181B21' }}>
            <Star size={11} fill="#D4A24C" stroke="#D4A24C" /> {business.rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Contenido */}
      <div style={{ padding: '18px 18px 20px' }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--lh-accent)', background: chip('var(--lh-accent)'), padding: '3px 9px', borderRadius: 99, display: 'inline-block', marginBottom: 9 }}>
          {categoryLabel(BUSINESS_CATEGORIES, business.category)}
        </span>
        <h3 className="line-clamp-1" style={{ fontSize: 17.5, fontWeight: 600, letterSpacing: '-.015em', margin: '0 0 6px', fontFamily: 'var(--lh-font)', color: 'var(--lh-fg)' }}>
          {business.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--lh-fg2)', fontSize: 13.5 }}>
          <MapPin size={14} style={{ flexShrink: 0 }} aria-hidden="true" />
          {business.city || 'Australia'}{business.state ? `, ${business.state}` : ''}
        </div>
      </div>
    </Link>
  )
}

/* ─── Skeleton (fallback de Suspense) ─── */
export function FeaturedBusinessesSkeleton() {
  return (
    <div style={gridStyle}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} aria-hidden="true" style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--lh-surface)', border: '1px solid var(--lh-border)' }}>
          <div style={{ height: 148, background: 'var(--lh-surface2)' }} />
          <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: 9 }}>
            <div style={{ width: 80, height: 18, borderRadius: 99, background: 'var(--lh-surface2)' }} />
            <div style={{ width: '70%', height: 18, borderRadius: 6, background: 'var(--lh-surface2)' }} />
            <div style={{ width: '50%', height: 14, borderRadius: 6, background: 'var(--lh-surface2)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
