'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { JOB_CATEGORIES } from '@/lib/constants/categories';
import { Card } from '@/components/lh/Card';

export default function JobFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [term, setTerm] = useState(searchParams.get('q') || '');

  const handleFilterChange = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }, [searchParams, pathname, router]);

  useEffect(() => {
    const delay = setTimeout(() => {
      handleFilterChange('q', term);
    }, 400);
    return () => clearTimeout(delay);
  }, [term, handleFilterChange]);

  return (
    <Card style={{ padding: 20 }} role="search" aria-label="Filtros de empleo">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Búsqueda por texto */}
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
          <label htmlFor="jobs-q" className="sr-only">Buscar por palabra clave</label>
          <input
            id="jobs-q"
            name="q"
            type="search"
            value={term}
            onChange={e => setTerm(e.target.value)}
            placeholder="Buscar palabra clave…"
            style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', color: 'var(--lh-fg)', fontSize: 15.5, fontFamily: 'var(--lh-font)', padding: '11px 0' }}
          />
        </div>

        {/* Select categoría */}
        <div className="w-full md:w-52 shrink-0">
          <label htmlFor="jobs-cat" className="sr-only">Categoría</label>
          <select
            id="jobs-cat"
            className="lh-input"
            onChange={e => handleFilterChange('category', e.target.value)}
            defaultValue={searchParams.get('category') || ''}
          >
            <option value="">Todas las áreas</option>
            {JOB_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Select ubicación */}
        <div className="w-full md:w-52 shrink-0">
          <label htmlFor="jobs-loc" className="sr-only">Ubicación</label>
          <select
            id="jobs-loc"
            className="lh-input"
            onChange={e => handleFilterChange('location', e.target.value)}
            defaultValue={searchParams.get('location') || ''}
          >
            <option value="">Cualquier lugar</option>
            <option value="Brisbane">Brisbane</option>
            <option value="Sydney">Sydney</option>
            <option value="Melbourne">Melbourne</option>
            <option value="Gold Coast">Gold Coast</option>
            <option value="Remoto">Remoto</option>
          </select>
        </div>
      </div>
    </Card>
  );
}
