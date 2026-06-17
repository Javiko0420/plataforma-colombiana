'use client'

import { useState, useRef, useEffect } from 'react'
import { X, FileText, ShieldCheck, UserCheck, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/lh/Button'

interface EventPostingContractModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  isSubmitting?: boolean
}

export default function EventPostingContractModal({
  isOpen,
  onClose,
  onAccept,
  isSubmitting = false,
}: EventPostingContractModalProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedIsOrganiser, setAgreedIsOrganiser] = useState(false)
  const [agreedAgeCompliance, setAgreedAgeCompliance] = useState(false)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const allChecked = agreedToTerms && agreedIsOrganiser && agreedAgeCompliance

  useEffect(() => {
    if (!isOpen) {
      setAgreedToTerms(false)
      setAgreedIsOrganiser(false)
      setAgreedAgeCompliance(false)
      setHasScrolledToBottom(false)
    }
  }, [isOpen])

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Términos de publicación de eventos">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }} onClick={onClose} />

      <div
        className="relative w-full max-w-3xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh', background: 'var(--lh-surface)', border: '1px solid var(--lh-border)', borderRadius: 20, boxShadow: 'var(--lh-shadow-lg)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '18px 24px', background: 'linear-gradient(160deg,var(--lh-warm),#b98a2e)', color: '#3a2c0a' }}>
          <div className="flex items-center gap-3">
            <FileText size={22} />
            <div>
              <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 17, fontWeight: 600, margin: 0 }}>
                Términos de publicación de eventos
              </h2>
              <p style={{ fontSize: 12, opacity: 0.8, margin: '2px 0 0' }}>
                Acuerdo para anunciantes &mdash; v2026-02-17
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" style={{ color: '#3a2c0a', background: 'transparent', border: 0, cursor: 'pointer', padding: 4, borderRadius: 8, display: 'inline-flex' }}>
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
            Estos Términos de Publicación de Eventos (el &quot;Acuerdo&quot;) regulan la publicación de anuncios de eventos (cada uno, un &quot;Evento&quot;) en latinterritory.com (la &quot;Plataforma&quot;) por parte de cualquier usuario que publique como organizador, promotor, venue, representante autorizado, negocio u organización (el &quot;Anunciante&quot;).
          </p>
          <p>
            Al marcar la casilla de aceptación y/o publicar un Evento, confirmas que has leído y aceptas este Acuerdo.
          </p>

          <h3 style={heading}>1) Alcance y rol de la Plataforma</h3>
          <p>1.1. La Plataforma es un servicio de listado y difusión de Eventos.</p>
          <p>1.2. La Plataforma no organiza eventos, no vende entradas, no procesa pagos de tickets, y no participa en la relación entre el Anunciante y los asistentes.</p>
          <p>1.3. El Anunciante es el único responsable del Evento, su realización, cambios/cancelaciones, seguridad, control de edad/ID, venta de entradas (si aplica) y reembolsos (si aplica).</p>
          <p>1.4. El enlace de tickets o registro (si existe) dirige a un sitio de terceros bajo responsabilidad del Anunciante.</p>

          <h3 style={heading}>2) Elegibilidad, identidad y autoridad del Anunciante</h3>
          <p>2.1. Declaras que eres: (a) el organizador/venue/promotor real del Evento, o (b) un representante autorizado por el organizador/venue/promotor, o (c) una organización autorizada para difundir el Evento.</p>
          <p>2.2. A solicitud de la Plataforma, aportarás evidencia razonable de tu identidad y autoridad (por ejemplo, verificación de email/teléfono, prueba de control del dominio, documentación del negocio/organización, etc.).</p>
          <p>2.3. La Plataforma puede limitar o condicionar la publicación de Eventos para cuentas nuevas, por prevención de fraude o seguridad.</p>

          <h3 style={heading}>3) Información obligatoria del Evento</h3>
          <p>3.1. Cada Evento debe ser claro, veraz y contener como mínimo: Título del Evento, Categoría, Descripción (sin claims engañosos), Fecha y hora de inicio, Ubicación, Organizador/Promotor, Restricción de edad (si aplica), Precio, y al menos un canal de contacto.</p>
          <p>3.2. Si el Evento es de pago, debes incluir un enlace de tickets válido (sin enlaces acortados). Si el Evento es gratuito, puedes incluir un enlace de registro/RSVP opcional, o indicar claramente &quot;Entrada gratuita&quot;.</p>
          <p>3.3. Garantizas que los datos de contacto y enlaces publicados son correctos, actuales y monitoreados.</p>

          <h3 style={heading}>4) Precio: reglas de transparencia</h3>
          <p>4.1. Si eliges mostrar precio, debe ser real, actualizado y no engañoso.</p>
          <p>4.2. Debes indicar claramente si el precio es &quot;desde / from&quot;, &quot;entrada general&quot;, &quot;VIP / early bird&quot;, o similar (cuando aplique).</p>
          <p>4.3. Si existen cargos adicionales inevitables (fees del ticketing/booking), debes evitar presentar el precio de forma que confunda. Recomendación: incluir una nota &quot;+ fees may apply&quot; cuando corresponda.</p>

          <h3 style={heading}>5) Restricciones de edad, alcohol y cumplimiento</h3>
          <p>5.1. Si el Evento es 18+ (o tiene alcohol), el Anunciante declara y garantiza que: el Evento cumple requisitos de edad y normas aplicables; el organizador/venue gestionará control de ID y medidas de seguridad apropiadas; se gestionarán permisos/licencias que correspondan.</p>
          <p>5.2. Está prohibido usar la Plataforma para promover actividades ilegales o peligrosas.</p>

          <h3 style={heading}>6) Imágenes y propiedad intelectual</h3>
          <p>6.1. Si subes posters o imágenes, declaras que tienes derechos/licencia para usarlas y no infringen derechos de terceros.</p>
          <p>6.2. La Plataforma puede rechazar o retirar imágenes que infrinjan derechos, contengan material ilegal, o representen riesgo para usuarios.</p>

          <h3 style={heading}>7) Prohibiciones (anti-fraude y seguridad)</h3>
          <p>No puedes publicar Eventos que:</p>
          <ul className="list-disc pl-5" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li>7.1. Sean falsos, engañosos o suplantación (por ejemplo, &quot;evento oficial&quot; sin autorización).</li>
            <li>7.2. Incluyan enlaces acortados, enlaces maliciosos o phishing.</li>
            <li>7.3. Soliciten pagos por medios sospechosos (gift cards, cripto, depósitos extraños) o prácticas típicas de estafa.</li>
            <li>7.4. Contengan odio, acoso, doxxing o datos personales sensibles de terceros.</li>
            <li>7.5. Promuevan contenido ilegal o extremadamente ofensivo.</li>
          </ul>

          <h3 style={heading}>8) Enlaces externos (ticketing/registro)</h3>
          <p>8.1. Si publicas un enlace externo, eres responsable de la seguridad, disponibilidad y cumplimiento del sitio de destino.</p>
          <p>8.2. La Plataforma no controla ni respalda sitios de terceros ni garantiza que el enlace sea seguro, aunque aplicamos medidas razonables de prevención.</p>

          <h3 style={heading}>9) Moderación, revisión y derecho de retirada</h3>
          <p>9.1. La Plataforma puede, a su discreción, revisar, rechazar, pausar, limitar visibilidad, ocultar o retirar cualquier Evento sin previo aviso si recibe reportes, detecta señales de fraude/estafa, considera que viola este Acuerdo o políticas, o existe riesgo para usuarios o cumplimiento legal.</p>
          <p>9.2. La Plataforma puede solicitar información adicional para verificar legitimidad o corregir información.</p>
          <p>9.3. La Plataforma puede usar herramientas automatizadas (incluida IA) y revisión humana para moderación.</p>

          <h3 style={heading}>10) Reportes y cooperación</h3>
          <p>10.1. Los usuarios podrán reportar Eventos (por ejemplo: scam, suplantación, información engañosa, contenido ofensivo).</p>
          <p>10.2. El Anunciante se compromete a cooperar de buena fe con solicitudes razonables de verificación y corrección.</p>

          <h3 style={heading}>11) Garantías del Anunciante</h3>
          <p>El Anunciante declara y garantiza que:</p>
          <ul className="list-disc pl-5" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li>11.1. Tiene derecho y autoridad para publicar el Evento y usar el material asociado.</li>
            <li>11.2. La información del Evento es precisa y se mantendrá actualizada (incluye cambios de horario, venue, cancelaciones).</li>
            <li>11.3. Gestionará cancelaciones, reembolsos y soporte a asistentes conforme a sus políticas y leyes aplicables.</li>
          </ul>

          <h3 style={heading}>12) Indemnidad</h3>
          <p>En la medida permitida por la ley, el Anunciante acepta indemnizar y mantener indemne a la Plataforma y a su operador por reclamaciones, pérdidas, sanciones, costos y gastos (incluidos honorarios legales razonables) derivados de: el Evento o su publicación, la realización/operación del Evento, cancelaciones/reembolsos, infracciones de propiedad intelectual, enlaces externos inseguros, o incumplimiento de este Acuerdo.</p>

          <h3 style={heading}>13) Limitación de responsabilidad</h3>
          <p>13.1. En la medida permitida por la ley, la Plataforma no garantiza asistencia, resultados, ni la realización del Evento.</p>
          <p>13.2. Nada en este Acuerdo limita derechos o responsabilidades que no puedan excluirse legalmente.</p>

          <h3 style={heading}>14) Suspensión y terminación</h3>
          <p>La Plataforma puede suspender o terminar la capacidad del Anunciante de publicar Eventos por fraude, abuso, incumplimiento o riesgo para usuarios.</p>

          <h3 style={heading}>15) Cambios del acuerdo</h3>
          <p>Podemos actualizar este Acuerdo. Publicaremos la versión vigente en <code style={{ padding: '1px 5px', borderRadius: 5, background: 'var(--lh-surface2)', fontFamily: 'var(--lh-mono)', fontSize: 12.5 }}>/event-posting-terms</code> y podremos solicitar re-aceptación al publicar o editar si los cambios son materiales.</p>

          <h3 style={heading}>16) Contacto</h3>
          <p>Para asuntos de privacidad y datos: <a href="mailto:privacy@latinterritory.com" style={linkStyle}>privacy@latinterritory.com</a></p>

          {/* English version divider */}
          <div style={{ borderTop: '1px solid var(--lh-border)', margin: '12px 0' }} />

          <p style={{ fontSize: 12.5 }}>
            <strong>Latinterritory.com</strong> &bull; Last updated: 17 February 2026
          </p>

          <p>
            These Event Posting Terms (the &quot;Agreement&quot;) govern the posting of event listings (each an &quot;Event&quot;) on latinterritory.com (the &quot;Platform&quot;) by any user posting as an organiser, promoter, venue, authorised representative, business or organisation (the &quot;Advertiser&quot;).
          </p>
          <p>By ticking the acceptance checkbox and/or posting an Event, you agree to this Agreement.</p>

          <h3 style={heading}>1) Platform role and scope</h3>
          <p>1.1 The Platform is an event listing and discovery service.</p>
          <p>1.2 The Platform does not organise events, does not sell tickets, does not process ticket payments, and is not a party to the relationship between the Advertiser and attendees.</p>
          <p>1.3 The Advertiser is solely responsible for the Event, including changes/cancellations, safety/security, age/ID checks, ticketing (if any) and refunds (if any).</p>
          <p>1.4 Ticket/registration links (if provided) take users to third-party websites under the Advertiser&apos;s responsibility.</p>

          <h3 style={heading}>2) Advertiser eligibility, identity and authority</h3>
          <p>2.1 You represent that you are: (a) the genuine organiser/venue/promoter; or (b) an authorised representative; or (c) an authorised organisation promoting the Event.</p>
          <p>2.2 On request, you will provide reasonable evidence of identity and authority.</p>
          <p>2.3 The Platform may limit or condition posting for new accounts for fraud prevention and user safety.</p>

          <h3 style={heading}>3) Mandatory Event information</h3>
          <p>3.1 Each Event must be clear, accurate and include at minimum: Event title, Category, Description, Start date/time, Location, Organiser/Promoter, Age restriction (if applicable), Price, and at least one contact method.</p>
          <p>3.2 Paid Events must include a valid ticket link (no URL shorteners). Free Events may include an optional RSVP link, or clearly state &quot;Free entry&quot;.</p>
          <p>3.3 You warrant contact details and links are accurate, current and monitored.</p>

          <h3 style={heading}>4) Price transparency</h3>
          <p>4.1 If you display a price, it must be genuine, current and not misleading.</p>
          <p>4.2 You must clearly state if pricing is &quot;from&quot;, &quot;general admission&quot;, &quot;VIP/early bird&quot;, etc.</p>
          <p>4.3 Where unavoidable booking/ticketing fees may apply, avoid confusing pricing and may include &quot;+ fees may apply&quot;.</p>

          <h3 style={heading}>5) Age restrictions, alcohol and compliance</h3>
          <p>5.1 For 18+ events and/or events involving alcohol, you warrant: the Event complies with applicable age requirements; the organiser/venue will manage ID checks and safety measures; any required permits/licences will be obtained.</p>
          <p>5.2 You must not use the Platform to promote unlawful or unsafe activity.</p>

          <h3 style={heading}>6) Images and intellectual property</h3>
          <p>6.1 If you upload posters/images, you warrant you have rights/licences to use them and they do not infringe third-party rights.</p>
          <p>6.2 The Platform may reject or remove images that infringe rights, contain unlawful material, or pose a risk.</p>

          <h3 style={heading}>7) Prohibited content and conduct</h3>
          <p>You must not post Events that: are fake, misleading or involve impersonation; use URL shorteners, malicious links or phishing; request suspicious payments; include hate, harassment, doxxing or sensitive personal data; promote unlawful or extremely offensive content.</p>

          <h3 style={heading}>8) External links (ticketing/registration)</h3>
          <p>8.1 You are responsible for the security, availability and compliance of any external ticketing/registration page.</p>
          <p>8.2 The Platform does not control or endorse third-party sites and does not guarantee safety, although we use reasonable prevention measures.</p>

          <h3 style={heading}>9) Moderation and takedown rights</h3>
          <p>The Platform may review, reject, pause, restrict visibility, hide or remove any Event without notice if it is reported, suspected to be unlawful/scam, violates this Agreement/policies, or poses risk. We may request additional information and may use automated tools (including AI) and human review.</p>

          <h3 style={heading}>10) Reports and cooperation</h3>
          <p>Users may report Events. You agree to cooperate in good faith with reasonable verification/correction requests.</p>

          <h3 style={heading}>11) Advertiser warranties</h3>
          <p>You warrant that: you have the right and authority to post the Event; Event information is accurate and will be kept up to date; you will handle cancellations, refunds and attendee support in accordance with your policies and applicable laws.</p>

          <h3 style={heading}>12) Indemnity</h3>
          <p>To the extent permitted by law, you will indemnify and hold harmless the Platform and its operator from claims, losses, penalties, costs and expenses arising from your Event, event operations, cancellations/refunds, IP infringement, unsafe external links, or breach of this Agreement.</p>

          <h3 style={heading}>13) Limitation of liability</h3>
          <p>To the extent permitted by law, the Platform does not guarantee attendance, outcomes, or that an Event will occur. Nothing excludes non-excludable rights or liabilities.</p>

          <h3 style={heading}>14) Suspension/termination</h3>
          <p>The Platform may suspend or terminate posting privileges for fraud, abuse, breach or user safety risk.</p>

          <h3 style={heading}>15) Changes</h3>
          <p>We may update this Agreement and may require re-acceptance when posting or editing if changes are material.</p>

          <h3 style={heading}>16) Contact</h3>
          <p>Privacy/data matters: <a href="mailto:privacy@latinterritory.com" style={linkStyle}>privacy@latinterritory.com</a></p>
        </div>

        {/* Checkboxes + CTA */}
        <div style={{ borderTop: '1px solid var(--lh-border)', padding: '20px 24px', background: 'var(--lh-surface2)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 11, cursor: 'pointer' }}>
            <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} style={{ marginTop: 2, width: 18, height: 18, flexShrink: 0, accentColor: 'var(--lh-accent)', cursor: 'pointer' }} />
            <span style={{ fontSize: 14, color: 'var(--lh-fg2)', display: 'inline-flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
              <ShieldCheck size={16} style={{ color: 'var(--lh-accent)', flexShrink: 0 }} />
              Acepto los{' '}
              <a href="/event-posting-terms" target="_blank" rel="noopener noreferrer" style={{ ...linkStyle, fontWeight: 500 }} onClick={(e) => e.stopPropagation()}>
                Términos de Publicación de Eventos
              </a>{' '}
              (Acuerdo para Anunciantes).
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 11, cursor: 'pointer' }}>
            <input type="checkbox" checked={agreedIsOrganiser} onChange={(e) => setAgreedIsOrganiser(e.target.checked)} style={{ marginTop: 2, width: 18, height: 18, flexShrink: 0, accentColor: 'var(--lh-accent)', cursor: 'pointer' }} />
            <span style={{ fontSize: 14, color: 'var(--lh-fg2)', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <UserCheck size={16} style={{ color: 'var(--lh-green)', flexShrink: 0 }} />
              Confirmo que soy el organizador o representante autorizado y que la información del evento es veraz.
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 11, cursor: 'pointer' }}>
            <input type="checkbox" checked={agreedAgeCompliance} onChange={(e) => setAgreedAgeCompliance(e.target.checked)} style={{ marginTop: 2, width: 18, height: 18, flexShrink: 0, accentColor: 'var(--lh-accent)', cursor: 'pointer' }} />
            <span style={{ fontSize: 14, color: 'var(--lh-fg2)', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <ShieldAlert size={16} style={{ color: 'var(--lh-warm)', flexShrink: 0 }} />
              Confirmo que el evento cumple restricciones de edad y normas aplicables (incl. alcohol) y que el organizador gestionará control de ID y seguridad.
            </span>
          </label>

          <div style={{ display: 'flex', gap: 12, paddingTop: 2 }}>
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
