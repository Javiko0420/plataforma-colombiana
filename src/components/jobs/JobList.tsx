import JobCard, { type JobCardData } from './JobCard';
import { Briefcase } from 'lucide-react';
import { Reveal } from '@/components/lh/Reveal';
import { EmptyState } from '@/components/lh/EmptyState';
import { Button } from '@/components/lh/Button';

export default function JobList({ jobs }: { jobs: JobCardData[] }) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={<Briefcase size={26} />}
        title="No se encontraron ofertas"
        description="No hay oportunidades activas con estos filtros en este momento. Intenta con otros criterios o vuelve más tarde."
        action={
          <Button href="/empleos/publicar" variant="primary" size="md">
            Publicar una oferta
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-max">
      {jobs.map((job, i) => (
        <Reveal key={job.id} delay={Math.min(i * 40, 240)}>
          <JobCard job={job} />
        </Reveal>
      ))}
    </div>
  );
}
