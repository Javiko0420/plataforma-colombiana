'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { EVENT_CATEGORIES } from '@/lib/constants/categories'
import { Card } from '@/components/lh/Card'

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

  return (
    <Card style={{ padding: 20 }} role="search" aria-label="Filtros de eventos">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Búsqueda */}
        <div
          className="flex-1"
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 6px 4px 16px', border: '1px solid var(--lh-border)', borderRadius: 15, background: 'var(--lh-surface2)' }}
        >
          <Search
            size={18}
            className={isPending ? 'animate-pulse' : ''}
            style={{ color: isPending ? 'var(--lh-accent)' : 'var(--lh-fg3)', flexShrink: 0 }}
            aria-hidden="true"
          />
          <label htmlFor="events-q" className="sr-only">Buscar evento</label>
          <input
            id="events-q"
            name="q"
            type="search"
            value={term}
            onChange={e => setTerm(e.target.value)}
            placeholder="Buscar evento…"
            style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', color: 'var(--lh-fg)', fontSize: 15.5, fontFamily: 'var(--lh-font)', padding: '11px 0' }}
          />
        </div>

        {/* Select categoría */}
        <div className="w-full md:w-56 shrink-0">
          <label htmlFor="events-cat" className="sr-only">Categoría de evento</label>
          <select
            id="events-cat"
            className="lh-input"
            onChange={e => handleFilterChange('category', e.target.value)}
            defaultValue={searchParams.get('category') || ''}
          >
            <option value="">Todas las categorías</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  )
}
