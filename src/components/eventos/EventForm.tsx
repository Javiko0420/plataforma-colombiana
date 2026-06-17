'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'
import { AlertCircle, ImagePlus, Trash } from 'lucide-react'
import { createEvent, updateEvent } from '@/app/(main)/eventos/actions'
import { Button } from '@/components/lh/Button'
import { EVENT_CATEGORIES } from '@/lib/constants/categories'

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
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl ?? null)
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

  const help: React.CSSProperties = { fontSize: 12.5, color: 'var(--lh-fg3)', margin: '7px 0 0' }

  return (
    <div>
      <div style={{ marginBottom: 28, paddingBottom: 18, borderBottom: '1px solid var(--lh-border)' }}>
        <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 24, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--lh-fg)', margin: 0 }}>
          {isEdit ? 'Editar evento' : 'Publicar nuevo evento'}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: '6px 0 0' }}>
          {isEdit
            ? 'Modifica los campos que necesites actualizar.'
            : 'Completa los campos para que tu evento sea visible en el muro de eventos.'}
        </p>
      </div>

      <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="title" className="lh-label">Título del evento</label>
            <input id="title" name="title" required defaultValue={initialData?.title} className="lh-input" placeholder="Ej: Noche de Salsa en Vivo" />
          </div>
          <div>
            <label htmlFor="category" className="lh-label">Categoría</label>
            <select id="category" name="category" required defaultValue={initialData?.category || ''} className="lh-input">
              <option value="" disabled>Selecciona una categoría</option>
              {EVENT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="lh-label">Descripción</label>
          <textarea id="description" name="description" required rows={5} defaultValue={initialData?.description} className="lh-input" style={{ resize: 'none' }} placeholder="Describe tu evento: qué van a encontrar los asistentes, artistas, horarios..." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="eventDate" className="lh-label">Fecha y hora</label>
            <input
              id="eventDate"
              name="eventDate"
              type="datetime-local"
              required
              defaultValue={initialData?.eventDate ? new Date(initialData.eventDate).toISOString().slice(0, 16) : ''}
              className="lh-input"
            />
          </div>
          <div>
            <label htmlFor="location" className="lh-label">Ubicación</label>
            <input id="location" name="location" required defaultValue={initialData?.location} className="lh-input" placeholder="Ej: Cultural Center, Brisbane" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="ticketPrice" className="lh-label">
              Precio del ticket (AUD) <span style={{ fontWeight: 400, color: 'var(--lh-fg3)' }}>(opcional)</span>
            </label>
            <input id="ticketPrice" name="ticketPrice" type="number" min="0" step="0.01" defaultValue={initialData?.ticketPrice ?? ''} className="lh-input" placeholder="0.00 = Gratis" />
            <p style={help}>Déjalo vacío o en 0 si el evento es gratuito.</p>
          </div>
          <div>
            <label htmlFor="ticketLink" className="lh-label">
              Link para comprar entradas <span style={{ fontWeight: 400, color: 'var(--lh-fg3)' }}>(opcional)</span>
            </label>
            <input id="ticketLink" name="ticketLink" type="url" defaultValue={initialData?.ticketLink ?? ''} className="lh-input" placeholder="https://tuevento.com/entradas" />
          </div>
        </div>

        <div>
          <label className="lh-label">
            Imagen del evento <span style={{ fontWeight: 400, color: 'var(--lh-fg3)' }}>(opcional)</span>
          </label>

          {imageUrl && (
            <div style={{ position: 'relative', width: '100%', height: 192, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--lh-border)', marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                aria-label="Quitar imagen"
                style={{ position: 'absolute', zIndex: 10, top: 8, right: 8, width: 32, height: 32, borderRadius: '50%', border: 0, background: 'rgba(0,0,0,.6)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Trash size={15} />
              </button>
              <Image fill style={{ objectFit: 'cover' }} alt="Imagen del evento" src={imageUrl} />
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
                    window: '#FFFFFF',
                    sourceBg: '#FAF6EF',
                    windowBorder: '#181B21',
                    tabIcon: '#2E5E8C',
                    inactiveTabIcon: '#5C616D',
                    menuIcons: '#5C616D',
                    link: '#2E5E8C',
                    action: '#2E5E8C',
                    inProgress: '#D4A24C',
                    complete: '#5C8A6B',
                    error: '#D8775F',
                    textDark: '#181B21',
                    textLight: '#FFFFFF',
                  },
                },
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => open()}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px 16px', borderRadius: 14, border: '1.5px dashed var(--lh-border)', background: 'var(--lh-surface2)', color: 'var(--lh-fg2)', fontFamily: 'var(--lh-font)', fontSize: 14.5, fontWeight: 500, cursor: 'pointer' }}
                >
                  <ImagePlus size={18} />
                  Subir imagen del evento
                </button>
              )}
            </CldUploadWidget>
          )}

          <p style={help}>Máximo 2MB. Formatos: JPG, PNG, WEBP.</p>
        </div>

        {error && (
          <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 16px', borderRadius: 13, background: 'color-mix(in oklch, var(--lh-terra) 10%, var(--lh-surface))', border: '1px solid color-mix(in oklch, var(--lh-terra) 30%, transparent)' }}>
            <AlertCircle size={16} style={{ color: 'var(--lh-terra)', flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: 'var(--lh-terra)' }}>{error}</span>
          </div>
        )}

        <div style={{ paddingTop: 18, borderTop: '1px solid var(--lh-border)' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 11, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              style={{ marginTop: 2, width: 17, height: 17, flexShrink: 0, accentColor: 'var(--lh-accent)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--lh-fg2)' }}>
              Confirmo que la información publicada es verídica y acepto los términos de la plataforma.
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
          {isEdit && (
            <Button href="/perfil/eventos" variant="secondary" size="md" style={{ flex: 1 }}>
              Cancelar
            </Button>
          )}
          <Button type="submit" variant="primary" size="md" disabled={loading} style={{ flex: 1 }}>
            {loading
              ? (isEdit ? 'Guardando cambios…' : 'Publicando…')
              : (isEdit ? 'Guardar cambios' : 'Publicar evento')}
          </Button>
        </div>
      </form>
    </div>
  )
}
