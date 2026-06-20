'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Briefcase } from 'lucide-react'
import { JOB_CATEGORIES, categoryLabel } from '@/lib/constants/categories'

/* Solo los campos que la vitrina necesita; evitamos arrastrar @prisma/client
   al bundle cliente (mismo criterio que FeaturedBusinesses). */
interface RecentJob {
  id: string
  title: string
  category: string
  location: string
  jobType: string
  hourlyRate: number
}

/* Paleta rotativa para el avatar (espejo de la del home). */
const ACCENT_TINTS = ['var(--lh-accent)', 'var(--lh-terra)', 'var(--lh-warm)', 'var(--lh-green)']
const chip = (v: string) => `color-mix(in oklch,${v} 14%,transparent)`

/* jobType viaja en inglés desde la BD; en la vitrina se muestra en español. */
const JOB_TYPE_LABELS: Record<string, string> = {
  'Full-time': 'Tiempo completo',
  'Part-time': 'Medio tiempo',
  Freelance: 'Freelance',
  Contract: 'Contrato',
}
const jobTypeLabel = (type: string): string => JOB_TYPE_LABELS[type] ?? type

/* Salario por hora (AUD): sin decimales si es entero, dos si no. */
const formatRate = (rate: number): string =>
  `$${Number.isInteger(rate) ? String(rate) : rate.toFixed(2)}/h`

/* Iniciales del título, ignorando palabras de relleno.
   "Chef de cocina latina" → "CC" · "Barista bilingüe" → "BB". */
const STOPWORDS = new Set(['de', 'la', 'el', 'los', 'las', 'del', 'al', 'con', 'y', 'e', 'en', 'para', 'un', 'una'])
function initialsFromTitle(title: string): string {
  const words = title.trim().split(/\s+/).filter(w => w && !STOPWORDS.has(w.toLowerCase()))
  if (words.length === 0) return title.trim().slice(0, 2).toUpperCase() || '·'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

/* ─── Sección completa: hace fetch y resuelve estados ─── */
export function RecentJobs() {
  const [jobs, setJobs] = useState<RecentJob[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/jobs?limit=4')
      .then(res => res.json())
      .then(json => {
        if (!active) return
        if (json?.success && Array.isArray(json.data)) setJobs(json.data)
        else setError(true)
      })
      .catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [])

  // Carga
  if (jobs === null && !error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    )
  }

  // Error de red / API
  if (error) {
    return (
      <p style={{ fontSize: 14.5, color: 'var(--lh-fg2)', padding: '8px 2px' }}>
        No pudimos cargar los empleos en este momento. Intenta recargar la página.
      </p>
    )
  }

  // Vacío (aún no hay ofertas activas)
  if (!jobs || jobs.length === 0) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center', borderRadius: 20, background: 'var(--lh-surface)', border: '1px solid var(--lh-border)' }}>
        <Briefcase size={30} style={{ color: 'var(--lh-fg3)', opacity: 0.5 }} aria-hidden="true" />
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--lh-fg)', margin: '12px 0 4px' }}>
          Todavía no hay empleos publicados
        </p>
        <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: '0 0 18px' }}>
          Publica tu primera vacante y conecta con talento de la comunidad latina.
        </p>
        <Link
          href="/empleos/publicar"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 12, background: 'var(--lh-accent)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}
        >
          Publica una oferta
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {jobs.map((job, i) => <JobRow key={job.id} job={job} index={i} />)}
    </div>
  )
}

/* ─── Fila de empleo reciente ─── */
function JobRow({ job, index }: { job: RecentJob; index: number }) {
  const c = ACCENT_TINTS[index % ACCENT_TINTS.length]

  return (
    <Link
      href={`/empleos/${job.id}`}
      style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '18px 22px', borderRadius: 16, background: 'var(--lh-surface)', border: '1px solid var(--lh-border)', boxShadow: 'var(--lh-shadow)', transition: '.24s', textDecoration: 'none' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateX(4px)'; el.style.borderColor = chip('var(--lh-accent)') }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.borderColor = 'var(--lh-border)' }}
    >
      <span
        aria-hidden="true"
        style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17, background: `linear-gradient(135deg,${c},var(--lh-accent-ink))`, color: '#fff', letterSpacing: '-.02em' }}
      >
        {initialsFromTitle(job.title)}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="line-clamp-1" style={{ fontSize: 16.5, fontWeight: 600, letterSpacing: '-.01em', color: 'var(--lh-fg)' }}>{job.title}</div>
        <div style={{ fontSize: 13.5, color: 'var(--lh-fg2)', marginTop: 3 }}>
          {categoryLabel(JOB_CATEGORIES, job.category)} · {job.location}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--lh-fg2)', background: 'var(--lh-surface2)', border: '1px solid var(--lh-border2)', padding: '6px 11px', borderRadius: 99, whiteSpace: 'nowrap' }}>{jobTypeLabel(job.jobType)}</span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--lh-green)', background: chip('var(--lh-green)'), padding: '6px 11px', borderRadius: 99, whiteSpace: 'nowrap' }}>{formatRate(job.hourlyRate)}</span>
      </div>
      <ArrowRight size={16} style={{ color: 'var(--lh-fg3)', flexShrink: 0 }} aria-hidden="true" />
    </Link>
  )
}

/* ─── Skeleton de carga (misma forma de fila) ─── */
function SkeletonRow() {
  return (
    <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '18px 22px', borderRadius: 16, background: 'var(--lh-surface)', border: '1px solid var(--lh-border)' }}>
      <span style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 13, background: 'var(--lh-surface2)' }} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ width: '45%', height: 16, borderRadius: 6, background: 'var(--lh-surface2)' }} />
        <div style={{ width: '30%', height: 13, borderRadius: 6, background: 'var(--lh-surface2)' }} />
      </div>
      <div style={{ width: 120, height: 28, borderRadius: 99, background: 'var(--lh-surface2)', flexShrink: 0 }} />
    </div>
  )
}
