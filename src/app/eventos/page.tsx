import { prisma } from '@/lib/prisma'
import EventFilters from '@/components/eventos/EventFilters'
import EventList from '@/components/eventos/EventList'
import { Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const resolvedParams = await searchParams
  const query = resolvedParams.q || ''
  const category = resolvedParams.category || ''

  const eventos = await prisma.event.findMany({
    where: {
      eventDate: { gte: new Date() },
      ...(query && {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(category && { category }),
    },
    orderBy: {
      eventDate: 'asc',
    },
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-16">
      {/* Cabecera con gradiente cálido */}
      <div className="bg-gradient-to-b from-red-50/50 to-transparent dark:from-red-900/10 pt-12 pb-8 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Descubre{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-500">
              Eventos
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Conciertos, teatro, comedia y mucho más, organizado por y para
            nuestra gente.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner informativo */}
        <div className="mb-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 flex items-start sm:items-center gap-4 shadow-sm">
          <div className="bg-amber-100 dark:bg-amber-800/50 p-2 rounded-full shrink-0">
            <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-amber-900 dark:text-amber-300 font-bold text-sm md:text-base">
              ¡Vive la cultura de tu ciudad!
            </h3>
            <p className="text-amber-700 dark:text-amber-400/80 text-sm mt-1">
              Aquí encontrarás los próximos eventos publicados por nuestra
              comunidad. Los eventos pasados se archivan automáticamente para
              mantenerte siempre al día.
            </p>
          </div>
        </div>

        {/* Filtros */}
        <EventFilters />

        {/* Resultados */}
        <div className="mt-10">
          <EventList events={eventos} />
        </div>
      </main>
    </div>
  )
}
