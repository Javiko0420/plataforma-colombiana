'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Briefcase } from 'lucide-react';

export default function JobFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Estados locales para el input controlado
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

  // Efecto de Debounce para la búsqueda por texto
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleFilterChange('q', term);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [term, handleFilterChange]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4">
      {/* Input de Búsqueda */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={`h-5 w-5 ${isPending ? 'text-blue-500 animate-pulse' : 'text-gray-400 dark:text-gray-500'}`} />
        </div>
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar palabra clave..."
          className="block w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
        />
      </div>

      {/* Select de Categoría */}
      <div className="relative w-full md:w-48 shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Briefcase className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <select
          onChange={(e) => handleFilterChange('category', e.target.value)}
          defaultValue={searchParams.get('category') || ''}
          className="block w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none cursor-pointer transition-all"
        >
          <option value="">Todas las áreas</option>
          <option value="Tecnología">Tecnología</option>
          <option value="Hostelería">Hostelería</option>
          <option value="Construcción">Construcción</option>
          <option value="Ventas">Ventas</option>
          <option value="Marketing">Marketing</option>
        </select>
      </div>

      {/* Select de Ubicación */}
      <div className="relative w-full md:w-48 shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <select
          onChange={(e) => handleFilterChange('location', e.target.value)}
          defaultValue={searchParams.get('location') || ''}
          className="block w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none cursor-pointer transition-all"
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
  );
}
