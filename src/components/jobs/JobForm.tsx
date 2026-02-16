'use client'

import { useState } from 'react';
import { createJobOffer, updateUserJobOffer, JobOfferInput } from '@/app/actions/jobActions';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

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

  const isEdit = mode === 'edit';

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    if (!agreedToTerms || !agreedNoPayment) {
      setError("Debe confirmar ambas casillas para continuar.");
      setLoading(false);
      return;
    }

    const data: JobOfferInput = {
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      jobType: formData.get('jobType') as string,
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
      // Si hay error, mostrarlo (en caso de éxito, el server action redirige automáticamente)
      if (response?.error) {
        setError(response.error);
        setLoading(false);
      }
    }
  }

  const inputClasses = "w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all";

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
      <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Editar oferta' : 'Publicar nueva oferta'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {isEdit
            ? 'Modifica los campos que necesites actualizar.'
            : 'Completa los campos para que tu oferta sea visible en el muro de empleos.'}
        </p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Título del cargo</label>
            <input name="title" required defaultValue={initialData?.title} className={inputClasses} placeholder="Ej: Barista con experiencia" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
            <select name="category" required defaultValue={initialData?.category || ''} className={`${inputClasses} appearance-none cursor-pointer`}>
              <option value="" disabled>Selecciona una categoría</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Hostelería">Hostelería</option>
              <option value="Construcción">Construcción</option>
              <option value="Ventas">Ventas</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
          <textarea name="description" required rows={4} defaultValue={initialData?.description} className={`${inputClasses} resize-none`} placeholder="Describe los requisitos y beneficios del puesto..."></textarea>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación</label>
            <select name="location" required defaultValue={initialData?.location || ''} className={`${inputClasses} appearance-none cursor-pointer`}>
              <option value="" disabled>Selecciona una ubicación</option>
              <option value="Brisbane">Brisbane</option>
              <option value="Sydney">Sydney</option>
              <option value="Melbourne">Melbourne</option>
              <option value="Gold Coast">Gold Coast</option>
              <option value="Remoto">Remoto</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de empleo</label>
            <select name="jobType" required defaultValue={initialData?.jobType || 'Full-time'} className={`${inputClasses} appearance-none cursor-pointer`}>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Freelance">Freelance</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 p-5 rounded-xl bg-gray-50 dark:bg-gray-900/50 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Información de contacto <span className="text-gray-500 dark:text-gray-400 font-normal">(al menos 1 campo)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="email" type="email" placeholder="Email" defaultValue={initialData?.email || ''} className={inputClasses} />
            <input name="phone" type="text" placeholder="Teléfono" defaultValue={initialData?.phone || ''} className={inputClasses} />
            <input name="externalLink" type="url" placeholder="URL externa" defaultValue={initialData?.externalLink || ''} className={inputClasses} />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={agreedNoPayment}
              onChange={(e) => setAgreedNoPayment(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-900" 
            />
            <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              Confirmo que esta oferta no exige ningún pago a los candidatos.
            </span>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-900" 
            />
            <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              Acepto los términos y condiciones de la plataforma.
            </span>
          </label>
        </div>

        <div className={`flex gap-4 mt-6 ${isEdit ? 'flex-row' : ''}`}>
          {isEdit && (
            <Link
              href="/perfil"
              className="flex-1 px-6 py-3.5 text-center text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </Link>
          )}
          <button 
            type="submit" 
            disabled={loading}
            className={`${isEdit ? 'flex-1' : 'w-full'} px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
          >
            {loading
              ? (isEdit ? 'Guardando cambios...' : 'Publicando...')
              : (isEdit ? 'Guardar cambios' : 'Publicar oferta')}
          </button>
        </div>
      </form>
    </div>
  );
}
