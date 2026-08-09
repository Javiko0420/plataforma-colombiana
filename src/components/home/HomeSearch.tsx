'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

/*
 * Único fragmento interactivo del bloque de búsqueda del home: input
 * controlado + navegación al directorio. Los chips "Popular" son Links
 * estáticos y viven en el Server Component de la página.
 */
export function HomeSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/directorio?q=${encodeURIComponent(q)}` : '/directorio')
  }

  return (
    <form
      role="search"
      onSubmit={handleSearch}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '6px 8px 6px 18px', border: '1px solid var(--lh-border)', borderRadius: 15, background: 'var(--lh-surface2)', transition: '.2s' }}
    >
      <Search size={18} style={{ color: 'var(--lh-fg3)', flexShrink: 0 }} aria-hidden="true" />
      <label htmlFor="home-search" className="sr-only">Buscar en el directorio</label>
      <input
        id="home-search"
        name="q"
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Busca negocios, empleos, eventos…"
        style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', color: 'var(--lh-fg)', fontSize: 16.5, fontFamily: 'var(--lh-font)', padding: '13px 0' }}
      />
      <button
        type="submit"
        className="lh-hover-pop"
        style={{ padding: '12px 22px', borderRadius: 11, border: 0, background: 'var(--lh-accent)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--lh-font)' }}
      >
        Buscar
      </button>
    </form>
  )
}
