'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect, useCallback } from 'react'
import { Search, Tag } from 'lucide-react'
import { EVENT_CATEGORIES } from '@/lib/constants/categories'

export default function EventFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [term, setTerm] = useState(searchParams.get('q') || '')

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`)
      })
    },
    [searchParams, pathname, router]
  )

  useEffect(() => {
    const delay = setTimeout(() => {
      handleFilterChange('q', term)
    }, 400)
    return () => clearTimeout(delay)
  }, [term, handleFilterChange])

  const inputBase = [
    'block w-full py-3 rounded-[var(--lt-radius-sm)]',
    'border-[1.6px] border-[var(--lt-ink)] outline-none text-sm transition-all',
    'focus:ring-2 focus:ring-[var(--lt-terracota)] focus:border-[var(--lt-terracota)]',
  ].join(' ')

  return (
    <div
      className="flex flex-col md:flex-row gap-4 p-4 rounded-[var(--lt-radius-md)] border-[2px] border-[var(--lt-ink)]"
      style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)', fontFamily: 'var(--lt-font-sans)' }}
      role="search"
      aria-label="Filtros de eventos"
    >
      {/* Búsqueda */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search
            className={`h-5 w-5 transition-colors ${isPending ? 'animate-pulse' : ''}`}
            aria-hidden="true"
            style={{ color: isPending ? 'var(--lt-terracota)' : 'var(--lt-ink-soft)' }}
          />
        </div>
        <label htmlFor="events-q" className="sr-only">Buscar evento</label>
        <input
          id="events-q"
          name="q"
          type="search"
          value={term}
          onChange={e => setTerm(e.target.value)}
          placeholder="Buscar evento…"
          className={`${inputBase} pl-10 pr-3`}
          style={{ background: 'var(--lt-bg)', color: 'var(--lt-ink)' }}
        />
      </div>

      {/* Select categoría */}
      <div className="relative w-full md:w-56 shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Tag className="h-5 w-5" aria-hidden="true" style={{ color: 'var(--lt-ink-soft)' }} />
        </div>
        <label htmlFor="events-cat" className="sr-only">Categoría de evento</label>
        <select
          id="events-cat"
          onChange={e => handleFilterChange('category', e.target.value)}
          defaultValue={searchParams.get('category') || ''}
          className={`${inputBase} pl-10 pr-3 appearance-none cursor-pointer`}
          style={{ background: 'var(--lt-bg)', color: 'var(--lt-ink)' }}
        >
          <option value="">Todas las categorías</option>
          {EVENT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
