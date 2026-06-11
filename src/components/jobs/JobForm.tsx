'use client'

import { useState } from 'react';
import { createJobOffer, updateUserJobOffer, JobOfferInput } from '@/app/actions/jobActions';
import { JOB_CATEGORIES } from '@/lib/constants/categories';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { LtButton, LtPanel } from '@/components/lt';

interface JobFormProps {
  mode?: 'create' | 'edit';
  jobId?: string;
  initialData?: JobOfferInput;
}

export default function JobForm({ mode = 'create', jobId, initialData }: JobFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(mode === 'edit');
  const [agreedNoPayment, setAgreedNoPayment] = useState(mode === 'edit');
  const [agreedSalaryCompliance, setAgreedSalaryCompliance] = useState(mode === 'edit');

  const isEdit = mode === 'edit';

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    if (!agreedToTerms || !agreedNoPayment || !agreedSalaryCompliance) {
      setError("Debe confirmar todas las casillas de verificación para continuar.");
      setLoading(false);
      return;
    }

    const rawHourlyRate = formData.get('hourlyRate') as string;
    const parsedRate = parseFloat(rawHourlyRate);

    if (!parsedRate || isNaN(parsedRate) || parsedRate <= 0) {
      setError("El salario por hora es obligatorio y debe ser mayor a $0.");
      setLoading(false);
      return;
    }

    const data: JobOfferInput = {
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      jobType: formData.get('jobType') as string,
      hourlyRate: parsedRate,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      externalLink: formData.get('externalLink') as string,
    };

    if (isEdit && jobId) {
      const response = await updateUserJobOffer(jobId, data);
      if (response?.error) {
        setError(response.error);
        setLoading(false);
      } else {
        window.location.href = '/perfil';
      }
    } else {
      const response = await createJobOffer(data);
      if (response?.error) {
        setError(response.error);
        setLoading(false);
      }
    }
  }

  return (
    <div>
      <div className="mb-8 border-b-[2px] border-[var(--lt-ink)] pb-4">
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
        >
          {isEdit ? 'Editar oferta' : 'Publicar nueva oferta'}
        </h2>
        <p
          className="text-sm mt-1"
          style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
        >
          {isEdit
            ? 'Modifica los campos que necesites actualizar.'
            : 'Completa los campos para que tu oferta sea visible en el muro de empleos.'}
        </p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="title" className="lt-label">Título del cargo</label>
            <input id="title" name="title" required defaultValue={initialData?.title} className="lt-input" placeholder="Ej: Barista con experiencia" />
          </div>
          <div className="space-y-2">
            <label htmlFor="category" className="lt-label">Categoría</label>
            <select id="category" name="category" required defaultValue={initialData?.category || ''} className="lt-input appearance-none cursor-pointer">
              <option value="" disabled>Selecciona una categoría</option>
              {JOB_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="lt-label">Descripción</label>
          <textarea id="description" name="description" required rows={4} defaultValue={initialData?.description} className="lt-input resize-none" placeholder="Describe los requisitos y beneficios del puesto..."></textarea>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="location" className="lt-label">Ubicación</label>
            <select id="location" name="location" required defaultValue={initialData?.location || ''} className="lt-input appearance-none cursor-pointer">
              <option value="" disabled>Selecciona una ubicación</option>
              <option value="Brisbane">Brisbane</option>
              <option value="Sydney">Sydney</option>
              <option value="Melbourne">Melbourne</option>
              <option value="Gold Coast">Gold Coast</option>
              <option value="Remoto">Remoto</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="jobType" className="lt-label">Tipo de empleo</label>
            <select id="jobType" name="jobType" required defaultValue={initialData?.jobType || 'Full-time'} className="lt-input appearance-none cursor-pointer">
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Freelance">Freelance</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="hourlyRate" className="lt-label">
            Salario por hora (AUD) <span style={{ color: 'var(--lt-accent)' }}>*</span>
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 font-medium"
              style={{ color: 'var(--lt-ink-soft)' }}
            >
              $
            </span>
            <input
              id="hourlyRate"
              name="hourlyRate"
              type="number"
              step="0.01"
              min="0.01"
              required
              defaultValue={initialData?.hourlyRate ?? ''}
              className="lt-input pl-7"
              placeholder="Ej: 28.50"
            />
          </div>
          <p className="text-xs" style={{ color: 'var(--lt-ink-soft)' }}>Obligatorio por requisito legal australiano.</p>
        </div>

        <LtPanel tone="bg" shadow="sm" className="p-5 space-y-4">
          <h3
            className="text-sm font-bold"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            Información de contacto{' '}
            <span className="font-normal" style={{ color: 'var(--lt-ink-soft)' }}>(al menos 1 campo)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="email" type="email" placeholder="Email" defaultValue={initialData?.email || ''} className="lt-input" />
            <input name="phone" type="text" placeholder="Teléfono" defaultValue={initialData?.phone || ''} className="lt-input" />
            <input name="externalLink" type="url" placeholder="URL externa" defaultValue={initialData?.externalLink || ''} className="lt-input" />
          </div>
        </LtPanel>

        {error && (
          <LtPanel tone="bg" shadow="sm" className="px-4 py-3 flex items-center gap-2 text-sm border-[var(--lt-accent)]">
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--lt-accent)' }} />
            <span style={{ color: 'var(--lt-accent)' }}>{error}</span>
          </LtPanel>
        )}

        <div className="space-y-3 pt-4 border-t-[2px] border-[var(--lt-ink)]">
          <label className="flex items-start space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreedNoPayment}
              onChange={(e) => setAgreedNoPayment(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[var(--lt-ink)] accent-[var(--lt-terracota)] shrink-0"
            />
            <span
              className="text-sm transition-colors"
              style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
            >
              Confirmo que esta oferta no exige ningún pago a los candidatos.
            </span>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreedSalaryCompliance}
              onChange={(e) => setAgreedSalaryCompliance(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[var(--lt-ink)] accent-[var(--lt-terracota)] shrink-0"
            />
            <span
              className="text-sm transition-colors"
              style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
            >
              Confirmo que el salario publicado cumple los mínimos legales aplicables (Award/EA o salario mínimo nacional).
            </span>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[var(--lt-ink)] accent-[var(--lt-terracota)] shrink-0"
            />
            <span
              className="text-sm transition-colors"
              style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
            >
              Acepto los{' '}
              <Link href="/job-posting-terms" target="_blank" rel="noopener noreferrer" className="underline font-medium" style={{ color: 'var(--lt-terracota)' }} onClick={(e) => e.stopPropagation()}>
                términos y condiciones
              </Link>{' '}
              de publicación de empleos.
            </span>
          </label>
        </div>

        <div className={`flex gap-4 mt-6 ${isEdit ? 'flex-row' : ''}`}>
          {isEdit && (
            <Link href="/perfil" className="flex-1">
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
            {isEdit ? 'Guardar cambios' : 'Publicar oferta'}
          </LtButton>
        </div>
      </form>
    </div>
  );
}
