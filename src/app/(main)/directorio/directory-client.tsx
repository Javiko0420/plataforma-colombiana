'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Filter, MapPin, Phone, MessageCircle, Building2, Instagram, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/lh/Card'
import { Button } from '@/components/lh/Button'
import { Reveal } from '@/components/lh/Reveal'
import { EmptyState } from '@/components/lh/EmptyState'
import { BUSINESS_CATEGORIES, categoryLabel } from '@/lib/constants/categories'

interface Business {
  id: string
  name: string
  slug: string
  description: string
  category: string
  city: string | null
  state: string | null
  phone: string
  email: string
  website: string | null
  whatsapp: string | null
  instagram: string | null
  images: string[]
  isVerified: boolean
}

interface DirectoryClientProps {
  initialBusinesses: Business[]
}

const cities = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra']

/** Tinte suave de un color del sistema para chips */
const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`

export default function DirectoryClient({ initialBusinesses }: DirectoryClientProps) {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') ?? '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') ?? '')
  const [selectedCity, setSelectedCity] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filteredBusinesses = initialBusinesses.filter(business => {
    const matchesSearch =
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || business.category === selectedCategory
    const matchesCity = !selectedCity || business.city === selectedCity
    return matchesSearch && matchesCategory && matchesCity
  })

  return (
    <div className="lh-container" style={{ paddingTop: 40, paddingBottom: 80 }}>

      {/* ── Buscador y filtros ── */}
      <Card style={{ padding: 20, marginBottom: 28 }}>
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Barra de búsqueda */}
          <div
            className="flex-1"
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 6px 4px 16px', border: '1px solid var(--lh-border)', borderRadius: 15, background: 'var(--lh-surface2)' }}
          >
            <Search size={18} style={{ color: 'var(--lh-fg3)', flexShrink: 0 }} aria-hidden="true" />
            <label htmlFor="dir-search" className="sr-only">Buscar negocios</label>
            <input
              id="dir-search"
              name="q"
              type="search"
              placeholder="Buscar arepas, contadores, mecánicos…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', color: 'var(--lh-fg)', fontSize: 15.5, fontFamily: 'var(--lh-font)', padding: '11px 0' }}
            />
          </div>

          {/* Selects desktop */}
          <div className="hidden lg:flex gap-3">
            <label htmlFor="dir-cat" className="sr-only">Categoría</label>
            <select
              id="dir-cat"
              className="lh-input"
              style={{ width: 'auto', minWidth: 180 }}
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {BUSINESS_CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
            </select>

            <label htmlFor="dir-city" className="sr-only">Ciudad</label>
            <select
              id="dir-city"
              className="lh-input"
              style={{ width: 'auto', minWidth: 160 }}
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
            >
              <option value="">Todas las ciudades</option>
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>

          {/* Toggle filtros móvil */}
          <Button
            variant="secondary"
            size="sm"
            className="lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="dir-mobile-filters"
          >
            {showFilters ? <X size={16} aria-hidden="true" /> : <Filter size={16} aria-hidden="true" />}
            Filtros
          </Button>
        </div>

        {/* Filtros móvil */}
        {showFilters && (
          <div id="dir-mobile-filters" className="lg:hidden mt-4 pt-4 grid gap-3" style={{ borderTop: '1px solid var(--lh-border2)' }}>
            <label htmlFor="dir-cat-m" className="sr-only">Categoría</label>
            <select
              id="dir-cat-m"
              className="lh-input"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {BUSINESS_CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
            </select>
            <label htmlFor="dir-city-m" className="sr-only">Ciudad</label>
            <select
              id="dir-city-m"
              className="lh-input"
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
            >
              <option value="">Todas las ciudades</option>
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
        )}

        {/* Chips de filtros activos */}
        {(selectedCategory || selectedCity) && (
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <span style={{ fontSize: 12.5, color: 'var(--lh-fg3)' }}>Filtrando por:</span>
            {selectedCategory && (
              <ActiveChip
                label={categoryLabel(BUSINESS_CATEGORIES, selectedCategory)}
                color="var(--lh-terra)"
                onRemove={() => setSelectedCategory('')}
              />
            )}
            {selectedCity && (
              <ActiveChip
                label={selectedCity}
                color="var(--lh-green)"
                onRemove={() => setSelectedCity('')}
              />
            )}
          </div>
        )}
      </Card>

      {/* ── Contador ── */}
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontSize: 14, color: 'var(--lh-fg2)' }}>
          Mostrando{' '}
          <strong style={{ color: 'var(--lh-fg)', fontWeight: 600 }}>{filteredBusinesses.length}</strong>{' '}
          {filteredBusinesses.length === 1 ? 'negocio' : 'negocios'}
        </p>
      </div>

      {/* ── Grid de negocios ── */}
      {filteredBusinesses.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBusinesses.map((business, i) => (
            <Reveal key={business.id} delay={Math.min(i * 40, 240)}>
              <BusinessCard business={business} />
            </Reveal>
          ))}
        </div>
      )}

      {/* ── Estado vacío ── */}
      {filteredBusinesses.length === 0 && (
        <EmptyState
          icon={<Building2 size={26} />}
          title="No encontramos negocios con esa búsqueda"
          description="Intenta cambiar los filtros o sé el primero en registrar un negocio en esta categoría."
          action={
            <Button href="/registrar-negocio" variant="primary" size="md">
              Registra tu negocio gratis
            </Button>
          }
        />
      )}
    </div>
  )
}

/* ─── Chip de filtro activo (removible) ─── */
function ActiveChip({ label, color, onRemove }: { label: string; color: string; onRemove: () => void }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 8px 6px 12px', borderRadius: 99, background: tint(color), color, fontSize: 13, fontWeight: 600 }}>
      {label}
      <button
        onClick={onRemove}
        aria-label={`Quitar filtro ${label}`}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer', padding: 0, width: 18, height: 18, borderRadius: 99 }}
      >
        <X size={13} />
      </button>
    </span>
  )
}

/* ─── Tarjeta de negocio ─── */
function BusinessCard({ business }: { business: Business }) {
  const hasImage = business.images && business.images.length > 0
  const whatsappHref = business.whatsapp ? `https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}` : null

  return (
    <Card interactive style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Imagen / placeholder */}
      <div style={{ position: 'relative', height: 168, overflow: 'hidden', background: 'var(--lh-surface2)' }}>
        {hasImage ? (
          <Image src={business.images[0]} alt={business.name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 1024px) 100vw, 33vw" />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
            <Building2 size={56} style={{ color: 'var(--lh-fg3)', opacity: 0.4 }} />
          </div>
        )}

        {/* Badge verificado */}
        {business.isVerified && (
          <span style={{ position: 'absolute', top: 12, right: 12, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 99, background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(8px)', fontSize: 12, fontWeight: 600, color: '#1f6b3a' }}>
            ✓ Oficial
          </span>
        )}
      </div>

      {/* Contenido */}
      <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div>
          <span style={{ display: 'inline-block', fontSize: 11.5, fontWeight: 600, color: 'var(--lh-accent)', background: tint('var(--lh-accent)'), padding: '3px 9px', borderRadius: 99, marginBottom: 10 }}>
            {categoryLabel(BUSINESS_CATEGORIES, business.category)}
          </span>
          <h2 className="line-clamp-1" style={{ fontFamily: 'var(--lh-font)', fontSize: 17.5, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--lh-fg)', margin: '0 0 6px' }}>
            {business.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--lh-fg2)' }}>
            <MapPin size={14} style={{ flexShrink: 0 }} aria-hidden="true" />
            {business.city || 'Australia'}{business.state ? `, ${business.state}` : ''}
          </div>
        </div>

        <p className="line-clamp-3" style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--lh-fg2)', margin: 0, flex: 1 }}>
          {business.description}
        </p>

        {/* Acciones */}
        <div style={{ display: 'grid', gridTemplateColumns: (whatsappHref || business.phone || business.instagram) ? '1fr 1fr' : '1fr', gap: 8, marginTop: 'auto' }}>
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="lh-btn lh-btn--sm"
              style={{ background: 'var(--lh-green)', color: '#fff' }}
              aria-label={`Contactar a ${business.name} por WhatsApp`}
            >
              <MessageCircle size={15} aria-hidden="true" /> WhatsApp
            </a>
          )}
          {!whatsappHref && business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="lh-btn lh-btn--sm lh-btn--secondary"
              aria-label={`Llamar a ${business.name}`}
            >
              <Phone size={15} aria-hidden="true" /> Llamar
            </a>
          )}
          {!whatsappHref && !business.phone && business.instagram && (
            <a
              href={`https://instagram.com/${business.instagram.replace(/^@/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="lh-btn lh-btn--sm"
              style={{ background: 'var(--lh-terra)', color: '#fff' }}
              aria-label={`Ver Instagram de ${business.name}`}
            >
              <Instagram size={15} aria-hidden="true" /> Instagram
            </a>
          )}
          <Link href={`/negocio/${business.slug}`} className="lh-btn lh-btn--sm lh-btn--secondary">
            Ver perfil →
          </Link>
        </div>
      </div>
    </Card>
  )
}
