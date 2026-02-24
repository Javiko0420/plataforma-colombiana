import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import JobForm from "@/components/jobs/JobForm";

export default async function PublicarEmpleoPage() {
  // Verificación de sesión en el servidor
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/empleos/publicar");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Cabecera acogedora */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Publica una <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-500">oportunidad</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Comparte vacantes con la comunidad latina. Ayuda a otros a crecer profesionalmente en Australia.
          </p>
        </div>

        {/* Contenedor del formulario */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <JobForm />
        </div>

      </div>
    </div>
  );
}
