"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type TeamOption = {
  id: number
  name: string
  country?: string
  badge?: string | null
  logo?: string | null
}

export default function TeamAutocomplete({
  name = 'team',
  label = 'Team',
  placeholder = 'Search team...',
  defaultTeamId,
  defaultTeamName,
}: {
  name?: string
  label?: string
  placeholder?: string
  defaultTeamId?: number
  defaultTeamName?: string
}) {
  const [query, setQuery] = useState<string>(defaultTeamName || '')
  const [selected, setSelected] = useState<TeamOption | null>(
    defaultTeamId ? { id: defaultTeamId, name: defaultTeamName || String(defaultTeamId) } : null
  )
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<TeamOption[]>([])
  const abortRef = useRef<AbortController | null>(null)
  const listId = useMemo(() => `${name}-listbox`, [name])

  const doSearch = useCallback(async (q: string) => {
    if (!q || q.trim().length < 2) {
      setOptions([])
      return
    }
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    try {
      const resp = await fetch(`/api/sports/teams?query=${encodeURIComponent(q)}`, { signal: controller.signal, cache: 'no-store' })
      if (!resp.ok) throw new Error('search failed')
      const json = (await resp.json()) as { success?: boolean; data?: TeamOption[] }
      setOptions(Array.isArray(json?.data) ? json.data.slice(0, 8) : [])
    } catch {
      if (!controller.signal.aborted) setOptions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const handle = setTimeout(() => { void doSearch(query) }, 300)
    return () => clearTimeout(handle)
  }, [query, doSearch])

  function onSelect(opt: TeamOption) {
    setSelected(opt)
    setQuery(opt.name)
    setOpen(false)
  }

  function onClear() {
    setSelected(null)
    setQuery('')
    setOptions([])
    setOpen(false)
  }

  const normalized = (s: string | undefined | null) => (s || '').trim().toLowerCase()
  const teamIdValue = selected && normalized(query) === normalized(selected.name) ? String(selected.id) : ''

  return (
    <div className="flex flex-col relative">
      <label htmlFor={`${name}-input`} className="lh-label">{label}</label>
      <div className="flex items-center gap-2">
        <input
          id={`${name}-input`}
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
          className="lh-input"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
        />
        {selected ? (
          <button type="button" onClick={onClear} style={{ fontSize: 13.5, color: 'var(--lh-fg2)', textDecoration: 'underline', background: 'transparent', border: 0, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Limpiar
          </button>
        ) : null}
      </div>
      <input type="hidden" name={name} value={teamIdValue} />
      <input type="hidden" name="teamName" value={query} />
      {open && (options.length > 0 || loading) && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-10"
          style={{ marginTop: 4, top: '100%', width: '100%', maxHeight: 256, overflow: 'auto', borderRadius: 14, border: '1px solid var(--lh-border)', background: 'var(--lh-surface)', boxShadow: 'var(--lh-shadow-lg)' }}
        >
          {loading ? (
            <li style={{ padding: '10px 14px', fontSize: 14, color: 'var(--lh-fg3)' }}>Cargando…</li>
          ) : (
            options.map((opt) => (
              <li
                key={opt.id}
                role="option"
                aria-selected={selected?.id === opt.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelect(opt)}
                className="lh-autocomplete-opt"
                style={{ padding: '10px 14px', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--lh-fg)' }}
              >
                {opt.badge || opt.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={(opt.badge || opt.logo) as string} alt="" style={{ height: 16, width: 16 }} />
                ) : null}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.name}</span>
                {opt.country ? <span style={{ marginLeft: 'auto', color: 'var(--lh-fg3)', fontSize: 12 }}>{opt.country}</span> : null}
              </li>
            ))
          )}
          {!loading && options.length === 0 ? (
            <li style={{ padding: '10px 14px', fontSize: 14, color: 'var(--lh-fg3)' }}>Sin resultados</li>
          ) : null}
        </ul>
      )}
    </div>
  )
}


