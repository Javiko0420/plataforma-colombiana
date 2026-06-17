'use client'

import { useState } from 'react';
import { createJobOffer, updateUserJobOffer, JobOfferInput } from '@/app/actions/jobActions';
import { JOB_CATEGORIES } from '@/lib/constants/categories';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/lh/Button';

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

  const checkbox: React.CSSProperties = {
    marginTop: 2, width: 17, height: 17, flexShrink: 0,
    accentColor: 'var(--lh-accent)', cursor: 'pointer',
  };
  const checkLabel: React.CSSProperties = {
    display: 'flex', alignItems: 'flex-start', gap: 11, cursor: 'pointer',
  };
  const checkText: React.CSSProperties = {
    fontSize: 14, lineHeight: 1.5, color: 'var(--lh-fg2)',
  };

  return (
    <div>
      <div style={{ marginBottom: 28, paddingBottom: 18, borderBottom: '1px solid var(--lh-border)' }}>
        <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 24, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--lh-fg)', margin: 0 }}>
          {isEdit ? 'Editar oferta' : 'Publicar nueva oferta'}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: '6px 0 0' }}>
          {isEdit
            ? 'Modifica los campos que necesites actualizar.'
            : 'Completa los campos para que tu oferta sea visible en el muro de empleos.'}
        </p>
      </div>

      <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="title" className="lh-label">Título del cargo</label>
            <input id="title" name="title" required defaultValue={initialData?.title} className="lh-input" placeholder="Ej: Barista con experiencia" />
          </div>
          <div>
            <label htmlFor="category" className="lh-label">Categoría</label>
            <select id="category" name="category" required defaultValue={initialData?.category || ''} className="lh-input">
              <option value="" disabled>Selecciona una categoría</option>
              {JOB_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="lh-label">Descripción</label>
          <textarea id="description" name="description" required rows={4} defaultValue={initialData?.description} className="lh-input" style={{ resize: 'none' }} placeholder="Describe los requisitos y beneficios del puesto..." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="location" className="lh-label">Ubicación</label>
            <select id="location" name="location" required defaultValue={initialData?.location || ''} className="lh-input">
              <option value="" disabled>Selecciona una ubicación</option>
              <option value="Brisbane">Brisbane</option>
              <option value="Sydney">Sydney</option>
              <option value="Melbourne">Melbourne</option>
              <option value="Gold Coast">Gold Coast</option>
              <option value="Remoto">Remoto</option>
            </select>
          </div>
          <div>
            <label htmlFor="jobType" className="lh-label">Tipo de empleo</label>
            <select id="jobType" name="jobType" required defaultValue={initialData?.jobType || 'Full-time'} className="lh-input">
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Freelance">Freelance</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="hourlyRate" className="lh-label">
            Salario por hora (AUD) <span style={{ color: 'var(--lh-terra)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontWeight: 500, color: 'var(--lh-fg3)' }}>$</span>
            <input
              id="hourlyRate"
              name="hourlyRate"
              type="number"
              step="0.01"
              min="0.01"
              required
              defaultValue={initialData?.hourlyRate ?? ''}
              className="lh-input"
              style={{ paddingLeft: 28 }}
              placeholder="Ej: 28.50"
            />
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--lh-fg3)', margin: '7px 0 0' }}>Obligatorio por requisito legal australiano.</p>
        </div>

        {/* Información de contacto */}
        <div style={{ borderRadius: 16, border: '1px solid var(--lh-border)', background: 'var(--lh-surface2)', padding: 20 }}>
          <h3 style={{ fontFamily: 'var(--lh-font)', fontSize: 14.5, fontWeight: 600, color: 'var(--lh-fg)', margin: '0 0 14px' }}>
            Información de contacto{' '}
            <span style={{ fontWeight: 400, color: 'var(--lh-fg3)' }}>(al menos 1 campo)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input name="email" type="email" placeholder="Email" defaultValue={initialData?.email || ''} className="lh-input" />
            <input name="phone" type="text" placeholder="Teléfono" defaultValue={initialData?.phone || ''} className="lh-input" />
            <input name="externalLink" type="url" placeholder="URL externa" defaultValue={initialData?.externalLink || ''} className="lh-input" />
          </div>
        </div>

        {error && (
          <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 16px', borderRadius: 13, background: 'color-mix(in oklch, var(--lh-terra) 10%, var(--lh-surface))', border: '1px solid color-mix(in oklch, var(--lh-terra) 30%, transparent)' }}>
            <AlertCircle size={16} style={{ color: 'var(--lh-terra)', flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: 'var(--lh-terra)' }}>{error}</span>
          </div>
        )}

        {/* Confirmaciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 18, borderTop: '1px solid var(--lh-border)' }}>
          <label style={checkLabel}>
            <input type="checkbox" checked={agreedNoPayment} onChange={(e) => setAgreedNoPayment(e.target.checked)} style={checkbox} />
            <span style={checkText}>Confirmo que esta oferta no exige ningún pago a los candidatos.</span>
          </label>
          <label style={checkLabel}>
            <input type="checkbox" checked={agreedSalaryCompliance} onChange={(e) => setAgreedSalaryCompliance(e.target.checked)} style={checkbox} />
            <span style={checkText}>Confirmo que el salario publicado cumple los mínimos legales aplicables (Award/EA o salario mínimo nacional).</span>
          </label>
          <label style={checkLabel}>
            <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} style={checkbox} />
            <span style={checkText}>
              Acepto los{' '}
              <Link href="/job-posting-terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--lh-accent)', fontWeight: 500, textDecoration: 'underline' }} onClick={(e) => e.stopPropagation()}>
                términos y condiciones
              </Link>{' '}
              de publicación de empleos.
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
          {isEdit && (
            <Button href="/perfil" variant="secondary" size="md" style={{ flex: 1 }}>
              Cancelar
            </Button>
          )}
          <Button type="submit" variant="primary" size="md" disabled={loading} style={{ flex: 1 }}>
            {loading
              ? (isEdit ? 'Guardando cambios…' : 'Publicando…')
              : (isEdit ? 'Guardar cambios' : 'Publicar oferta')}
          </Button>
        </div>
      </form>
    </div>
  );
}
