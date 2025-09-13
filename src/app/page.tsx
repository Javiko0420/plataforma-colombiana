"use client"

import Link from 'next/link'
import { ArrowRight, Star, Users, TrendingUp, MapPin, Radio, Cloud, Trophy } from 'lucide-react'
import { useTranslations } from '@/components/providers/language-provider'

export default function Home() {
  const { t } = useTranslations()
  return (
    <div>
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {t('home.skip')}
      </a>

      {/* Hero Section */}
      <section 
        className="relative overflow-hidden"
        aria-labelledby="hero-title"
        role="banner"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-blue-400/20 to-red-400/20" aria-hidden="true"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 
              id="hero-title"
              className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            >
              <span className="bg-gradient-to-r from-yellow-600 via-blue-500 to-red-600 bg-clip-text text-transparent">
                {t('app.name')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-black dark:text-gray-500 mb-8 max-w-6xl mx-auto text-center" style={{ textAlign: 'center' }}>
              {t('home.hero.tagline')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/directorio"
                className="bg-gradient-to-r from-yellow-500 to-red-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-yellow-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 min-h-[44px]"
                aria-describedby="directorio-description"
              >
                {t('home.cta.directory')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
              <span id="directorio-description" className="sr-only">
                {t('home.cta.directory')}
              </span>
              
              <Link
                href="/foros"
                className="border-2 border-blue-500 text-blue-500 dark:text-blue-400 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-500 hover:text-white dark:hover:bg-blue-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 min-h-[44px] flex items-center justify-center"
                aria-describedby="foros-description"
              >
                {t('home.cta.forums')}
              </Link>
              <span id="foros-description" className="sr-only">
                {t('home.cta.forums')}
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
              {t('home.stats.title')}
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
              <div className="text-gray-600 dark:text-gray-400">{t('home.stats.entrepreneurs')}</div>
              </div>
              <div className="text-center">
              <div 
                className="bg-gradient-to-r from-blue-500 to-red-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                aria-hidden="true"
              >
                <Star className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white" aria-label="Cinco mil productos disponibles">
                5,000+
              </div>
              <div className="text-gray-600 dark:text-gray-400">{t('home.stats.products')}</div>
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
              <div className="text-gray-600 dark:text-gray-400">{t('home.stats.departments')}</div>
              </div>
              <div className="text-center">
              <div 
                className="bg-gradient-to-r from-green-400 to-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                aria-hidden="true"
              >
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white" aria-label={t('home.stats.satisfactionAria', 'Noventa y ocho por ciento de satisfacción')}>
                98%
              </div>
              <div className="text-gray-600 dark:text-gray-400">{t('home.stats.satisfaction')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4 text-center">
                {t('home.features.title')}
              </h2>
              <p className="text-xl text-black dark:text-gray-500 max-w-6xl mx-auto text-center">
               {t('home.features.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {/* Directorio de Empresas */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-yellow-200 dark:border-yellow-800">
              <div className="bg-gradient-to-r from-yellow-400 to-red-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('home.features.directory.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('home.features.directory.desc')}
              </p>
              <Link
                href="/directorio"
                className="text-yellow-600 dark:text-yellow-400 font-medium hover:text-yellow-700 dark:hover:text-yellow-300 flex items-center"
              >
                {t('home.features.directory.link')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

              {/* Emisoras */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-red-200 dark:border-red-800">
              <div className="bg-gradient-to-r from-blue-500 to-red-400 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Radio className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('home.features.radios.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('home.features.radios.desc')}
              </p>
              <Link
                href="/emisoras"
                className="text-red-600 dark:text-red-400 font-medium hover:text-red-700 dark:hover:text-red-300 flex items-center"
              >
                {t('home.features.radios.link')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Clima */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-blue-200 dark:border-blue-800">
              <div className="bg-gradient-to-r from-blue-400 to-green-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('home.features.weather.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('home.features.weather.desc')}
              </p>
              <Link
                href="/clima"
                className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 flex items-center"
              >
                {t('home.features.weather.link')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Deportes */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-green-200 dark:border-green-800">
              <div className="bg-gradient-to-r from-green-400 to-yellow-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('home.features.sports.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('home.features.sports.desc')}
              </p>
              <Link
                href="/deportes"
                className="text-green-600 dark:text-green-400 font-medium hover:text-green-700 dark:hover:text-green-300 flex items-center"
              >
                {t('home.features.sports.link')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Foros */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-200 dark:border-purple-800">
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('home.features.forums.title', 'Foros de Discusión')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('home.features.forums.desc', 'Participa en conversaciones sobre emprendimiento, negocios y oportunidades.')}
              </p>
              <Link
                href="/foros"
                className="text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700 dark:hover:text-purple-300 flex items-center"
              >
                {t('home.features.forums.link', 'Unirse ahora')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Tasas de Cambio */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-indigo-200 dark:border-indigo-800">
              <div className="bg-gradient-to-r from-indigo-400 to-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('home.features.rates.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('home.features.rates.desc')}
              </p>
              <Link
                href="/tasas"
                className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center"
              >
                {t('home.features.rates.link')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-yellow-500 via-blue-500 to-red-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
              {t('home.cta.hero.title')}
            </h2>
            <p className="text-xl text-white/90 mb-8 text-center">
              {t('home.cta.hero.desc')}
            </p>
            <div className="flex justify-center">
              <Link
                href="/registro"
                className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                {t('home.cta.hero.link')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
