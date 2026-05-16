'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Filter, MapPin, Phone, MessageCircle, Building2, Instagram, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { LtBadge } from '@/components/lt/Badge'
import { LtButton } from '@/components/lt/Button'
import { HandDrawnBox } from '@/components/lt/HandDrawnBox'
import { SunMotif } from '@/components/lt/SunMotif'
import { cn } from '@/lib/utils'

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

const categories = [
  'Gastronomía', 'Servicios', 'Salud', 'Construcción',
  'Educación', 'Tecnología', 'Artesanías', 'Otros'
]

const cities = [
  'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra'
]

const CARD_ROTATIONS = [-1.5, 1.2, -0.8, 1.5, -1.2, 0.9, -1.4, 1.1]

export default function DirectoryClient({ initialBusinesses }: DirectoryClientProps) {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Buscador y filtros ── */}
      <HandDrawnBox padding="1.25rem" className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Barra de búsqueda */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
              aria-hidden="true"
              style={{ color: 'var(--lt-ink-soft)' }}
            />
            <label htmlFor="dir-search" className="sr-only">Buscar negocios</label>
            <input
              id="dir-search"
              name="q"
              type="search"
              placeholder="Buscar arepas, contadores, mecánicos…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] bg-[var(--lt-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--lt-terracota)] transition-all"
              style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink)' }}
            />
          </div>

          {/* Selects desktop */}
          <div className="hidden lg:flex gap-3">
            <label htmlFor="dir-cat" className="sr-only">Categoría</label>
            <select
              id="dir-cat"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] bg-[var(--lt-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--lt-terracota)] cursor-pointer"
              style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink)' }}
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <label htmlFor="dir-city" className="sr-only">Ciudad</label>
            <select
              id="dir-city"
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="px-4 py-3 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] bg-[var(--lt-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--lt-terracota)] cursor-pointer"
              style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink)' }}
            >
              <option value="">Todas las ciudades</option>
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>

          {/* Toggle filtros móvil */}
          <LtButton
            variant="outline"
            tone="ink"
            size="sm"
            iconLeft={showFilters ? <X className="h-4 w-4" aria-hidden="true" /> : <Filter className="h-4 w-4" aria-hidden="true" />}
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
            aria-expanded={showFilters}
            aria-controls="dir-mobile-filters"
          >
            Filtros
          </LtButton>
        </div>

        {/* Filtros móvil */}
        {showFilters && (
          <div id="dir-mobile-filters" className="lg:hidden mt-4 pt-4 border-t-[1.6px] border-[var(--lt-ink)]/30 grid gap-4">
            <label htmlFor="dir-cat-m" className="sr-only">Categoría</label>
            <select
              id="dir-cat-m"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] bg-[var(--lt-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--lt-terracota)]"
              style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink)' }}
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <label htmlFor="dir-city-m" className="sr-only">Ciudad</label>
            <select
              id="dir-city-m"
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="w-full px-4 py-3 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] bg-[var(--lt-bg)] text-sm outline-none focus:ring-2 focus:ring-[var(--lt-terracota)]"
              style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink)' }}
            >
              <option value="">Todas las ciudades</option>
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
        )}

        {/* Chips de categoría activos */}
        {(selectedCategory || selectedCity) && (
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <span className="text-xs" style={{ color: 'var(--lt-ink-soft)' }}>Filtrando por:</span>
            {selectedCategory && (
              <LtBadge tone="terracota" rotate={-1}>
                {selectedCategory}
                <button onClick={() => setSelectedCategory('')} aria-label={`Quitar filtro ${selectedCategory}`} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </LtBadge>
            )}
            {selectedCity && (
              <LtBadge tone="verde" rotate={1}>
                {selectedCity}
                <button onClick={() => setSelectedCity('')} aria-label={`Quitar filtro ${selectedCity}`} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </LtBadge>
            )}
          </div>
        )}
      </HandDrawnBox>

      {/* ── Contador ── */}
      <div className="mb-6">
        <p className="text-sm" style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}>
          Mostrando{' '}
          <strong style={{ color: 'var(--lt-ink)', fontFamily: 'var(--lt-font-serif)' }}>
            {filteredBusinesses.length}
          </strong>{' '}
          territorios latinos
        </p>
      </div>

      {/* ── Grid de negocios ── */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBusinesses.map((business, i) => {
          const rotation = CARD_ROTATIONS[i % CARD_ROTATIONS.length]
          return (
            <article
              key={business.id}
              className="group flex flex-col rounded-[var(--lt-radius-md)] border-[2.2px] border-[var(--lt-ink)] overflow-hidden transition-all duration-200 hover:-translate-y-1"
              style={{
                background: 'var(--lt-paper)',
                boxShadow: 'var(--lt-shadow-sticker-lg)',
                transform: `rotate(${rotation}deg)`,
              }}
              data-lt-rotate="true"
            >
              {/* Imagen / Placeholder */}
              <div className="relative h-48 overflow-hidden border-b-[2px] border-[var(--lt-ink)]">
                {business.images && business.images.length > 0 ? (
                  <Image
                    src={business.images[0]}
                    alt={business.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'var(--lt-bg)' }}
                    aria-hidden="true"
                  >
                    <Building2
                      className="w-16 h-16 group-hover:scale-110 transition-transform duration-500"
                      style={{ color: 'var(--lt-ink)', opacity: 0.15 }}
                    />
                  </div>
                )}

                {/* Badge verificado */}
                {business.isVerified && (
                  <div className="absolute top-3 right-3 z-10">
                    <LtBadge tone="verde" rotate={-1}>✓ Oficial</LtBadge>
                  </div>
                )}

                {/* Badge categoría */}
                <div className="absolute bottom-3 left-3 z-10">
                  <LtBadge tone="paper" rotate={1}>{business.category}</LtBadge>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-5 flex-1 flex flex-col gap-3">
                <div>
                  <h2
                    className="text-xl font-bold mb-1 group-hover:text-[var(--lt-terracota)] transition-colors line-clamp-1"
                    style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                  >
                    {business.name}
                  </h2>
                  <div
                    className="flex items-center gap-1 text-sm"
                    style={{ color: 'var(--lt-ink-soft)' }}
                  >
                    <MapPin className="h-4 w-4 shrink-0" style={{ color: 'var(--lt-terracota)' }} aria-hidden="true" />
                    {business.city || 'Australia'}{business.state ? `, ${business.state}` : ''}
                  </div>
                </div>

                <p
                  className="text-sm leading-relaxed flex-1 line-clamp-3"
                  style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
                >
                  {business.description}
                </p>

                {/* Acciones */}
                <div className={cn('grid gap-2 mt-auto', business.whatsapp || business.phone || business.instagram ? 'grid-cols-2' : 'grid-cols-1')}>
                  {business.whatsapp && (
                    <a
                      href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] text-sm font-semibold transition-all hover:-translate-y-0.5"
                      style={{ background: 'var(--lt-verde)', color: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
                      aria-label={`Contactar a ${business.name} por WhatsApp`}
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      WhatsApp
                    </a>
                  )}
                  {!business.whatsapp && business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] text-sm font-semibold transition-all hover:-translate-y-0.5"
                      style={{ background: 'var(--lt-paper)', color: 'var(--lt-ink)', boxShadow: 'var(--lt-shadow-sticker)' }}
                      aria-label={`Llamar a ${business.name}`}
                    >
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      Llamar
                    </a>
                  )}
                  {!business.whatsapp && !business.phone && business.instagram && (
                    <a
                      href={`https://instagram.com/${business.instagram.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] text-sm font-semibold transition-all hover:-translate-y-0.5"
                      style={{ background: 'var(--lt-accent)', color: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
                      aria-label={`Ver Instagram de ${business.name}`}
                    >
                      <Instagram className="h-4 w-4" aria-hidden="true" />
                      Instagram
                    </a>
                  )}
                  <Link
                    href={`/negocio/${business.slug}`}
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] text-sm font-semibold transition-all hover:-translate-y-0.5"
                    style={{ background: 'var(--lt-bg)', color: 'var(--lt-ink)', boxShadow: 'var(--lt-shadow-sticker)' }}
                  >
                    Ver perfil →
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {/* ── Estado vacío ── */}
      {filteredBusinesses.length === 0 && (
        <div
          className="text-center py-16 rounded-[var(--lt-radius-lg)] border-[2px] border-dashed border-[var(--lt-ink)]"
          style={{ background: 'var(--lt-paper)' }}
        >
          <div aria-hidden="true" className="flex justify-center mb-4">
            <SunMotif size={72} className="opacity-30" />
          </div>
          <h3
            className="text-xl font-bold mb-2"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            No encontramos negocios con esa búsqueda
          </h3>
          <p
            className="text-sm max-w-md mx-auto mb-6"
            style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
          >
            Intenta cambiar los filtros o sé el primero en registrar un negocio en esta categoría.
          </p>
          <Link href="/registrar-negocio">
            <LtButton variant="sticker" tone="terracota" size="md" rotate={-1}>
              ¡Registra tu negocio gratis!
            </LtButton>
          </Link>
        </div>
      )}
    </div>
  )
}
