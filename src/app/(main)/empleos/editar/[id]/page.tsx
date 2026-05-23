import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getJobOfferById } from "@/app/actions/jobActions";
import JobForm from "@/components/jobs/JobForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LtPageShell, LtPanel } from "@/components/lt";

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
    <LtPageShell maxWidth="2xl">
      <Link
        href="/perfil"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-80"
        style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a mi perfil
      </Link>

      <div className="text-center mb-8 space-y-2">
        <h1
          className="text-3xl md:text-4xl font-extrabold tracking-tight"
          style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
        >
          Editar{' '}
          <span style={{ color: 'var(--lt-terracota)' }}>oferta</span>
        </h1>
        <p
          className="text-lg"
          style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
        >
          Actualiza los datos de tu publicación. Los cambios se reflejarán inmediatamente en el muro.
        </p>
      </div>

      <LtPanel className="p-6 md:p-8">
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
      </LtPanel>
    </LtPageShell>
  );
}
