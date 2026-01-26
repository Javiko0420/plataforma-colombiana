// src/app/directorio/page.tsx
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import DirectoryClient from './directory-client'

export const metadata: Metadata = {
  title: 'Directorio Latino | Latin Territory',
  description: 'Encuentra servicios, restaurantes y profesionales latinos en Australia.',
}

// Revalidar los datos cada hora para mantener el directorio fresco pero rápido
export const revalidate = 3600 

export default async function DirectorioPage() {
  // 1. Buscamos los negocios reales en la BD (Solo los activos)
  const businesses = await prisma.business.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: 'desc', // Los más nuevos primero
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: true,
      city: true,
      state: true,
      phone: true,
      email: true,
      website: true,
      whatsapp: true,
      images: true,
      isVerified: true,
      // No seleccionamos campos sensibles del dueño
    }
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Hero */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
            Directorio Latino
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Conecta con el talento de nuestra comunidad. Desde gastronomía hasta servicios profesionales en todo Australia.
          </p>
        </div>
      </div>

      {/* Cliente Interactivo */}
      <DirectoryClient initialBusinesses={businesses} />
    </div>
  )
}
