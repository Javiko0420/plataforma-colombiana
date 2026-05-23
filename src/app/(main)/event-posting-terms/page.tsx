import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LtPageShell, LtPanel } from '@/components/lt'

export const metadata: Metadata = {
  title: 'Términos de Publicación de Eventos | Latin Territory',
  description: 'Acuerdo para anunciantes de eventos en latinterritory.com',
}

export default function EventPostingTermsPage() {
  return (
    <LtPageShell maxWidth="5xl">
      <Link
        href="/perfil"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-80"
        style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a mi perfil
      </Link>

      <LtPanel className="p-8 md:p-12">

          {/* ── ES ── */}
          <section
            className="max-w-none space-y-4 text-sm leading-relaxed mb-16 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:pt-4 [&_h2]:text-[var(--lt-ink)] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-[var(--lt-terracota)] [&_a]:underline [&_strong]:text-[var(--lt-ink)]"
            style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}
          >
            <h1
              className="text-3xl font-extrabold tracking-tight"
              style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
            >
              (ES) Términos de Publicación de Eventos
              <span
                className="block text-lg font-normal mt-1"
                style={{ color: 'var(--lt-ink-soft)' }}
              >
                Acuerdo para Anunciantes
              </span>
            </h1>

            <p className="text-sm" style={{ color: 'var(--lt-ink-soft)' }}>
              <strong style={{ color: 'var(--lt-ink)' }}>Latinterritory.com</strong> &bull; URL: /event-posting-terms &bull; Última actualización: 17 de febrero de 2026
            </p>

            <p>Estos Términos de Publicación de Eventos (el &quot;Acuerdo&quot;) regulan la publicación de anuncios de eventos (cada uno, un &quot;Evento&quot;) en latinterritory.com (la &quot;Plataforma&quot;) por parte de cualquier usuario que publique como organizador, promotor, venue, representante autorizado, negocio u organización (el &quot;Anunciante&quot;).</p>
            <p>Al marcar la casilla de aceptación y/o publicar un Evento, confirmas que has leído y aceptas este Acuerdo.</p>

            <h2>1) Alcance y rol de la Plataforma</h2>
            <p>1.1. La Plataforma es un servicio de listado y difusión de Eventos.</p>
            <p>1.2. La Plataforma no organiza eventos, no vende entradas, no procesa pagos de tickets, y no participa en la relación entre el Anunciante y los asistentes.</p>
            <p>1.3. El Anunciante es el único responsable del Evento, su realización, cambios/cancelaciones, seguridad, control de edad/ID, venta de entradas (si aplica) y reembolsos (si aplica).</p>
            <p>1.4. El enlace de tickets o registro (si existe) dirige a un sitio de terceros bajo responsabilidad del Anunciante.</p>

            <h2>2) Elegibilidad, identidad y autoridad del Anunciante</h2>
            <p>2.1. Declaras que eres: (a) el organizador/venue/promotor real del Evento, o (b) un representante autorizado por el organizador/venue/promotor, o (c) una organización autorizada para difundir el Evento.</p>
            <p>2.2. A solicitud de la Plataforma, aportarás evidencia razonable de tu identidad y autoridad (por ejemplo, verificación de email/teléfono, prueba de control del dominio, documentación del negocio/organización, etc.).</p>
            <p>2.3. La Plataforma puede limitar o condicionar la publicación de Eventos para cuentas nuevas, por prevención de fraude o seguridad.</p>

            <h2>3) Información obligatoria del Evento</h2>
            <p>3.1. Cada Evento debe ser claro, veraz y contener como mínimo:</p>
            <ul>
              <li>Título del Evento</li>
              <li>Categoría (concierto, fiesta, teatro, comedia, festival, networking, etc.)</li>
              <li>Descripción (sin claims engañosos)</li>
              <li>Fecha y hora de inicio (y fin si aplica)</li>
              <li>Ubicación (ciudad + venue/dirección o &quot;por confirmar&quot; solo si se actualiza antes del inicio)</li>
              <li>Organizador/Promotor (nombre visible)</li>
              <li>Restricción de edad (All ages / 18+ / 21+ u otra) y si aplica control de ID</li>
              <li>Precio (ver sección 4)</li>
              <li>Al menos un canal de contacto (email y/o teléfono)</li>
            </ul>
            <p>3.2. Si el Evento es de pago, debes incluir un enlace de tickets válido (sin enlaces acortados). Si el Evento es gratuito, puedes incluir un enlace de registro/RSVP opcional, o indicar claramente &quot;Entrada gratuita / Free entry&quot; y cómo participa la gente (si aplica).</p>
            <p>3.3. Garantizas que los datos de contacto y enlaces publicados son correctos, actuales y monitoreados.</p>

            <h2>4) Precio: reglas de transparencia</h2>
            <p>4.1. Si eliges mostrar precio, debe ser real, actualizado y no engañoso.</p>
            <p>4.2. Debes indicar claramente si el precio es &quot;desde / from&quot;, &quot;entrada general / general admission&quot;, &quot;VIP / early bird&quot;, o similar (cuando aplique).</p>
            <p>4.3. Si existen cargos adicionales inevitables (fees del ticketing/booking), debes evitar presentar el precio de forma que confunda. Recomendación: incluir una nota &quot;+ fees may apply / pueden aplicar cargos del proveedor&quot; cuando corresponda.</p>

            <h2>5) Restricciones de edad, alcohol y cumplimiento</h2>
            <p>5.1. Si el Evento es 18+ (o tiene alcohol), el Anunciante declara y garantiza que: el Evento cumple requisitos de edad y normas aplicables; el organizador/venue gestionará control de ID y medidas de seguridad apropiadas; se gestionarán permisos/licencias que correspondan (cuando aplique).</p>
            <p>5.2. Está prohibido usar la Plataforma para promover actividades ilegales o peligrosas.</p>

            <h2>6) Imágenes y propiedad intelectual</h2>
            <p>6.1. Si subes posters o imágenes, declaras que: tienes derechos/licencia para usarlas (copyright/marcas), y no infringen derechos de terceros.</p>
            <p>6.2. La Plataforma puede rechazar o retirar imágenes que infrinjan derechos, contengan material ilegal, o representen riesgo para usuarios.</p>

            <h2>7) Prohibiciones (anti-fraude y seguridad)</h2>
            <p>No puedes publicar Eventos que:</p>
            <ul>
              <li>7.1. sean falsos, engañosos o suplantación;</li>
              <li>7.2. incluyan enlaces acortados, enlaces maliciosos o phishing;</li>
              <li>7.3. soliciten pagos por medios sospechosos (gift cards, cripto, depósitos extraños) o prácticas típicas de estafa;</li>
              <li>7.4. contengan odio, acoso, doxxing o datos personales sensibles de terceros;</li>
              <li>7.5. promuevan contenido ilegal o extremadamente ofensivo.</li>
            </ul>

            <h2>8) Enlaces externos (ticketing/registro)</h2>
            <p>8.1. Si publicas un enlace externo, eres responsable de la seguridad, disponibilidad y cumplimiento del sitio de destino.</p>
            <p>8.2. La Plataforma no controla ni respalda sitios de terceros ni garantiza que el enlace sea seguro, aunque aplicamos medidas razonables de prevención.</p>

            <h2>9) Moderación, revisión y derecho de retirada</h2>
            <p>9.1. La Plataforma puede, a su discreción, revisar, rechazar, pausar, limitar visibilidad, ocultar o retirar cualquier Evento sin previo aviso si: recibe reportes, detecta señales de fraude/estafa, considera que viola este Acuerdo o políticas, o existe riesgo para usuarios o cumplimiento legal.</p>
            <p>9.2. La Plataforma puede solicitar información adicional para verificar legitimidad o corregir información.</p>
            <p>9.3. La Plataforma puede usar herramientas automatizadas (incluida IA) y revisión humana para moderación.</p>

            <h2>10) Reportes y cooperación</h2>
            <p>10.1. Los usuarios podrán reportar Eventos (por ejemplo: scam, suplantación, información engañosa, contenido ofensivo).</p>
            <p>10.2. El Anunciante se compromete a cooperar de buena fe con solicitudes razonables de verificación y corrección.</p>

            <h2>11) Garantías del Anunciante</h2>
            <p>El Anunciante declara y garantiza que:</p>
            <ul>
              <li>11.1. Tiene derecho y autoridad para publicar el Evento y usar el material asociado.</li>
              <li>11.2. La información del Evento es precisa y se mantendrá actualizada (incluye cambios de horario, venue, cancelaciones).</li>
              <li>11.3. Gestionará cancelaciones, reembolsos y soporte a asistentes conforme a sus políticas y leyes aplicables.</li>
            </ul>

            <h2>12) Indemnidad</h2>
            <p>En la medida permitida por la ley, el Anunciante acepta indemnizar y mantener indemne a la Plataforma y a su operador por reclamaciones, pérdidas, sanciones, costos y gastos (incluidos honorarios legales razonables) derivados de: el Evento o su publicación, la realización/operación del Evento, cancelaciones/reembolsos, infracciones de propiedad intelectual, enlaces externos inseguros, o incumplimiento de este Acuerdo.</p>

            <h2>13) Limitación de responsabilidad</h2>
            <p>13.1. En la medida permitida por la ley, la Plataforma no garantiza asistencia, resultados, ni la realización del Evento.</p>
            <p>13.2. Nada en este Acuerdo limita derechos o responsabilidades que no puedan excluirse legalmente.</p>

            <h2>14) Suspensión y terminación</h2>
            <p>La Plataforma puede suspender o terminar la capacidad del Anunciante de publicar Eventos por fraude, abuso, incumplimiento o riesgo para usuarios.</p>

            <h2>15) Cambios del acuerdo</h2>
            <p>Podemos actualizar este Acuerdo. Publicaremos la versión vigente en /event-posting-terms y podremos solicitar re-aceptación al publicar o editar si los cambios son materiales.</p>

            <h2>16) Contacto</h2>
            <p>Asuntos de privacidad/datos: <a href="mailto:privacy@latinterritory.com">privacy@latinterritory.com</a></p>
          </section>

          <hr className="my-12 border-[var(--lt-ink)]" />

          {/* ── EN ── */}
          <section
            className="max-w-none space-y-4 text-sm leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:pt-4 [&_h2]:text-[var(--lt-ink)] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-[var(--lt-terracota)] [&_a]:underline [&_strong]:text-[var(--lt-ink)]"
            style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}
          >
            <h1
              className="text-3xl font-extrabold tracking-tight"
              style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
            >
              (EN) Event Posting Terms
              <span
                className="block text-lg font-normal mt-1"
                style={{ color: 'var(--lt-ink-soft)' }}
              >
                Advertiser Agreement
              </span>
            </h1>

            <p className="text-sm" style={{ color: 'var(--lt-ink-soft)' }}>
              <strong style={{ color: 'var(--lt-ink)' }}>Latinterritory.com</strong> &bull; URL: /event-posting-terms &bull; Last updated: 17 February 2026
            </p>

            <p>These Event Posting Terms (the &quot;Agreement&quot;) govern the posting of event listings (each an &quot;Event&quot;) on latinterritory.com (the &quot;Platform&quot;) by any user posting as an organiser, promoter, venue, authorised representative, business or organisation (the &quot;Advertiser&quot;).</p>
            <p>By ticking the acceptance checkbox and/or posting an Event, you agree to this Agreement.</p>

            <h2>1) Platform role and scope</h2>
            <p>1.1 The Platform is an event listing and discovery service.</p>
            <p>1.2 The Platform does not organise events, does not sell tickets, does not process ticket payments, and is not a party to the relationship between the Advertiser and attendees.</p>
            <p>1.3 The Advertiser is solely responsible for the Event, including changes/cancellations, safety/security, age/ID checks, ticketing (if any) and refunds (if any).</p>
            <p>1.4 Ticket/registration links (if provided) take users to third-party websites under the Advertiser&apos;s responsibility.</p>

            <h2>2) Advertiser eligibility, identity and authority</h2>
            <p>2.1 You represent that you are: (a) the genuine organiser/venue/promoter; or (b) an authorised representative; or (c) an authorised organisation promoting the Event.</p>
            <p>2.2 On request, you will provide reasonable evidence of identity and authority (e.g., email/phone verification, domain proof, organisation documentation, etc.).</p>
            <p>2.3 The Platform may limit or condition posting for new accounts for fraud prevention and user safety.</p>

            <h2>3) Mandatory Event information</h2>
            <p>3.1 Each Event must be clear, accurate and include at minimum:</p>
            <ul>
              <li>Event title</li>
              <li>Category</li>
              <li>Description (no misleading claims)</li>
              <li>Start date/time (and end time if applicable)</li>
              <li>Location (city + venue/address, or &quot;TBA&quot; only if updated before start)</li>
              <li>Organiser/Promoter (visible name)</li>
              <li>Age restriction (All ages / 18+ / 21+ etc.) and whether ID checks apply</li>
              <li>Price (see Section 4)</li>
              <li>At least one contact method (email and/or phone)</li>
            </ul>
            <p>3.2 Paid Events must include a valid ticket link (no URL shorteners). Free Events may include an optional RSVP/registration link, or clearly state &quot;Free entry&quot; and participation details (if any).</p>
            <p>3.3 You warrant contact details and links are accurate, current and monitored.</p>

            <h2>4) Price transparency</h2>
            <p>4.1 If you display a price, it must be genuine, current and not misleading.</p>
            <p>4.2 You must clearly state if pricing is &quot;from&quot;, &quot;general admission&quot;, &quot;VIP/early bird&quot;, etc., where applicable.</p>
            <p>4.3 Where unavoidable booking/ticketing fees may apply, you should avoid presenting pricing in a confusing way and may include &quot;+ fees may apply&quot;.</p>

            <h2>5) Age restrictions, alcohol and compliance</h2>
            <p>5.1 For 18+ events and/or events involving alcohol, you warrant: the Event complies with applicable age requirements and rules; the organiser/venue will manage ID checks and appropriate safety measures; any required permits/licences will be obtained where applicable.</p>
            <p>5.2 You must not use the Platform to promote unlawful or unsafe activity.</p>

            <h2>6) Images and intellectual property</h2>
            <p>6.1 If you upload posters/images, you warrant you have rights/licences to use them and they do not infringe third-party rights.</p>
            <p>6.2 The Platform may reject or remove images that infringe rights, contain unlawful material, or pose a risk.</p>

            <h2>7) Prohibited content and conduct</h2>
            <p>You must not post Events that:</p>
            <ul>
              <li>7.1 are fake, misleading or involve impersonation;</li>
              <li>7.2 use URL shorteners, malicious links or phishing;</li>
              <li>7.3 request suspicious payments (gift cards, crypto, odd deposits) or other scam-like practices;</li>
              <li>7.4 include hate, harassment, doxxing or sensitive personal data;</li>
              <li>7.5 promote unlawful or extremely offensive content.</li>
            </ul>

            <h2>8) External links (ticketing/registration)</h2>
            <p>8.1 You are responsible for the security, availability and compliance of any external ticketing/registration page.</p>
            <p>8.2 The Platform does not control or endorse third-party sites and does not guarantee safety, although we use reasonable prevention measures.</p>

            <h2>9) Moderation and takedown rights</h2>
            <p>9.1 The Platform may review, reject, pause, restrict visibility, hide or remove any Event without notice if it is reported, suspected to be unlawful/scam, violates this Agreement/policies, or poses risk.</p>
            <p>9.2 We may request additional information to verify legitimacy or correct details.</p>
            <p>9.3 We may use automated tools (including AI) and human review for moderation.</p>

            <h2>10) Reports and cooperation</h2>
            <p>Users may report Events (e.g., scam, impersonation, misleading info, offensive content). You agree to cooperate in good faith with reasonable verification/correction requests.</p>

            <h2>11) Advertiser warranties</h2>
            <p>You warrant that:</p>
            <ul>
              <li>11.1 You have the right and authority to post the Event and associated materials.</li>
              <li>11.2 Event information is accurate and will be kept up to date (including changes/cancellations).</li>
              <li>11.3 You will handle cancellations, refunds and attendee support in accordance with your policies and applicable laws.</li>
            </ul>

            <h2>12) Indemnity</h2>
            <p>To the extent permitted by law, you will indemnify and hold harmless the Platform and its operator from claims, losses, penalties, costs and expenses (including reasonable legal fees) arising from your Event, event operations, cancellations/refunds, IP infringement, unsafe external links, or breach of this Agreement.</p>

            <h2>13) Limitation of liability</h2>
            <p>To the extent permitted by law, the Platform does not guarantee attendance, outcomes, or that an Event will occur. Nothing excludes non-excludable rights or liabilities.</p>

            <h2>14) Suspension/termination</h2>
            <p>The Platform may suspend or terminate posting privileges for fraud, abuse, breach or user safety risk.</p>

            <h2>15) Changes</h2>
            <p>We may update this Agreement and may require re-acceptance when posting or editing if changes are material.</p>

            <h2>16) Contact</h2>
            <p>Privacy/data matters: <a href="mailto:privacy@latinterritory.com">privacy@latinterritory.com</a></p>
          </section>
      </LtPanel>
    </LtPageShell>
  )
}
