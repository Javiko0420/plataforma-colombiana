import { JobOffer } from '@prisma/client';
import Link from 'next/link';
import { Clock, DollarSign } from 'lucide-react';

export default function JobCard({ job }: { job: JobOffer }) {
  // Calcular días restantes
  const today = new Date();
  const expirationDate = new Date(job.expiresAt);
  const diffTime = Math.abs(expirationDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <Link href={`/empleos/${job.id}`} className="block">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {job.title}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                {job.category}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                {job.jobType}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {job.location}
              </span>
              {job.hourlyRate != null && (
                <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  <DollarSign className="w-3 h-3" />
                  {job.hourlyRate.toFixed(2)}/hr
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0 ml-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
              <Clock className="w-3 h-3" />
              {diffDays} días
            </span>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed line-clamp-3 flex-grow">
          {job.description}
        </p>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="w-full inline-flex justify-center px-6 py-2.5 bg-blue-600 group-hover:bg-blue-700 text-white font-medium rounded-xl transition-colors text-center">
            Ver detalles
          </span>
        </div>
      </div>
    </Link>
  );
}
