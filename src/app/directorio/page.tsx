'use client'

import { useState } from 'react'
import { Search, Filter, MapPin, Star, Phone, Mail, Globe, MessageCircle } from 'lucide-react'

// Mock data for demonstration
const mockBusinesses = [
  {
    id: '1',
    name: 'Café Andino',
    description: 'Café artesanal de alta calidad cultivado en las montañas de Huila',
    category: 'GASTRONOMIA',
    city: 'Neiva',
    department: 'Huila',
    phone: '+57 300 123 4567',
    email: 'info@cafeandino.co',
    website: 'https://cafeandino.co',
    whatsapp: '+57 300 123 4567',
    logo: '/placeholder-logo.jpg',
    images: ['/placeholder-1.jpg', '/placeholder-2.jpg'],
    featured: true,
    rating: 4.8,
    products: [
      { name: 'Café Premium 500g', price: 25000, currency: 'COP' },
      { name: 'Café Especial 250g', price: 15000, currency: 'COP' }
    ]
  },
  {
    id: '2',
    name: 'Artesanías Wayuu',
    description: 'Mochilas y artesanías tradicionales hechas a mano por comunidades Wayuu',
    category: 'ARTESANIAS',
    city: 'Riohacha',
    department: 'La Guajira',
    phone: '+57 301 234 5678',
    email: 'contacto@wayuuart.co',
    whatsapp: '+57 301 234 5678',
    logo: '/placeholder-logo.jpg',
    images: ['/placeholder-3.jpg'],
    featured: false,
    rating: 4.9,
    products: [
      { name: 'Mochila Wayuu Grande', price: 120000, currency: 'COP' },
      { name: 'Mochila Wayuu Mediana', price: 80000, currency: 'COP' }
    ]
  },
  {
    id: '3',
    name: 'TechSolutions Colombia',
    description: 'Desarrollo de software y soluciones tecnológicas para empresas',
    category: 'TECNOLOGIA',
    city: 'Bogotá',
    department: 'Cundinamarca',
    phone: '+57 302 345 6789',
    email: 'hello@techsolutions.co',
    website: 'https://techsolutions.co',
    logo: '/placeholder-logo.jpg',
    images: ['/placeholder-4.jpg'],
    featured: true,
    rating: 4.7,
    products: [
      { name: 'Desarrollo Web', price: 2000000, currency: 'COP' },
      { name: 'App Móvil', price: 5000000, currency: 'COP' }
    ]
  }
]

const categories = [
  'GASTRONOMIA',
  'TECNOLOGIA', 
  'ARTESANIAS',
  'SERVICIOS',
  'MODA',
  'AGRICULTURA',
  'TURISMO',
  'SALUD',
  'EDUCACION',
  'CONSTRUCCION',
  'TRANSPORTE',
  'ENTRETENIMIENTO',
  'OTROS'
]

const departments = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá',
  'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare',
  'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo',
  'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima',
  'Valle del Cauca', 'Vaupés', 'Vichada'
]

export default function DirectorioPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filteredBusinesses = mockBusinesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || business.category === selectedCategory
    const matchesDepartment = !selectedDepartment || business.department === selectedDepartment
    
    return matchesSearch && matchesCategory && matchesDepartment
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-yellow-500 via-red-500 to-blue-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Directorio de Emprendimientos
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Descubre productos únicos y servicios de emprendedores colombianos
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar emprendimientos, productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0) + category.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>

              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todos los departamentos</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0) + category.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Todos los departamentos</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Mostrando {filteredBusinesses.length} emprendimientos
          </p>
        </div>

        {/* Business Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {filteredBusinesses.map((business) => (
            <div key={business.id} className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Business Image */}
              <div className="h-48 bg-gradient-to-r from-yellow-400 via-red-400 to-blue-400 relative">
                {business.featured && (
                  <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Destacado
                  </div>
                )}
                <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-full p-2">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {business.rating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Business Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {business.name}
                  </h3>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                    {business.category.charAt(0) + business.category.slice(1).toLowerCase()}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {business.description}
                </p>

                <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">{business.city}, {business.department}</span>
                </div>

                {/* Products */}
                {business.products.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Productos destacados:
                    </h4>
                    <div className="space-y-1">
                      {business.products.slice(0, 2).map((product, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{product.name}</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Actions */}
                <div className="flex flex-wrap gap-2">
                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="flex items-center px-3 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Llamar
                    </a>
                  )}
                  {business.whatsapp && (
                    <a
                      href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      WhatsApp
                    </a>
                  )}
                  {business.email && (
                    <a
                      href={`mailto:${business.email}`}
                      className="flex items-center px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </a>
                  )}
                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-lg text-sm hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                    >
                      <Globe className="h-4 w-4 mr-1" />
                      Web
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredBusinesses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No se encontraron emprendimientos
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Intenta ajustar tus filtros de búsqueda
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
