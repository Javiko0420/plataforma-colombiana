'use client'

import { useState, useRef, useEffect } from 'react'
import { X, FileText, ShieldCheck, DollarSign, CheckCircle2 } from 'lucide-react'

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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    if (atBottom) setHasScrolledToBottom(true)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-lg font-bold text-white">
                Términos de Publicación de Empleos
              </h2>
              <p className="text-blue-100 text-xs">
                Acuerdo para Anunciantes &mdash; v2026-02-17
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scroll hint */}
        {!hasScrolledToBottom && (
          <div className="px-6 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 text-xs text-center font-medium">
            Desplázate hacia abajo para leer el contrato completo antes de aceptar.
          </div>
        )}

        {/* Contract body */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-4"
        >
          {/* ── ES ── */}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            <strong>Latinterritory.com</strong> &bull; Última actualización: 17 de febrero de 2026
          </p>

          <p>
            Estos Términos de Publicación de Empleos (el &quot;Acuerdo&quot;) regulan la publicación de ofertas de empleo (cada una, un &quot;Anuncio&quot;) en latinterritory.com (la &quot;Plataforma&quot;) por parte de cualquier persona que publique como empleador, negocio, reclutador, representante autorizado u organización (el &quot;Anunciante&quot;).
          </p>
          <p>
            Al marcar la casilla de aceptación y/o publicar un Anuncio, confirmas que has leído y aceptas este Acuerdo.
          </p>

          <h3 className="font-bold text-gray-900 dark:text-white pt-2">1) Alcance y rol de la Plataforma</h3>
          <p>1.1. La Plataforma facilita un espacio para publicar Anuncios y permitir que los postulantes contacten al Anunciante o se postulen mediante enlaces a sitios externos.</p>
          <p>1.2. La Plataforma no es el empleador, no es una agencia de empleo, y no participa en la relación laboral, negociación o contratación entre Anunciante y postulantes.</p>
          <p>1.3. El Anunciante es el único responsable del Anuncio y del proceso de contratación.</p>
          <p>1.4. La Plataforma no realiza entrevistas, no selecciona candidatos, no negocia condiciones, no procesa pagos, no recibe CVs en nombre del anunciante y no formaliza contratos de trabajo. Cualquier relación laboral o acuerdo se realiza exclusivamente entre el Anunciante y el postulante fuera de la Plataforma.</p>

          <h3 className="font-bold text-gray-900 dark:text-white pt-2">2) Elegibilidad, identidad y autoridad del anunciante</h3>
          <p>2.1. Declaras que eres: (a) el empleador real, o (b) un reclutador/representante autorizado por el empleador, o (c) una ONG/entidad autorizada para difundir oportunidades.</p>
          <p>2.2. A solicitud de la Plataforma, aportarás evidencia razonable de tu identidad y autoridad.</p>

          <h3 className="font-bold text-gray-900 dark:text-white pt-2">3) Requisitos obligatorios del anuncio</h3>
          <p>3.1. Cada Anuncio debe ser claro, veraz y contener como mínimo: título del cargo, categoría, descripción, ubicación, tipo de empleo, salario por hora (AUD) (obligatorio), y al menos un medio de contacto.</p>
          <p>3.2. El Anunciante garantiza que la información de contacto publicada es correcta, está activa y será monitoreada.</p>

          <h3 className="font-bold text-gray-900 dark:text-white pt-2">4) Salario por hora: obligación y cumplimiento</h3>
          <p>4.1. Para publicar en la Plataforma, es obligatorio declarar un salario por hora (AUD).</p>
          <p>4.2. El Anunciante declara y garantiza que el salario por hora publicado: es real, actual y ofrecido de buena fe; y cumple como mínimo con las entitlements y mínimos legales aplicables (por ejemplo, el instrumento laboral aplicable o el salario mínimo nacional) en la jurisdicción donde se realizará el trabajo. <a href="https://www.fairwork.gov.au/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">Fair Work Ombudsman</a></p>
          <p>4.3. Está prohibido publicar salarios por debajo de los mínimos legales aplicables o utilizar el salario para inducir a error.</p>

          <h3 className="font-bold text-gray-900 dark:text-white pt-2">5) Prohibiciones (anti-scam, legalidad y seguridad)</h3>
          <p>Está prohibido publicar Anuncios que:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>5.1. Sean falsos, engañosos o confusos sobre salario, jornada, condiciones, ubicación, requisitos o naturaleza del rol.</li>
            <li>5.2. Incluyan lenguaje discriminatorio o criterios ilegales, salvo requisitos genuinos permitidos por ley.</li>
            <li>5.3. Soliciten pagos para postularse, depósitos, gift cards, cripto, &quot;fees&quot; sospechosos o cualquier práctica típica de estafa.</li>
            <li>5.4. Contengan enlaces acortados o enlaces maliciosos.</li>
            <li>5.5. Soliciten datos sensibles innecesarios a postulantes.</li>
            <li>5.6. Promuevan empleo ilegal o prácticas contrarias a normas laborales.</li>
          </ul>

          <h3 className="font-bold text-gray-900 dark:text-white pt-2">6) Enlaces externos, email y teléfono del anunciante</h3>
          <p>6.1. Si incluyes una URL externa, eres responsable del contenido, seguridad y cumplimiento del sitio de destino.</p>
          <p>6.2. El Anunciante garantiza que el email/teléfono publicados pertenecen al Anunciante o al empleador autorizado y que se usarán únicamente para fines de contratación.</p>
          <p>6.3. La Plataforma puede bloquear o rechazar enlaces que considere inseguros, fraudulentos o de riesgo.</p>

          <h3 className="font-bold text-gray-900 dark:text-white pt-2">7) Moderación, revisión y derecho de retirada</h3>
          <p>7.1. La Plataforma puede, a su discreción, revisar, rechazar, pausar, limitar visibilidad, ocultar o retirar cualquier Anuncio, sin previo aviso.</p>
          <p>7.2. La Plataforma puede solicitar información adicional para verificación.</p>
          <p>7.3. La Plataforma puede usar herramientas automatizadas (incluida IA) para detectar abuso o riesgo.</p>

          <h3 className="font-bold text-gray-900 dark:text-white pt-2">8) Reportes y cooperación</h3>
          <p>8.1. Los usuarios podrán reportar Anuncios.</p>
          <p>8.2. El Anunciante se compromete a cooperar de buena fe con solicitudes razonables de verificación y revisiones.</p>

          <h3 className="font-bold text-gray-900 dark:text-white pt-2">9) Garantías del anunciante</h3>
          <p>El Anunciante declara y garantiza que:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>9.1. Tiene derecho a publicar el Anuncio.</li>
            <li>9.2. El Anuncio y el proceso de contratación cumplen las leyes aplicables.</li>
            <li>9.3. El salario por hora publicado cumple mínimos legales aplicables.</li>
            <li>9.4. El Anuncio no es engañoso ni discriminatorio.</li>
            <li>9.5. Tiene derechos para usar logos/marcas/contenidos incluidos.</li>
          </ul>

          <h3 className="font-bold text-gray-900 dark:text-white pt-2">10) Indemnidad</h3>
          <p>En la medida permitida por la ley, el Anunciante acepta indemnizar y mantener indemne a la Plataforma y a su operador por reclamaciones, pérdidas, sanciones, costos y gastos derivados del Anuncio, el proceso de contratación, incumplimiento de este Acuerdo, violación de derechos de terceros, o enlaces/sistemas inseguros.</p>

          <h3 className="font-bold text-gray-900 dark:text-white pt-2">11) Limitación de responsabilidad</h3>
          <p>11.1. La Plataforma no garantiza resultados de contratación, postulantes, ni la disponibilidad/seguridad de sitios externos.</p>
          <p>11.2. Nada en este Acuerdo limita derechos o responsabilidades que no puedan excluirse legalmente.</p>

          <h3 className="font-bold text-gray-900 dark:text-white pt-2">12) Suspensión y terminación</h3>
          <p>La Plataforma puede suspender o terminar la capacidad del Anunciante de publicar Anuncios si detecta fraude, abuso, manipulación, incumplimientos o riesgos para usuarios.</p>

          <h3 className="font-bold text-gray-900 dark:text-white pt-2">13) Cambios del acuerdo</h3>
          <p>Podemos actualizar este Acuerdo. Publicaremos la versión vigente en <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">/job-posting-terms</code> y podremos solicitar re-aceptación al publicar o editar Anuncios.</p>

          <h3 className="font-bold text-gray-900 dark:text-white pt-2">14) Contacto</h3>
          <p>Para asuntos de privacidad y datos: <a href="mailto:privacy@latinterritory.com" className="text-blue-600 dark:text-blue-400 underline">privacy@latinterritory.com</a></p>
        </div>

        {/* Checkboxes + CTA */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-5 bg-gray-50 dark:bg-gray-900/50 space-y-4">

          {/* Checkbox 1: Terms */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800 shrink-0"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
              Acepto los{' '}
              <a
                href="/job-posting-terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline font-medium hover:text-blue-700"
                onClick={(e) => e.stopPropagation()}
              >
                términos y condiciones
              </a>{' '}
              de publicación de empleos.
            </span>
          </label>

          {/* Checkbox 2: No payment */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreedNoPayment}
              onChange={(e) => setAgreedNoPayment(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800 shrink-0"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              Confirmo que esta oferta no exige ningún pago a los candidatos.
            </span>
          </label>

          {/* Checkbox 3: Salary compliance */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreedSalaryCompliance}
              onChange={(e) => setAgreedSalaryCompliance(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800 shrink-0"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-500 shrink-0" />
              Confirmo que el salario publicado cumple los mínimos legales aplicables (Award/EA o salario mínimo nacional).
            </span>
          </label>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={onAccept}
              disabled={!allChecked || isSubmitting}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              {isSubmitting ? 'Guardando...' : 'Aceptar y continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
