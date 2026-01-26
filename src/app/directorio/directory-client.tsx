'use client'

import { useState } from 'react'
import { Search, Filter, MapPin, Phone, MessageCircle, Building2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Definimos la interfaz basada en tu modelo de Prisma
interface Business {
  id: string
  name: string
  slug: string
  description: string
  category: string
  city: string | null
  state: string | null
  phone: string
  email: string
  website: string | null
  whatsapp: string | null
  images: string[]
  isVerified: boolean
}

interface DirectoryClientProps {
  initialBusinesses: Business[]
}

const categories = [
  'Gastronomía', 'Servicios', 'Salud', 'Construcción', 
  'Educación', 'Tecnología', 'Artesanías', 'Otros'
]

// Lista de ciudades principales en Australia (según tu enfoque)
const cities = [
  'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra'
]

export default function DirectoryClient({ initialBusinesses }: DirectoryClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Lógica de Filtrado
  const filteredBusinesses = initialBusinesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || business.category === selectedCategory
    const matchesCity = !selectedCity || business.city === selectedCity
    
    return matchesSearch && matchesCategory && matchesCity
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Buscador y Filtros */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Barra de Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar arepas, contadores, mecánicos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none transition-all"
            />
          </div>

          {/* Botón Filtros Móvil */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center justify-center px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </button>

          {/* Filtros Desktop */}
          <div className="hidden lg:flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="">Todas las ciudades</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtros Móvil (Desplegable) */}
        {showFilters && (
          <div className="lg:hidden mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">Todas las ciudades</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Resultados: Contador */}
      <div className="mb-6">
        <p className="text-slate-600 dark:text-slate-400">
          Mostrando <span className="font-bold text-slate-900 dark:text-white">{filteredBusinesses.length}</span> territorios latinos
        </p>
      </div>

      {/* Grid de Negocios */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBusinesses.map((business) => (
          <div key={business.id} className="group bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            
            {/* Cabecera / Imagen */}
            <div className="relative h-48 bg-slate-800 overflow-hidden">
               
               {/* LÓGICA DE IMAGEN: Si tiene fotos, muestra la primera. Si no, muestra el placeholder */}
               {business.images && business.images.length > 0 ? (
                   <Image
                     src={business.images[0]}
                     alt={business.name}
                     fill
                     className="object-cover group-hover:scale-105 transition-transform duration-500"
                   />
               ) : (
                   // Placeholder por defecto (Edificio)
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
                      <Building2 className="w-20 h-20 text-white/20 group-hover:scale-110 transition-transform duration-500" />
                   </div>
               )}
               
               {/* Badge de Verificado */}
               {business.isVerified && (
                 <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 z-10">
                   ✓ Oficial
                 </div>
               )}
               
               {/* Categoría */}
               <div className="absolute bottom-4 left-4 z-10">
                 <span className="bg-slate-900/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/10">
                   {business.category}
                 </span>
               </div>
            </div>

            {/* Contenido */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                  {business.name}
                </h3>
              </div>

              <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-4">
                <MapPin className="h-4 w-4 mr-1 text-red-500" />
                {business.city || 'Australia'} {business.state ? `, ${business.state}` : ''}
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 line-clamp-3 flex-1">
                {business.description}
              </p>

              {/* Botones de Acción */}
              <div className="grid grid-cols-2 gap-2 mt-auto">
                {business.whatsapp && (
                  <a
                    href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </a>
                )}
                
                {/* Si no tiene WhatsApp, mostramos botón de llamar o web */}
                {!business.whatsapp && business.phone && (
                   <a
                    href={`tel:${business.phone}`}
                    className="flex items-center justify-center px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Llamar
                  </a>
                )}

                <Link
                  href={`/negocio/${business.slug}`}
                  className="flex items-center justify-center px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700"
                >
                  Ver Perfil
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado Vacío */}
      {filteredBusinesses.length === 0 && (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <Building2 className="h-16 w-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
            No encontramos negocios con esa búsqueda
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Intenta cambiar los filtros o sé el primero en registrar un negocio en esta categoría.
          </p>
          <Link href="/registrar-negocio" className="text-blue-600 hover:underline font-medium">
            ¡Registra tu negocio gratis!
          </Link>
        </div>
      )}
    </div>
  )
}
