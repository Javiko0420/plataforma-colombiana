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
      <label htmlFor={`${name}-input`} className="text-lg md:text-xl font-medium text-foreground/80 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <input
          id={`${name}-input`}
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
          className="border border-border rounded-md px-2 py-2 bg-background w-full"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
        />
        {selected ? (
          <button type="button" onClick={onClear} className="text-sm text-foreground/70 underline">
            Clear
          </button>
        ) : null}
      </div>
      <input type="hidden" name={name} value={teamIdValue} />
      <input type="hidden" name="teamName" value={query} />
      {open && (options.length > 0 || loading) && (
        <ul id={listId} role="listbox" className="absolute z-10 mt-1 w-full max-h-64 overflow-auto rounded-md border border-border bg-background shadow">
          {loading ? (
            <li className="px-3 py-2 text-sm text-foreground/70">Loading…</li>
          ) : (
            options.map((opt) => (
              <li
                key={opt.id}
                role="option"
                aria-selected={selected?.id === opt.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelect(opt)}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-foreground/10 flex items-center gap-2"
              >
                {opt.badge || opt.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={(opt.badge || opt.logo) as string} alt="" className="h-4 w-4" />
                ) : null}
                <span className="truncate">{opt.name}</span>
                {opt.country ? <span className="ml-auto text-foreground/60 text-xs">{opt.country}</span> : null}
              </li>
            ))
          )}
          {!loading && options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-foreground/70">No results</li>
          ) : null}
        </ul>
      )}
    </div>
  )
}


