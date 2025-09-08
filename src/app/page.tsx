import Link from 'next/link'
import { ArrowRight, Star, Users, TrendingUp, MapPin, Radio, Cloud, Trophy } from 'lucide-react'

export default function Home() {
  return (
    <div>
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Saltar al contenido principal
      </a>

      {/* Hero Section */}
      <section 
        className="relative overflow-hidden"
        aria-labelledby="hero-title"
        role="banner"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-red-400/20 to-blue-400/20" aria-hidden="true"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 
              id="hero-title"
              className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            >
              <span className="bg-gradient-to-r from-yellow-600 via-red-500 to-blue-600 bg-clip-text text-transparent">
                Plataforma Colombiana
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-black dark:text-gray-300 mb-8 max-w-6xl mx-auto text-center" style={{ textAlign: 'center' }}>
              Conectando emprendedores, productos únicos y la pasión colombiana en un solo lugar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/directorio"
                className="bg-gradient-to-r from-yellow-500 to-red-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-yellow-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 min-h-[44px]"
                aria-describedby="directorio-description"
              >
                Explorar Directorio
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
              <span id="directorio-description" className="sr-only">
                Navegar al directorio de emprendimientos colombianos
              </span>
              
              <Link
                href="/foros"
                className="border-2 border-blue-500 text-blue-500 dark:text-blue-400 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-500 hover:text-white dark:hover:bg-blue-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 min-h-[44px] flex items-center justify-center"
                aria-describedby="foros-description"
              >
                Únete a los Foros
              </Link>
              <span id="foros-description" className="sr-only">
                Participar en foros de discusión sobre emprendimiento
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="main-content">
        {/* Stats Section */}
        <section 
          className="py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
          aria-labelledby="stats-title"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="stats-title" className="sr-only">
              Estadísticas de la plataforma
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center justify-items-center">
              <div className="text-center">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                aria-hidden="true"
              >
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white" aria-label="Mil doscientos emprendedores registrados">
                1,200+
              </div>
              <div className="text-gray-600 dark:text-gray-400">Emprendedores</div>
              </div>
              <div className="text-center">
              <div 
                className="bg-gradient-to-r from-red-400 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                aria-hidden="true"
              >
                <Star className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white" aria-label="Cinco mil productos disponibles">
                5,000+
              </div>
              <div className="text-gray-600 dark:text-gray-400">Productos</div>
              </div>
              <div className="text-center">
              <div 
                className="bg-gradient-to-r from-blue-400 to-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                aria-hidden="true"
              >
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white" aria-label="Treinta y dos departamentos cubiertos">
                32
              </div>
              <div className="text-gray-600 dark:text-gray-400">Departamentos</div>
              </div>
              <div className="text-center">
              <div 
                className="bg-gradient-to-r from-green-400 to-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                aria-hidden="true"
              >
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white" aria-label="Noventa y ocho por ciento de satisfacción">
                98%
              </div>
              <div className="text-gray-600 dark:text-gray-400">Satisfacción</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4 text-center">
                Todo lo que necesitas en un solo lugar
              </h2>
              <p className="text-xl text-black dark:text-gray-400 max-w-6xl mx-auto text-center">
               Desde emprendimientos locales hasta información en tiempo real de Colombia
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {/* Directorio de Empresas */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-yellow-200 dark:border-yellow-800">
              <div className="bg-gradient-to-r from-yellow-400 to-red-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Directorio de Emprendimientos
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Descubre productos únicos y servicios de emprendedores colombianos en todas las categorías.
              </p>
              <Link
                href="/directorio"
                className="text-yellow-600 dark:text-yellow-400 font-medium hover:text-yellow-700 dark:hover:text-yellow-300 flex items-center"
              >
                Explorar ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

              {/* Emisoras */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-red-200 dark:border-red-800">
              <div className="bg-gradient-to-r from-red-400 to-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Radio className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Emisoras Colombianas
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Escucha en vivo las principales emisoras del país: Tropicana, La W, Caracol y más.
              </p>
              <Link
                href="/emisoras"
                className="text-red-600 dark:text-red-400 font-medium hover:text-red-700 dark:hover:text-red-300 flex items-center"
              >
                Escuchar ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Clima */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-blue-200 dark:border-blue-800">
              <div className="bg-gradient-to-r from-blue-400 to-green-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Clima Nacional
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Consulta el clima actualizado de las principales ciudades colombianas.
              </p>
              <Link
                href="/clima"
                className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 flex items-center"
              >
                Ver clima
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Deportes */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-green-200 dark:border-green-800">
              <div className="bg-gradient-to-r from-green-400 to-yellow-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Resultados Deportivos
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Sigue los resultados de la Liga Colombiana, Champions League y la Selección Colombia.
              </p>
              <Link
                href="/deportes"
                className="text-green-600 dark:text-green-400 font-medium hover:text-green-700 dark:hover:text-green-300 flex items-center"
              >
                Ver resultados
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Foros */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-200 dark:border-purple-800">
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Foros de Discusión
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Participa en conversaciones sobre emprendimiento, negocios y oportunidades.
              </p>
              <Link
                href="/foros"
                className="text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700 dark:hover:text-purple-300 flex items-center"
              >
                Unirse ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Tasas de Cambio */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-indigo-200 dark:border-indigo-800">
              <div className="bg-gradient-to-r from-indigo-400 to-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Tasas de Cambio
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Consulta las tasas de cambio actualizadas del peso colombiano frente a otras monedas.
              </p>
              <Link
                href="/tasas"
                className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center"
              >
                Ver tasas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-yellow-500 via-red-500 to-blue-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
              ¿Eres emprendedor colombiano?
            </h2>
            <p className="text-xl text-white/90 mb-8 text-center">
              Únete a nuestra plataforma y da a conocer tu negocio a miles de colombianos
            </p>
            <div className="flex justify-center">
              <Link
                href="/registro"
                className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Registrar mi negocio
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
