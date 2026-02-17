'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'
import Link from 'next/link'
import { AlertCircle, ImagePlus, Trash } from 'lucide-react'
import { createEvent, updateEvent } from '@/app/eventos/actions'

interface EventFormData {
  title: string
  description: string
  category: string
  eventDate: string
  location: string
  imageUrl?: string | null
  ticketLink?: string | null
}

interface EventFormProps {
  mode?: 'create' | 'edit'
  eventId?: string
  initialData?: EventFormData
}

export default function EventForm({
  mode = 'create',
  eventId,
  initialData,
}: EventFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(mode === 'edit')
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData?.imageUrl ?? null
  )
  const [isMounted, setIsMounted] = useState(false)

  const isEdit = mode === 'edit'

  useEffect(() => {
    setIsMounted(true)
  }, [])

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)

    if (!agreedToTerms) {
      setError('Debes aceptar los términos para continuar.')
      setLoading(false)
      return
    }

    const data: EventFormData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      eventDate: formData.get('eventDate') as string,
      location: formData.get('location') as string,
      imageUrl: imageUrl,
      ticketLink: (formData.get('ticketLink') as string) || null,
    }

    if (!data.title || !data.description || !data.category || !data.eventDate || !data.location) {
      setError('Por favor completa todos los campos obligatorios.')
      setLoading(false)
      return
    }

    if (new Date(data.eventDate) <= new Date()) {
      setError('La fecha del evento debe ser en el futuro.')
      setLoading(false)
      return
    }

    const payload = {
      ...data,
      imageUrl: data.imageUrl ?? undefined,
      ticketLink: data.ticketLink ?? undefined,
    }

    if (isEdit && eventId) {
      const response = await updateEvent(eventId, payload)
      if (!response.success) {
        setError(response.error ?? 'Error al actualizar el evento.')
        setLoading(false)
      } else {
        router.push('/perfil/eventos')
      }
    } else {
      const response = await createEvent(payload)
      if (!response.success) {
        setError(response.error ?? 'Error al crear el evento.')
        setLoading(false)
      } else {
        router.push('/perfil/eventos')
      }
    }
  }

  const inputClasses =
    'w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all'

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Editar evento' : 'Publicar nuevo evento'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {isEdit
            ? 'Modifica los campos que necesites actualizar.'
            : 'Completa los campos para que tu evento sea visible en el muro de eventos.'}
        </p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        {/* Título y Categoría */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Título del evento
            </label>
            <input
              name="title"
              required
              defaultValue={initialData?.title}
              className={inputClasses}
              placeholder="Ej: Noche de Salsa en Vivo"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Categoría
            </label>
            <select
              name="category"
              required
              defaultValue={initialData?.category || ''}
              className={`${inputClasses} appearance-none cursor-pointer`}
            >
              <option value="" disabled>
                Selecciona una categoría
              </option>
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

        {/* Descripción */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Descripción
          </label>
          <textarea
            name="description"
            required
            rows={5}
            defaultValue={initialData?.description}
            className={`${inputClasses} resize-none`}
            placeholder="Describe tu evento: qué van a encontrar los asistentes, artistas, horarios..."
          />
        </div>

        {/* Fecha y Ubicación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha y hora
            </label>
            <input
              name="eventDate"
              type="datetime-local"
              required
              defaultValue={
                initialData?.eventDate
                  ? new Date(initialData.eventDate).toISOString().slice(0, 16)
                  : ''
              }
              className={inputClasses}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ubicación
            </label>
            <input
              name="location"
              required
              defaultValue={initialData?.location}
              className={inputClasses}
              placeholder="Ej: Cultural Center, Brisbane"
            />
          </div>
        </div>

        {/* Link de entradas (opcional) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Link para comprar entradas{' '}
            <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            name="ticketLink"
            type="url"
            defaultValue={initialData?.ticketLink ?? ''}
            className={inputClasses}
            placeholder="https://tuevento.com/entradas"
          />
        </div>

        {/* Imagen con Cloudinary */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Imagen del evento{' '}
            <span className="text-gray-400 font-normal">(opcional)</span>
          </label>

          {imageUrl && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-3">
              <div className="z-10 absolute top-2 right-2">
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors shadow-lg"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
              <Image
                fill
                className="object-cover"
                alt="Imagen del evento"
                src={imageUrl}
              />
            </div>
          )}

          {!imageUrl && isMounted && (
            <CldUploadWidget
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onSuccess={(result: any) => {
                setImageUrl(result.info.secure_url)
              }}
              uploadPreset="latinterritory_uploads"
              options={{
                cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                maxFiles: 1,
                maxFileSize: 2000000,
                sources: ['local', 'url', 'camera'],
                styles: {
                  palette: {
                    window: '#0F172A',
                    sourceBg: '#1E293B',
                    windowBorder: '#334155',
                    tabIcon: '#EF4444',
                    inactiveTabIcon: '#94A3B8',
                    menuIcons: '#64748B',
                    link: '#EF4444',
                    action: '#EF4444',
                    inProgress: '#F59E0B',
                    complete: '#22C55E',
                    error: '#EF4444',
                    textDark: '#0F172A',
                    textLight: '#F8FAFC',
                  },
                },
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => open()}
                  className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 px-4 py-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 transition-all w-full justify-center"
                >
                  <ImagePlus className="w-5 h-5" />
                  Subir imagen del evento
                </button>
              )}
            </CldUploadWidget>
          )}

          <p className="text-xs text-gray-400 mt-1">
            Máximo 2MB. Formatos: JPG, PNG, WEBP.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Términos */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-500 dark:bg-gray-900"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              Confirmo que la información publicada es verídica y acepto los
              términos de la plataforma.
            </span>
          </label>
        </div>

        {/* Botones */}
        <div className={`flex gap-4 mt-6 ${isEdit ? 'flex-row' : ''}`}>
          {isEdit && (
            <Link
              href="/perfil/eventos"
              className="flex-1 px-6 py-3.5 text-center text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </Link>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`${isEdit ? 'flex-1' : 'w-full'} px-6 py-3.5 bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
          >
            {loading
              ? isEdit
                ? 'Guardando cambios...'
                : 'Publicando...'
              : isEdit
                ? 'Guardar cambios'
                : 'Publicar evento'}
          </button>
        </div>
      </form>
    </div>
  )
}
