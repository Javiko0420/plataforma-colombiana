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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Botón volver */}
        <Link
          href="/perfil"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mi perfil
        </Link>

        {/* Cabecera */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Editar <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-500">oferta</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Actualiza los datos de tu publicación. Los cambios se reflejarán inmediatamente en el muro.
          </p>
        </div>

        {/* Formulario en modo edición */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
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
