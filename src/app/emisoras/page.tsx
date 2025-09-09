"use client"
import { stations, useAudio } from '@/components/providers/audio-provider'
import { Play } from 'lucide-react'

export default function EmisorasPage() {
  const { play, currentStation, isPlaying } = useAudio()

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Emisoras Colombianas</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">Escucha en vivo Tropicana en varias ciudades.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((s) => (
            <div key={s.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{s.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Calidad MP3 cuando esté disponible.</p>
              <button
                onClick={() => play(s)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                aria-label={`Reproducir ${s.name}`}
              >
                <Play className="w-4 h-4" />
                {currentStation?.id === s.id && isPlaying ? 'Reproduciendo' : 'Reproducir'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


