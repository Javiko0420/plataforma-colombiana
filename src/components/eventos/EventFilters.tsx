'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect, useCallback } from 'react'
import { Search, Tag } from 'lucide-react'

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

  // Debounce para búsqueda por texto
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleFilterChange('q', term)
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [term, handleFilterChange])

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4">
      {/* Input de Búsqueda */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search
            className={`h-5 w-5 ${isPending ? 'text-red-500 animate-pulse' : 'text-gray-400 dark:text-gray-500'}`}
          />
        </div>
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar evento..."
          className="block w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all"
        />
      </div>

      {/* Select de Categoría */}
      <div className="relative w-full md:w-56 shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Tag className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <select
          onChange={(e) => handleFilterChange('category', e.target.value)}
          defaultValue={searchParams.get('category') || ''}
          className="block w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm appearance-none cursor-pointer transition-all"
        >
          <option value="">Todas las categorías</option>
          <option value="Concierto">Concierto</option>
          <option value="Teatro">Teatro</option>
          <option value="Comedia">Comedia</option>
          <option value="Fiesta">Fiesta</option>
          <option value="Festival">Festival</option>
          <option value="Deportes">Deportes</option>
          <option value="Cultural">Cultural</option>
          <option value="Networking">Networking</option>
          <option value="Otro">Otro</option>
        </select>
      </div>
    </div>
  )
}
