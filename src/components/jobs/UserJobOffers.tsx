'use client';

import { useState } from 'react';
import { Briefcase, Trash2, PlusCircle, Edit } from 'lucide-react';
import { deleteUserJobOffer } from '@/app/actions/jobActions';
import { JobOffer } from '@prisma/client';
import { EmptyState } from '@/components/lh/EmptyState';
import { Button } from '@/components/lh/Button';
import { JOB_CATEGORIES, categoryLabel } from '@/lib/constants/categories';

const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`;

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
      <EmptyState
        icon={<Briefcase size={26} />}
        title="Aún no tienes ofertas publicadas"
        description="¿Buscas talento para tu negocio o proyecto? Publica una vacante y conecta con la comunidad latina en Australia."
        action={
          onCreateClick ? (
            <Button variant="primary" size="md" onClick={onCreateClick}>
              <PlusCircle size={18} /> Publicar mi primera oferta
            </Button>
          ) : (
            <Button href="/empleos/publicar" variant="primary" size="md">
              <PlusCircle size={18} /> Publicar mi primera oferta
            </Button>
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
          <div key={job.id} className="lh-card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <h4 className="line-clamp-2" style={{ fontFamily: 'var(--lh-font)', fontSize: 16, fontWeight: 600, letterSpacing: '-.01em', color: 'var(--lh-fg)', margin: 0 }}>
                {job.title}
              </h4>
              <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 99, background: tint('var(--lh-warm)'), color: 'var(--lh-warm)', fontSize: 12, fontWeight: 600 }}>
                {diffDays} {diffDays === 1 ? 'día' : 'días'}
              </span>
            </div>

            <p className="line-clamp-2" style={{ fontSize: 13.5, color: 'var(--lh-fg2)', margin: '0 0 16px', flex: 1 }}>
              {categoryLabel(JOB_CATEGORIES, job.category)} • {job.location}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 14, borderTop: '1px solid var(--lh-border2)' }}>
              <Button href={`/empleos/editar/${job.id}`} variant="secondary" size="sm">
                <Edit size={15} /> Editar
              </Button>
              <button
                type="button"
                className="lh-btn lh-btn--sm lh-btn--secondary"
                onClick={() => handleDelete(job.id, job.title)}
                disabled={isDeleting === job.id}
                style={{ color: 'var(--lh-terra)', borderColor: 'color-mix(in oklch, var(--lh-terra) 35%, transparent)' }}
              >
                <Trash2 size={15} /> {isDeleting === job.id ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
