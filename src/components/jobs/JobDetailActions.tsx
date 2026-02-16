'use client';

import { useState } from 'react';
import { Share2, AlertTriangle, Mail, Phone, ExternalLink, CheckCircle2 } from 'lucide-react';

interface JobDetailActionsProps {
  job: {
    id: string;
    title: string;
    email: string | null;
    phone: string | null;
    externalLink: string | null;
    expiresAt: Date;
  };
}

export default function JobDetailActions({ job }: JobDetailActionsProps) {
  const [isContactRevealed, setIsContactRevealed] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Cálculo de días restantes
  const today = new Date();
  const expirationDate = new Date(job.expiresAt);
  const diffTime = Math.abs(expirationDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const handleShare = async () => {
    const shareData = {
      title: `${job.title} | Latin Territory`,
      text: `Mira esta oferta de empleo en Latin Territory: ${job.title}`,
      url: window.location.href,
    };

    try {
      // Intenta usar la API nativa de compartir (Mobile/Browsers modernos)
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copiar al portapapeles
        await navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error al compartir:', err);
    }
  };

  const handleReport = () => {
    const confirmReport = window.confirm(
      "¿Deseas reportar este anuncio al equipo de moderación por contenido inapropiado o fraudulento?"
    );
    if (confirmReport) {
      alert("Gracias. Nuestro equipo revisará esta publicación en breve.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
      
      {/* Indicador de Tiempo */}
      <div className="flex justify-center mb-6">
        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20">
          ⏳ Expira en {diffDays} {diffDays === 1 ? 'día' : 'días'}
        </span>
      </div>

      <div className="space-y-4">
        {/* Botón Principal de Contacto */}
        {!isContactRevealed ? (
          <button
            onClick={() => setIsContactRevealed(true)}
            className="w-full flex justify-center items-center py-3.5 px-6 rounded-full bg-gradient-to-r from-yellow-500 to-red-500 text-white font-bold text-lg hover:from-yellow-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg"
          >
            Ver Contacto
          </button>
        ) : (
          <div className="space-y-3 bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">
              Información del Reclutador
            </h4>
            
            {job.email && (
              <a href={`mailto:${job.email}`} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full"><Mail className="w-4 h-4" /></div>
                <span className="font-medium text-sm break-all">{job.email}</span>
              </a>
            )}
            
            {job.phone && (
              <a href={`tel:${job.phone}`} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full"><Phone className="w-4 h-4" /></div>
                <span className="font-medium text-sm">{job.phone}</span>
              </a>
            )}
            
            {job.externalLink && (
              <a href={job.externalLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full"><ExternalLink className="w-4 h-4" /></div>
                <span className="font-medium text-sm line-clamp-1">Enlace de postulación</span>
              </a>
            )}
          </div>
        )}

        {/* Botón de Compartir */}
        <button
          onClick={handleShare}
          className="w-full flex justify-center items-center gap-2 py-3 px-6 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {copySuccess ? (
            <><CheckCircle2 className="w-5 h-5 text-green-500" /> ¡Enlace copiado!</>
          ) : (
            <><Share2 className="w-5 h-5" /> Compartir Oferta</>
          )}
        </button>
      </div>

      {/* Reporte sutil (Botón Ghost) */}
      <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
        <button
          onClick={handleReport}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors bg-transparent"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Reportar anuncio sospechoso
        </button>
      </div>
    </div>
  );
}
