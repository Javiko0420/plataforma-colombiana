'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, Trash2, PlusCircle, Edit } from 'lucide-react';
import { deleteUserJobOffer } from '@/app/actions/jobActions';
import { JobOffer } from '@prisma/client';

export default function UserJobOffers({ initialJobs }: { initialJobs: JobOffer[] }) {
  const [jobs, setJobs] = useState<JobOffer[]>(initialJobs);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (jobId: string, jobTitle: string) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas retirar la oferta "${jobTitle}"?\n\nEsta acción quitará el anuncio inmediatamente del muro público.`
    );

    if (!confirmed) return;

    setIsDeleting(jobId);
    
    const response = await deleteUserJobOffer(jobId);
    
    if (response.error) {
      alert(`Error: ${response.error}`);
    } else {
      // Actualizamos el estado local para dar feedback instantáneo sin recargar la página entera
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    }
    
    setIsDeleting(null);
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
        <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aún no tienes ofertas publicadas</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto text-sm">
          ¿Buscas talento para tu negocio o proyecto? Publica una vacante y conecta con la comunidad latina en Australia.
        </p>
        <Link 
          href="/empleos/publicar" 
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 to-red-500 text-white font-semibold px-6 py-2.5 hover:from-yellow-600 hover:to-red-600 transition-all shadow-md"
        >
          <PlusCircle className="w-5 h-5" />
          Publicar mi primera oferta
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {jobs.map((job) => {
        // Calcular días restantes
        const diffDays = Math.ceil(
          Math.abs(new Date(job.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        return (
          <div key={job.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3 gap-3">
              <h4 className="font-bold text-gray-900 dark:text-white line-clamp-2">
                {job.title}
              </h4>
              <span className="shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20">
                ⏳ Expira en {diffDays} {diffDays === 1 ? 'día' : 'días'}
              </span>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 flex-grow">
              {job.category} • {job.location}
            </p>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto flex justify-end gap-2">
              <Link
                href={`/empleos/editar/${job.id}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
              >
                <Edit className="w-4 h-4" /> Editar
              </Link>
              <button
                onClick={() => handleDelete(job.id, job.title)}
                disabled={isDeleting === job.id}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-500 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors disabled:opacity-50"
              >
                {isDeleting === job.id ? 'Eliminando...' : (
                  <>
                    <Trash2 className="w-4 h-4" /> Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
