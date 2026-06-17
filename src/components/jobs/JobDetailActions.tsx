'use client';

import { useState } from 'react';
import { Share2, AlertTriangle, Mail, Phone, ExternalLink, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/lh/Button';

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

const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`;

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

  const contactRow: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 11, padding: '11px 12px',
    borderRadius: 12, border: '1px solid var(--lh-border)', background: 'var(--lh-surface)',
    color: 'var(--lh-fg)', textDecoration: 'none', fontSize: 14, fontWeight: 500,
  };
  const contactIcon = (bg: string): React.CSSProperties => ({
    width: 30, height: 30, flexShrink: 0, borderRadius: 8, display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', background: tint(bg), color: bg,
  });

  return (
    <div className="lh-card" style={{ padding: 24, position: 'sticky', top: 88 }}>
      {/* Indicador de tiempo */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
        <span
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 99, background: tint('var(--lh-warm)'), color: 'var(--lh-warm)', fontSize: 13, fontWeight: 600 }}
          aria-label={`Expira en ${diffDays} días`}
        >
          <Clock size={15} aria-hidden="true" />
          Expira en {diffDays} {diffDays === 1 ? 'día' : 'días'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Contacto */}
        {!isContactRevealed ? (
          <Button variant="primary" size="md" style={{ width: '100%' }} onClick={() => setIsContactRevealed(true)} aria-expanded={false}>
            Ver contacto
          </Button>
        ) : (
          <div aria-live="polite" style={{ borderRadius: 14, border: '1px solid var(--lh-border)', background: 'var(--lh-surface2)', padding: 16 }}>
            <h4 style={{ fontFamily: 'var(--lh-mono)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--lh-fg3)', textAlign: 'center', margin: '0 0 12px' }}>
              Información del reclutador
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {job.email && (
                <a href={`mailto:${job.email}`} style={contactRow}>
                  <span aria-hidden="true" style={contactIcon('var(--lh-accent)')}><Mail size={15} /></span>
                  <span style={{ wordBreak: 'break-all' }}>{job.email}</span>
                </a>
              )}
              {job.phone && (
                <a href={`tel:${job.phone}`} style={contactRow}>
                  <span aria-hidden="true" style={contactIcon('var(--lh-green)')}><Phone size={15} /></span>
                  <span>{job.phone}</span>
                </a>
              )}
              {job.externalLink && (
                <a href={job.externalLink} target="_blank" rel="noopener noreferrer" style={contactRow}>
                  <span aria-hidden="true" style={contactIcon('var(--lh-terra)')}><ExternalLink size={15} /></span>
                  <span className="line-clamp-1">Enlace de postulación</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Compartir */}
        <Button variant="secondary" size="md" style={{ width: '100%' }} onClick={handleShare}>
          {copySuccess
            ? <><CheckCircle2 size={18} style={{ color: 'var(--lh-green)' }} /> ¡Enlace copiado!</>
            : <><Share2 size={18} /> Compartir oferta</>}
        </Button>
      </div>

      {/* Reporte */}
      <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid var(--lh-border2)', textAlign: 'center' }}>
        <button
          onClick={handleReport}
          className="lh-report-btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--lh-fg3)', background: 'transparent', border: 0, cursor: 'pointer', fontFamily: 'var(--lh-font)' }}
        >
          <AlertTriangle size={14} aria-hidden="true" />
          Reportar anuncio sospechoso
        </button>
      </div>
    </div>
  );
}
