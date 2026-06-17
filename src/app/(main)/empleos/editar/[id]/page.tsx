import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getJobOfferById } from "@/app/actions/jobActions";
import JobForm from "@/components/jobs/JobForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditarEmpleoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/perfil");
  }

  const { id } = await params;
  const result = await getJobOfferById(id);

  if (result.error || !result.data) {
    redirect("/perfil");
  }

  const job = result.data;

  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)', paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div className="lh-container" style={{ maxWidth: 760 }}>
        <Link href="/perfil" className="lh-btn lh-btn--sm lh-btn--secondary" style={{ marginBottom: 24 }}>
          <ArrowLeft size={16} aria-hidden="true" /> Volver a mi perfil
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 className="lh-h1" style={{ fontSize: 'clamp(30px,4.5vw,42px)' }}>Editar oferta</h1>
          <p style={{ fontSize: 17, color: 'var(--lh-fg2)', margin: '14px auto 0', maxWidth: 520, lineHeight: 1.55 }}>
            Actualiza los datos de tu publicación. Los cambios se reflejarán inmediatamente en el muro.
          </p>
        </div>

        <div className="lh-card" style={{ padding: 'clamp(22px,4vw,32px)' }}>
          <JobForm
            mode="edit"
            jobId={job.id}
            initialData={{
              title: job.title,
              category: job.category,
              description: job.description,
              location: job.location,
              jobType: job.jobType,
              hourlyRate: job.hourlyRate ?? 0,
              email: job.email || '',
              phone: job.phone || '',
              externalLink: job.externalLink || '',
            }}
          />
        </div>
      </div>
    </div>
  );
}
