'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, Trash2, PlusCircle, Edit } from 'lucide-react';
import { deleteUserJobOffer } from '@/app/actions/jobActions';
import { JobOffer } from '@prisma/client';
import { LtEmptyState, LtPanel, LtButton, LtBadge } from '@/components/lt';
import { JOB_CATEGORIES, categoryLabel } from '@/lib/constants/categories';

export default function UserJobOffers({
  initialJobs,
  onCreateClick,
}: {
  initialJobs: JobOffer[];
  onCreateClick?: () => void;
}) {
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
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    }
    
    setIsDeleting(null);
  };

  if (jobs.length === 0) {
    return (
      <LtEmptyState
        title="Aún no tienes ofertas publicadas"
        description="¿Buscas talento para tu negocio o proyecto? Publica una vacante y conecta con la comunidad latina en Australia."
        icon={<Briefcase className="w-12 h-12" style={{ color: 'var(--lt-ink-soft)' }} />}
        action={
          onCreateClick ? (
            <LtButton variant="sticker" tone="terracota" size="md" rotate={-1} iconLeft={<PlusCircle className="w-5 h-5" />} onClick={onCreateClick}>
              Publicar mi primera oferta
            </LtButton>
          ) : (
            <Link href="/empleos/publicar">
              <LtButton variant="sticker" tone="terracota" size="md" rotate={-1} iconLeft={<PlusCircle className="w-5 h-5" />}>
                Publicar mi primera oferta
              </LtButton>
            </Link>
          )
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {jobs.map((job) => {
        const diffDays = Math.ceil(
          Math.abs(new Date(job.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        return (
          <LtPanel key={job.id} tone="bg" shadow="sm" className="p-5 flex flex-col">
            <div className="flex justify-between items-start mb-3 gap-3">
              <h4
                className="font-bold line-clamp-2"
                style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
              >
                {job.title}
              </h4>
              <LtBadge tone="sun" rotate={1}>
                ⏳ {diffDays} {diffDays === 1 ? 'día' : 'días'}
              </LtBadge>
            </div>
            
            <p className="text-sm mb-4 line-clamp-2 flex-grow" style={{ color: 'var(--lt-ink-soft)' }}>
              {categoryLabel(JOB_CATEGORIES, job.category)} • {job.location}
            </p>

            <div className="pt-4 border-t-[1.6px] border-[var(--lt-ink)]/20 mt-auto flex justify-end gap-2">
              <Link href={`/empleos/editar/${job.id}`}>
                <LtButton variant="outline" tone="paper" size="sm" iconLeft={<Edit className="w-4 h-4" />}>
                  Editar
                </LtButton>
              </Link>
              <LtButton
                variant="outline"
                tone="paper"
                size="sm"
                iconLeft={<Trash2 className="w-4 h-4" />}
                onClick={() => handleDelete(job.id, job.title)}
                disabled={isDeleting === job.id}
                className="!text-[var(--lt-terracota)] !border-[var(--lt-terracota)]"
              >
                {isDeleting === job.id ? 'Eliminando...' : 'Eliminar'}
              </LtButton>
            </div>
          </LtPanel>
        );
      })}
    </div>
  );
}
