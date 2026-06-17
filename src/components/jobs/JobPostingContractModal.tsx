'use client'

import { useState, useRef, useEffect } from 'react'
import { X, FileText, ShieldCheck, DollarSign, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/lh/Button'

interface JobPostingContractModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  isSubmitting?: boolean
}

export default function JobPostingContractModal({
  isOpen,
  onClose,
  onAccept,
  isSubmitting = false,
}: JobPostingContractModalProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedNoPayment, setAgreedNoPayment] = useState(false)
  const [agreedSalaryCompliance, setAgreedSalaryCompliance] = useState(false)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const allChecked = agreedToTerms && agreedNoPayment && agreedSalaryCompliance

  useEffect(() => {
    if (!isOpen) {
      setAgreedToTerms(false)
      setAgreedNoPayment(false)
      setAgreedSalaryCompliance(false)
      setHasScrolledToBottom(false)
    }
  }, [isOpen])

  // Prevent body scroll + cerrar con Escape
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
      window.addEventListener('keydown', onKey)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', onKey)
      }
    }
    document.body.style.overflow = ''
  }, [isOpen, onClose])

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    if (atBottom) setHasScrolledToBottom(true)
  }

  if (!isOpen) return null

  const heading: React.CSSProperties = { fontFamily: 'var(--lh-font)', fontWeight: 600, color: 'var(--lh-fg)', paddingTop: 8, fontSize: 15 }
  const linkStyle: React.CSSProperties = { color: 'var(--lh-accent)', textDecoration: 'underline' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Términos de publicación de empleos">
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }} onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh', background: 'var(--lh-surface)', border: '1px solid var(--lh-border)', borderRadius: 20, boxShadow: 'var(--lh-shadow-lg)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{ padding: '18px 24px', background: 'linear-gradient(160deg,var(--lh-accent),var(--lh-accent-ink))', color: '#fff' }}
        >
          <div className="flex items-center gap-3">
            <FileText size={22} />
            <div>
              <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 17, fontWeight: 600, margin: 0 }}>
                Términos de publicación de empleos
              </h2>
              <p style={{ fontSize: 12, opacity: 0.85, margin: '2px 0 0' }}>
                Acuerdo para anunciantes &mdash; v2026-02-17
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" style={{ color: '#fff', background: 'transparent', border: 0, cursor: 'pointer', padding: 4, borderRadius: 8, display: 'inline-flex' }}>
            <X size={20} />
          </button>
        </div>

        {!hasScrolledToBottom && (
          <div style={{ padding: '8px 24px', fontSize: 12, textAlign: 'center', fontWeight: 500, background: 'color-mix(in oklch, var(--lh-warm) 16%, var(--lh-surface))', color: 'var(--lh-fg)', borderBottom: '1px solid var(--lh-border2)' }}>
            Desplázate hacia abajo para leer el contrato completo antes de aceptar.
          </div>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto"
          style={{ padding: '24px', fontSize: 14, lineHeight: 1.6, color: 'var(--lh-fg2)', display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <p style={{ fontSize: 12.5 }}>
            <strong>Latinterritory.com</strong> &bull; Última actualización: 17 de febrero de 2026
          </p>

          <p>
            Estos Términos de Publicación de Empleos (el &quot;Acuerdo&quot;) regulan la publicación de ofertas de empleo (cada una, un &quot;Anuncio&quot;) en latinterritory.com (la &quot;Plataforma&quot;) por parte de cualquier persona que publique como empleador, negocio, reclutador, representante autorizado u organización (el &quot;Anunciante&quot;).
          </p>
          <p>
            Al marcar la casilla de aceptación y/o publicar un Anuncio, confirmas que has leído y aceptas este Acuerdo.
          </p>

          <h3 style={heading}>1) Alcance y rol de la Plataforma</h3>
          <p>1.1. La Plataforma facilita un espacio para publicar Anuncios y permitir que los postulantes contacten al Anunciante o se postulen mediante enlaces a sitios externos.</p>
          <p>1.2. La Plataforma no es el empleador, no es una agencia de empleo, y no participa en la relación laboral, negociación o contratación entre Anunciante y postulantes.</p>
          <p>1.3. El Anunciante es el único responsable del Anuncio y del proceso de contratación.</p>
          <p>1.4. La Plataforma no realiza entrevistas, no selecciona candidatos, no negocia condiciones, no procesa pagos, no recibe CVs en nombre del anunciante y no formaliza contratos de trabajo. Cualquier relación laboral o acuerdo se realiza exclusivamente entre el Anunciante y el postulante fuera de la Plataforma.</p>

          <h3 style={heading}>2) Elegibilidad, identidad y autoridad del anunciante</h3>
          <p>2.1. Declaras que eres: (a) el empleador real, o (b) un reclutador/representante autorizado por el empleador, o (c) una ONG/entidad autorizada para difundir oportunidades.</p>
          <p>2.2. A solicitud de la Plataforma, aportarás evidencia razonable de tu identidad y autoridad.</p>

          <h3 style={heading}>3) Requisitos obligatorios del anuncio</h3>
          <p>3.1. Cada Anuncio debe ser claro, veraz y contener como mínimo: título del cargo, categoría, descripción, ubicación, tipo de empleo, salario por hora (AUD) (obligatorio), y al menos un medio de contacto.</p>
          <p>3.2. El Anunciante garantiza que la información de contacto publicada es correcta, está activa y será monitoreada.</p>

          <h3 style={heading}>4) Salario por hora: obligación y cumplimiento</h3>
          <p>4.1. Para publicar en la Plataforma, es obligatorio declarar un salario por hora (AUD).</p>
          <p>4.2. El Anunciante declara y garantiza que el salario por hora publicado: es real, actual y ofrecido de buena fe; y cumple como mínimo con las entitlements y mínimos legales aplicables (por ejemplo, el instrumento laboral aplicable o el salario mínimo nacional) en la jurisdicción donde se realizará el trabajo. <a href="https://www.fairwork.gov.au/" target="_blank" rel="noopener noreferrer" style={linkStyle}>Fair Work Ombudsman</a></p>
          <p>4.3. Está prohibido publicar salarios por debajo de los mínimos legales aplicables o utilizar el salario para inducir a error.</p>

          <h3 style={heading}>5) Prohibiciones (anti-scam, legalidad y seguridad)</h3>
          <p>Está prohibido publicar Anuncios que:</p>
          <ul className="list-disc pl-5" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li>5.1. Sean falsos, engañosos o confusos sobre salario, jornada, condiciones, ubicación, requisitos o naturaleza del rol.</li>
            <li>5.2. Incluyan lenguaje discriminatorio o criterios ilegales, salvo requisitos genuinos permitidos por ley.</li>
            <li>5.3. Soliciten pagos para postularse, depósitos, gift cards, cripto, &quot;fees&quot; sospechosos o cualquier práctica típica de estafa.</li>
            <li>5.4. Contengan enlaces acortados o enlaces maliciosos.</li>
            <li>5.5. Soliciten datos sensibles innecesarios a postulantes.</li>
            <li>5.6. Promuevan empleo ilegal o prácticas contrarias a normas laborales.</li>
          </ul>

          <h3 style={heading}>6) Enlaces externos, email y teléfono del anunciante</h3>
          <p>6.1. Si incluyes una URL externa, eres responsable del contenido, seguridad y cumplimiento del sitio de destino.</p>
          <p>6.2. El Anunciante garantiza que el email/teléfono publicados pertenecen al Anunciante o al empleador autorizado y que se usarán únicamente para fines de contratación.</p>
          <p>6.3. La Plataforma puede bloquear o rechazar enlaces que considere inseguros, fraudulentos o de riesgo.</p>

          <h3 style={heading}>7) Moderación, revisión y derecho de retirada</h3>
          <p>7.1. La Plataforma puede, a su discreción, revisar, rechazar, pausar, limitar visibilidad, ocultar o retirar cualquier Anuncio, sin previo aviso.</p>
          <p>7.2. La Plataforma puede solicitar información adicional para verificación.</p>
          <p>7.3. La Plataforma puede usar herramientas automatizadas (incluida IA) para detectar abuso o riesgo.</p>

          <h3 style={heading}>8) Reportes y cooperación</h3>
          <p>8.1. Los usuarios podrán reportar Anuncios.</p>
          <p>8.2. El Anunciante se compromete a cooperar de buena fe con solicitudes razonables de verificación y revisiones.</p>

          <h3 style={heading}>9) Garantías del anunciante</h3>
          <p>El Anunciante declara y garantiza que:</p>
          <ul className="list-disc pl-5" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li>9.1. Tiene derecho a publicar el Anuncio.</li>
            <li>9.2. El Anuncio y el proceso de contratación cumplen las leyes aplicables.</li>
            <li>9.3. El salario por hora publicado cumple mínimos legales aplicables.</li>
            <li>9.4. El Anuncio no es engañoso ni discriminatorio.</li>
            <li>9.5. Tiene derechos para usar logos/marcas/contenidos incluidos.</li>
          </ul>

          <h3 style={heading}>10) Indemnidad</h3>
          <p>En la medida permitida por la ley, el Anunciante acepta indemnizar y mantener indemne a la Plataforma y a su operador por reclamaciones, pérdidas, sanciones, costos y gastos derivados del Anuncio, el proceso de contratación, incumplimiento de este Acuerdo, violación de derechos de terceros, o enlaces/sistemas inseguros.</p>

          <h3 style={heading}>11) Limitación de responsabilidad</h3>
          <p>11.1. La Plataforma no garantiza resultados de contratación, postulantes, ni la disponibilidad/seguridad de sitios externos.</p>
          <p>11.2. Nada en este Acuerdo limita derechos o responsabilidades que no puedan excluirse legalmente.</p>

          <h3 style={heading}>12) Suspensión y terminación</h3>
          <p>La Plataforma puede suspender o terminar la capacidad del Anunciante de publicar Anuncios si detecta fraude, abuso, manipulación, incumplimientos o riesgos para usuarios.</p>

          <h3 style={heading}>13) Cambios del acuerdo</h3>
          <p>Podemos actualizar este Acuerdo. Publicaremos la versión vigente en <code style={{ padding: '1px 5px', borderRadius: 5, background: 'var(--lh-surface2)', fontFamily: 'var(--lh-mono)', fontSize: 12.5 }}>/job-posting-terms</code> y podremos solicitar re-aceptación al publicar o editar Anuncios.</p>

          <h3 style={heading}>14) Contacto</h3>
          <p>Para asuntos de privacidad y datos: <a href="mailto:privacy@latinterritory.com" style={linkStyle}>privacy@latinterritory.com</a></p>
        </div>

        {/* Checkboxes + CTA */}
        <div style={{ borderTop: '1px solid var(--lh-border)', padding: '20px 24px', background: 'var(--lh-surface2)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 11, cursor: 'pointer' }}>
            <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} style={{ marginTop: 2, width: 18, height: 18, flexShrink: 0, accentColor: 'var(--lh-accent)', cursor: 'pointer' }} />
            <span style={{ fontSize: 14, color: 'var(--lh-fg2)', display: 'inline-flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
              <ShieldCheck size={16} style={{ color: 'var(--lh-accent)', flexShrink: 0 }} />
              Acepto los{' '}
              <a href="/job-posting-terms" target="_blank" rel="noopener noreferrer" style={{ ...linkStyle, fontWeight: 500 }} onClick={(e) => e.stopPropagation()}>
                términos y condiciones
              </a>{' '}
              de publicación de empleos.
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 11, cursor: 'pointer' }}>
            <input type="checkbox" checked={agreedNoPayment} onChange={(e) => setAgreedNoPayment(e.target.checked)} style={{ marginTop: 2, width: 18, height: 18, flexShrink: 0, accentColor: 'var(--lh-accent)', cursor: 'pointer' }} />
            <span style={{ fontSize: 14, color: 'var(--lh-fg2)', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <CheckCircle2 size={16} style={{ color: 'var(--lh-green)', flexShrink: 0 }} />
              Confirmo que esta oferta no exige ningún pago a los candidatos.
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 11, cursor: 'pointer' }}>
            <input type="checkbox" checked={agreedSalaryCompliance} onChange={(e) => setAgreedSalaryCompliance(e.target.checked)} style={{ marginTop: 2, width: 18, height: 18, flexShrink: 0, accentColor: 'var(--lh-accent)', cursor: 'pointer' }} />
            <span style={{ fontSize: 14, color: 'var(--lh-fg2)', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <DollarSign size={16} style={{ color: 'var(--lh-warm)', flexShrink: 0 }} />
              Confirmo que el salario publicado cumple los mínimos legales aplicables (Award/EA o salario mínimo nacional).
            </span>
          </label>

          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <Button onClick={onClose} variant="secondary" size="md" style={{ flex: 1 }}>
              Cancelar
            </Button>
            <Button onClick={onAccept} disabled={!allChecked || isSubmitting} variant="primary" size="md" style={{ flex: 1 }}>
              {isSubmitting ? 'Guardando…' : 'Aceptar y continuar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
