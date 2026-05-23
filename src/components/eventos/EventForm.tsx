'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'
import Link from 'next/link'
import { AlertCircle, ImagePlus, Trash } from 'lucide-react'
import { createEvent, updateEvent } from '@/app/(main)/eventos/actions'
import { LtButton, LtPanel } from '@/components/lt'

const URL_SHORTENER_REGEX = /(https?:\/\/)?(bit\.ly|tinyurl\.com|cutt\.ly|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|shorte\.st)\//i

interface EventFormData {
  title: string
  description: string
  category: string
  eventDate: string
  location: string
  imageUrl?: string | null
  ticketLink?: string | null
  ticketPrice?: number | null
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

    const rawPrice = formData.get('ticketPrice') as string
    const parsedPrice = rawPrice ? parseFloat(rawPrice) : null

    const data: EventFormData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      eventDate: formData.get('eventDate') as string,
      location: formData.get('location') as string,
      imageUrl: imageUrl,
      ticketLink: (formData.get('ticketLink') as string) || null,
      ticketPrice: parsedPrice !== null && !isNaN(parsedPrice) ? parsedPrice : null,
    }

    if (!data.title || !data.description || !data.category || !data.eventDate || !data.location) {
      setError('Por favor completa todos los campos obligatorios.')
      setLoading(false)
      return
    }

    if (URL_SHORTENER_REGEX.test(data.description)) {
      setError('La descripción no puede contener enlaces acortados (bit.ly, tinyurl, t.co, etc.). Usa la URL completa.')
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
      ticketPrice: data.ticketPrice ?? undefined,
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 border-b-[2px] border-[var(--lt-ink)] pb-4">
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
        >
          {isEdit ? 'Editar evento' : 'Publicar nuevo evento'}
        </h2>
        <p
          className="text-sm mt-1"
          style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
        >
          {isEdit
            ? 'Modifica los campos que necesites actualizar.'
            : 'Completa los campos para que tu evento sea visible en el muro de eventos.'}
        </p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="title" className="lt-label">Título del evento</label>
            <input
              id="title"
              name="title"
              required
              defaultValue={initialData?.title}
              className="lt-input"
              placeholder="Ej: Noche de Salsa en Vivo"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="category" className="lt-label">Categoría</label>
            <select
              id="category"
              name="category"
              required
              defaultValue={initialData?.category || ''}
              className="lt-input appearance-none cursor-pointer"
            >
              <option value="" disabled>Selecciona una categoría</option>
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

        <div className="space-y-2">
          <label htmlFor="description" className="lt-label">Descripción</label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            defaultValue={initialData?.description}
            className="lt-input resize-none"
            placeholder="Describe tu evento: qué van a encontrar los asistentes, artistas, horarios..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="eventDate" className="lt-label">Fecha y hora</label>
            <input
              id="eventDate"
              name="eventDate"
              type="datetime-local"
              required
              defaultValue={
                initialData?.eventDate
                  ? new Date(initialData.eventDate).toISOString().slice(0, 16)
                  : ''
              }
              className="lt-input"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="location" className="lt-label">Ubicación</label>
            <input
              id="location"
              name="location"
              required
              defaultValue={initialData?.location}
              className="lt-input"
              placeholder="Ej: Cultural Center, Brisbane"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="ticketPrice" className="lt-label">
              Precio del ticket (AUD){' '}
              <span className="font-normal" style={{ color: 'var(--lt-ink-soft)' }}>(opcional)</span>
            </label>
            <input
              id="ticketPrice"
              name="ticketPrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={initialData?.ticketPrice ?? ''}
              className="lt-input"
              placeholder="0.00 = Gratis"
            />
            <p className="text-xs" style={{ color: 'var(--lt-ink-soft)' }}>
              Déjalo vacío o en 0 si el evento es gratuito.
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="ticketLink" className="lt-label">
              Link para comprar entradas{' '}
              <span className="font-normal" style={{ color: 'var(--lt-ink-soft)' }}>(opcional)</span>
            </label>
            <input
              id="ticketLink"
              name="ticketLink"
              type="url"
              defaultValue={initialData?.ticketLink ?? ''}
              className="lt-input"
              placeholder="https://tuevento.com/entradas"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="lt-label">
            Imagen del evento{' '}
            <span className="font-normal" style={{ color: 'var(--lt-ink-soft)' }}>(opcional)</span>
          </label>

          {imageUrl && (
            <div className="relative w-full h-48 rounded-[var(--lt-radius-sm)] overflow-hidden border-[2px] border-[var(--lt-ink)] mb-3">
              <div className="z-10 absolute top-2 right-2">
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="p-1.5 rounded-full transition-colors border-[2px] border-[var(--lt-ink)]"
                  style={{ background: 'var(--lt-accent)', color: 'var(--lt-paper)' }}
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
              <Image fill className="object-cover" alt="Imagen del evento" src={imageUrl} />
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
                    window: '#fff3d8',
                    sourceBg: '#fffaee',
                    windowBorder: '#22150f',
                    tabIcon: '#b34020',
                    inactiveTabIcon: '#7a4f3b',
                    menuIcons: '#7a4f3b',
                    link: '#b34020',
                    action: '#b34020',
                    inProgress: '#f0a932',
                    complete: '#336940',
                    error: '#b33868',
                    textDark: '#22150f',
                    textLight: '#fffaee',
                  },
                },
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => open()}
                  className="flex items-center gap-2 px-4 py-3 rounded-[var(--lt-radius-sm)] border-[2px] border-dashed border-[var(--lt-ink)] transition-all w-full justify-center"
                  style={{ background: 'var(--lt-bg)', color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}
                >
                  <ImagePlus className="w-5 h-5" />
                  Subir imagen del evento
                </button>
              )}
            </CldUploadWidget>
          )}

          <p className="text-xs mt-1" style={{ color: 'var(--lt-ink-soft)' }}>
            Máximo 2MB. Formatos: JPG, PNG, WEBP.
          </p>
        </div>

        {error && (
          <LtPanel tone="bg" shadow="sm" className="px-4 py-3 flex items-center gap-2 text-sm border-[var(--lt-accent)]">
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--lt-accent)' }} />
            <span style={{ color: 'var(--lt-accent)' }}>{error}</span>
          </LtPanel>
        )}

        <div className="space-y-3 pt-4 border-t-[2px] border-[var(--lt-ink)]">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--lt-ink)] accent-[var(--lt-terracota)]"
            />
            <span
              className="text-sm transition-colors"
              style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
            >
              Confirmo que la información publicada es verídica y acepto los
              términos de la plataforma.
            </span>
          </label>
        </div>

        <div className={`flex gap-4 mt-6 ${isEdit ? 'flex-row' : ''}`}>
          {isEdit && (
            <Link href="/perfil/eventos" className="flex-1">
              <LtButton variant="outline" tone="paper" size="lg" className="w-full">
                Cancelar
              </LtButton>
            </Link>
          )}
          <LtButton
            type="submit"
            variant="sticker"
            tone="terracota"
            size="lg"
            rotate={-1}
            disabled={loading}
            loading={loading}
            loadingText={isEdit ? 'Guardando cambios...' : 'Publicando...'}
            className={isEdit ? 'flex-1' : 'w-full'}
          >
            {isEdit ? 'Guardar cambios' : 'Publicar evento'}
          </LtButton>
        </div>
      </form>
    </div>
  )
}
