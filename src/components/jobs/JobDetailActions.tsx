'use client';

import { useState } from 'react';
import { Share2, AlertTriangle, Mail, Phone, ExternalLink, CheckCircle2, Clock } from 'lucide-react';
import { LtButton } from '@/components/lt/Button';
import { HandDrawnBox } from '@/components/lt/HandDrawnBox';

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

  const today = new Date();
  const expirationDate = new Date(job.expiresAt);
  const diffDays = Math.ceil(Math.abs(expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const handleShare = async () => {
    const shareData = {
      title: `${job.title} | Latin Territory`,
      text: `Mira esta oferta de empleo en Latin Territory: ${job.title}`,
      url: window.location.href,
    };
    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error al compartir:', err);
    }
  };

  const handleReport = () => {
    const confirmed = window.confirm(
      '¿Deseas reportar este anuncio al equipo de moderación por contenido inapropiado o fraudulento?'
    );
    if (confirmed) {
      alert('Gracias. Nuestro equipo revisará esta publicación en breve.');
    }
  };

  return (
    <div
      className="rounded-[var(--lt-radius-lg)] border-[2.2px] border-[var(--lt-ink)] p-6 sticky top-24"
      style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker-lg)' }}
    >
      {/* Indicador de tiempo */}
      <div className="flex justify-center mb-6">
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[var(--lt-radius-pill)] border-[1.6px] border-[var(--lt-ink)] text-sm font-semibold"
          style={{
            background: 'var(--lt-sun)',
            color: 'var(--lt-ink)',
            boxShadow: 'var(--lt-shadow-sticker)',
          }}
          aria-label={`Expira en ${diffDays} días`}
        >
          <Clock className="w-4 h-4" aria-hidden="true" style={{ color: 'var(--lt-sun-core)' }} />
          Expira en {diffDays} {diffDays === 1 ? 'día' : 'días'}
        </span>
      </div>

      <div className="space-y-3">
        {/* Botón principal de contacto */}
        {!isContactRevealed ? (
          <LtButton
            variant="sticker"
            tone="terracota"
            size="md"
            rotate={-1}
            className="w-full justify-center"
            onClick={() => setIsContactRevealed(true)}
            aria-expanded={false}
          >
            Ver Contacto
          </LtButton>
        ) : (
          <HandDrawnBox padding="1rem" aria-live="polite">
            <h4
              className="text-xs font-bold uppercase tracking-wider mb-3 text-center"
              style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
            >
              Información del Reclutador
            </h4>
            <div className="space-y-2">
              {job.email && (
                <a
                  href={`mailto:${job.email}`}
                  className="flex items-center gap-3 p-2 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] transition-all hover:-translate-y-0.5"
                  style={{ background: 'var(--lt-bg)', color: 'var(--lt-ink)', boxShadow: '2px 2px 0 var(--lt-ink)' }}
                >
                  <span
                    className="p-1.5 rounded-[var(--lt-radius-sm)] border border-[var(--lt-ink)] shrink-0"
                    style={{ background: 'var(--lt-sun)', color: 'var(--lt-ink)' }}
                    aria-hidden="true"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-medium text-sm break-all">{job.email}</span>
                </a>
              )}
              {job.phone && (
                <a
                  href={`tel:${job.phone}`}
                  className="flex items-center gap-3 p-2 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] transition-all hover:-translate-y-0.5"
                  style={{ background: 'var(--lt-bg)', color: 'var(--lt-ink)', boxShadow: '2px 2px 0 var(--lt-ink)' }}
                >
                  <span
                    className="p-1.5 rounded-[var(--lt-radius-sm)] border border-[var(--lt-ink)] shrink-0"
                    style={{ background: 'var(--lt-verde)', color: 'var(--lt-paper)' }}
                    aria-hidden="true"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-medium text-sm">{job.phone}</span>
                </a>
              )}
              {job.externalLink && (
                <a
                  href={job.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] transition-all hover:-translate-y-0.5"
                  style={{ background: 'var(--lt-bg)', color: 'var(--lt-ink)', boxShadow: '2px 2px 0 var(--lt-ink)' }}
                >
                  <span
                    className="p-1.5 rounded-[var(--lt-radius-sm)] border border-[var(--lt-ink)] shrink-0"
                    style={{ background: 'var(--lt-accent)', color: 'var(--lt-paper)' }}
                    aria-hidden="true"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-medium text-sm line-clamp-1">Enlace de postulación</span>
                </a>
              )}
            </div>
          </HandDrawnBox>
        )}

        {/* Compartir */}
        <LtButton
          variant="outline"
          tone="ink"
          size="md"
          rotate={0.8}
          className="w-full justify-center"
          onClick={handleShare}
          iconLeft={
            copySuccess
              ? <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--lt-verde)' }} />
              : <Share2 className="w-5 h-5" />
          }
        >
          {copySuccess ? '¡Enlace copiado!' : 'Compartir Oferta'}
        </LtButton>
      </div>

      {/* Reporte */}
      <div className="mt-6 pt-4 border-t-[1.6px] border-[var(--lt-ink)]/20 text-center">
        <button
          onClick={handleReport}
          className="inline-flex items-center gap-1.5 text-xs transition-colors bg-transparent focus:outline-none focus:underline"
          style={{ color: 'var(--lt-ink-soft)' }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--lt-terracota)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--lt-ink-soft)')}
        >
          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
          Reportar anuncio sospechoso
        </button>
      </div>
    </div>
  );
}
