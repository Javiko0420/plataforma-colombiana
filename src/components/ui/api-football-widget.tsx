'use client'

import { useTheme } from 'next-themes'
import { useEffect, useMemo, useRef } from 'react'

type WidgetType = 'standings' | 'fixtures'

type Props = {
  type: WidgetType
  leagueId: number
  season?: number
  height?: number | string
  showLogos?: boolean
  showErrors?: boolean
  date?: string
}

declare global {
  interface Window {
    __apiFootballWidgetLoaded?: boolean
  }
}

export function ApiFootballWidget({ type, leagueId, season, height = 600, showLogos = true, showErrors = false, date }: Props) {
  const { theme } = useTheme()
  const url = useMemo(() => {
    const base = 'https://widgets.api-sports.io/football'
    const params = new URLSearchParams()
    // Widget key is public from dashboard; pass if present
    const widgetKey = process.env.NEXT_PUBLIC_API_FOOTBALL_WIDGET_KEY
    if (widgetKey) params.set('widget', widgetKey)
    params.set('league', String(leagueId))
    if (season) params.set('season', String(season))
    // theme: light or dark
    if (theme === 'dark') params.set('theme', 'dark')

    switch (type) {
      case 'standings':
        return `${base}/standings?${params.toString()}`
      case 'fixtures':
        return `${base}/fixtures?${params.toString()}`
      default:
        return `${base}/standings?${params.toString()}`
    }
  }, [type, leagueId, season, theme])
  const mode = process.env.NEXT_PUBLIC_API_FOOTBALL_WIDGET_MODE || 'iframe'
  const version = process.env.NEXT_PUBLIC_API_FOOTBALL_WIDGET_VERSION || '1.1.8'
  const explicitScriptPath = process.env.NEXT_PUBLIC_API_FOOTBALL_WIDGET_SCRIPT
  const refresh = process.env.NEXT_PUBLIC_API_FOOTBALL_WIDGET_REFRESH || '60'

  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mode !== 'script') return
    const host = 'v3.football.api-sports.io'
    const widgetKey = process.env.NEXT_PUBLIC_API_FOOTBALL_WIDGET_KEY
    if (!divRef.current || !widgetKey) return

    const mountNode = divRef.current
    // Ensure container exists (stable id to allow dynamic attribute updates)
    const containerId = `wg-api-football-${type}`
    let div = document.getElementById(containerId) as HTMLDivElement | null
    if (!div) {
      div = document.createElement('div')
      div.id = containerId
      div.className = 'api_football_loader'
      mountNode.innerHTML = ''
      mountNode.appendChild(div)
    }
    // Set/Update attributes
    div.dataset.host = host
    div.dataset.refresh = refresh
    div.dataset.key = widgetKey
    div.dataset.league = String(leagueId)
    if (season) div.dataset.season = String(season)
    if (date && type === 'fixtures') div.dataset.date = date
    div.dataset.showErrors = String(showErrors)
    div.dataset.showLogos = String(showLogos)
    // Theme: default or dark
    if (theme === 'dark') div.dataset.theme = 'dark'
    else delete div.dataset.theme

    // Load script once; next updates just dispatch DOMContentLoaded
    const scriptSrc = explicitScriptPath
      ? `https://widgets.api-sports.io/${explicitScriptPath}`
      : `https://widgets.api-sports.io/football/${version}/widget.js`

    if (!window.__apiFootballWidgetLoaded) {
      const script = document.createElement('script')
      script.type = 'module'
      script.src = scriptSrc
      script.onload = () => {
        window.__apiFootballWidgetLoaded = true
        window.document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }))
      }
      mountNode.appendChild(script)
    } else {
      window.document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }))
    }
    return () => {
      if (mountNode) {
        mountNode.innerHTML = ''
      }
    }
  }, [mode, version, explicitScriptPath, refresh, leagueId, season, theme, type, showErrors, showLogos, date])

  if (mode === 'script') {
    return <div ref={divRef} style={{ width: '100%', height: typeof height === 'number' ? `${height}px` : height }} />
  }

  return (
    <iframe
      title={`api-football-${type}-${leagueId}`}
      src={url}
      style={{ width: '100%', height: typeof height === 'number' ? `${height}px` : height, border: 0 }}
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      referrerPolicy="no-referrer"
    />
  )
}


