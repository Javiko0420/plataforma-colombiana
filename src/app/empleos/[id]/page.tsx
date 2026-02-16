import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Briefcase, MapPin, Clock, Calendar } from 'lucide-react';
import JobDetailActions from '@/components/jobs/JobDetailActions';

// Generación Dinámica de Metadata SEO / Open Graph
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const job = await prisma.jobOffer.findUnique({
    where: { id: params.id },
  });

  // Si no existe, está borrada o expirada, devolver fallback seguro
  if (!job || job.deletedAt !== null || job.expiresAt < new Date()) {
    return {
      title: 'Oferta no disponible | Latin Territory',
      description: 'Esta oferta de empleo ya no se encuentra disponible en nuestra plataforma.',
    };
  }

  // Generar descripción corta para SEO (max 160 caracteres)
  const shortDescription = job.description.length > 150 
    ? `${job.description.substring(0, 150)}...` 
    : job.description;

  const pageTitle = `${job.title} en Latin Territory`;

  return {
    title: pageTitle,
    description: shortDescription,
    openGraph: {
      title: pageTitle,
      description: shortDescription,
      url: `https://tudominio.com/empleos/${job.id}`,
      siteName: 'Latin Territory',
      locale: 'es_ES',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: shortDescription,
    },
  };
}

// Server Component Principal
export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await prisma.jobOffer.findUnique({
    where: { id: params.id },
  });

  // Validar existencia y vigencia
  if (!job || job.deletedAt !== null || job.expiresAt < new Date()) {
    notFound();
  }

  // Formatear fecha de creación
  const postedDate = new Intl.DateTimeFormat('es-ES', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  }).format(new Date(job.createdAt));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Detalles Principales */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Cabecera de la Oferta */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-r from-blue-500 to-red-400 text-white shadow-md shrink-0">
                  <Briefcase className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                    {job.title}
                  </h1>
                </div>
              </div>

              {/* Tags de metadatos del empleo */}
              <div className="flex flex-wrap gap-3 text-sm font-medium text-gray-600 dark:text-gray-300 mb-8 border-b border-gray-100 dark:border-gray-700 pb-8">
                <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/50">
                  <Briefcase className="w-4 h-4" /> {job.category}
                </span>
                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg">
                  <MapPin className="w-4 h-4" /> {job.location}
                </span>
                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4" /> {job.jobType}
                </span>
                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg">
                  <Calendar className="w-4 h-4" /> Publicado el {postedDate}
                </span>
              </div>

              {/* Cuerpo de la Descripción */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Descripción del Puesto
                </h2>
                <div className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>
            </div>
            
            {/* Mensaje comunitario de confianza */}
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-6 text-center">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Al postularte, recuerda mencionar que encontraste esta oferta a través de la comunidad de <span className="font-bold">Latin Territory</span>. ¡Mucho éxito en tu proceso!
              </p>
            </div>

          </div>

          {/* Columna Derecha: Sidebar de Acción */}
          <div className="lg:col-span-1 relative">
            <JobDetailActions 
              job={{
                id: job.id,
                title: job.title,
                email: job.email,
                phone: job.phone,
                externalLink: job.externalLink,
                expiresAt: job.expiresAt
              }} 
            />
          </div>

        </div>

      </div>
    </div>
  );
}
