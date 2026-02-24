import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Términos de Publicación de Empleos | Latin Territory',
  description: 'Acuerdo para anunciantes de ofertas de empleo en latinterritory.com',
}

export default function JobPostingTermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        <Link
          href="/perfil"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mi perfil
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 md:p-12">

          {/* ── ES ── */}
          <section className="prose dark:prose-invert max-w-none mb-16">
            <h1 className="text-3xl font-extrabold tracking-tight">
              (ES) Términos de Publicación de Empleos
              <span className="block text-lg font-normal text-gray-500 dark:text-gray-400 mt-1">
                Acuerdo para Anunciantes
              </span>
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              <strong>Latinterritory.com</strong><br />
              URL:{' '}
              <a href="/job-posting-terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                latinterritory.com/job-posting-terms
              </a>
              <br />
              Última actualización: 17 de febrero de 2026
            </p>

            <p>
              Estos Términos de Publicación de Empleos (el &quot;Acuerdo&quot;) regulan la publicación de ofertas de empleo (cada una, un &quot;Anuncio&quot;) en latinterritory.com (la &quot;Plataforma&quot;) por parte de cualquier persona que publique como empleador, negocio, reclutador, representante autorizado u organización (el &quot;Anunciante&quot;).
            </p>
            <p>
              Al marcar la casilla de aceptación y/o publicar un Anuncio, confirmas que has leído y aceptas este Acuerdo.
            </p>

            <h2>1) Alcance y rol de la Plataforma</h2>
            <p>1.1. La Plataforma facilita un espacio para publicar Anuncios y permitir que los postulantes contacten al Anunciante o se postulen mediante enlaces a sitios externos.</p>
            <p>1.2. La Plataforma no es el empleador, no es una agencia de empleo, y no participa en la relación laboral, negociación o contratación entre Anunciante y postulantes.</p>
            <p>1.3. El Anunciante es el único responsable del Anuncio y del proceso de contratación.</p>
            <p>1.4. La Plataforma no realiza entrevistas, no selecciona candidatos, no negocia condiciones, no procesa pagos, no recibe CVs en nombre del anunciante y no formaliza contratos de trabajo. Cualquier relación laboral o acuerdo se realiza exclusivamente entre el Anunciante y el postulante fuera de la Plataforma.</p>

            <h2>2) Elegibilidad, identidad y autoridad del anunciante</h2>
            <p>2.1. Declaras que eres:</p>
            <ul>
              <li>(a) el empleador real, o</li>
              <li>(b) un reclutador/representante autorizado por el empleador, o</li>
              <li>(c) una ONG/entidad autorizada para difundir oportunidades.</li>
            </ul>
            <p>2.2. A solicitud de la Plataforma, aportarás evidencia razonable de tu identidad y autoridad (por ejemplo, verificación de email/teléfono, documentación del negocio/entidad, verificación de dominio, u otra información razonable).</p>

            <h2>3) Requisitos obligatorios del anuncio</h2>
            <p>3.1. Cada Anuncio debe ser claro, veraz y contener como mínimo:</p>
            <ul>
              <li>Título del cargo</li>
              <li>Categoría</li>
              <li>Descripción</li>
              <li>Ubicación</li>
              <li>Tipo de empleo</li>
              <li>Salario por hora (AUD) (obligatorio)</li>
              <li>Al menos un medio de contacto (email y/o teléfono) y/o URL externa de postulación</li>
            </ul>
            <p>3.2. El Anunciante garantiza que la información de contacto publicada es correcta, está activa y será monitoreada.</p>

            <h2>4) Salario por hora: obligación y cumplimiento</h2>
            <p>4.1. Para publicar en la Plataforma, es obligatorio declarar un salario por hora (AUD).</p>
            <p>4.2. El Anunciante declara y garantiza que el salario por hora publicado:</p>
            <ul>
              <li>es real, actual y ofrecido de buena fe; y</li>
              <li>
                cumple como mínimo con las entitlements y mínimos legales aplicables (por ejemplo, el instrumento laboral aplicable o el salario mínimo nacional) en la jurisdicción donde se realizará el trabajo.{' '}
                <a href="https://www.fairwork.gov.au/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Fair Work Ombudsman
                </a>
              </li>
            </ul>
            <p>4.3. Está prohibido publicar salarios por debajo de los mínimos legales aplicables o utilizar el salario para inducir a error.</p>

            <h2>5) Prohibiciones (anti-scam, legalidad y seguridad)</h2>
            <p>Está prohibido publicar Anuncios que:</p>
            <ul>
              <li>5.1. Sean falsos, engañosos o confusos sobre salario, jornada, condiciones, ubicación, requisitos o naturaleza del rol.</li>
              <li>5.2. Incluyan lenguaje discriminatorio o criterios ilegales (por ejemplo, exclusión por origen, raza, género, edad, etc.), salvo requisitos genuinos permitidos por ley.</li>
              <li>5.3. Soliciten pagos para postularse, depósitos, gift cards, cripto, &quot;fees&quot; sospechosos o cualquier práctica típica de estafa.</li>
              <li>5.4. Contengan enlaces acortados o enlaces maliciosos.</li>
              <li>5.5. Soliciten datos sensibles innecesarios a postulantes (por ejemplo, información bancaria en etapas iniciales).</li>
              <li>5.6. Promuevan empleo ilegal o prácticas contrarias a normas laborales.</li>
            </ul>

            <h2>6) Enlaces externos, email y teléfono del anunciante</h2>
            <p>6.1. Si incluyes una URL externa, eres responsable del contenido, seguridad y cumplimiento del sitio de destino.</p>
            <p>6.2. El Anunciante garantiza que el email/teléfono publicados pertenecen al Anunciante o al empleador autorizado y que se usarán únicamente para fines de contratación.</p>
            <p>6.3. La Plataforma puede bloquear o rechazar enlaces que considere inseguros, fraudulentos o de riesgo.</p>

            <h2>7) Moderación, revisión y derecho de retirada</h2>
            <p>7.1. La Plataforma puede, a su discreción, revisar, rechazar, pausar, limitar visibilidad, ocultar o retirar cualquier Anuncio, sin previo aviso, si:</p>
            <ul>
              <li>recibe reportes,</li>
              <li>detecta señales de fraude/estafa,</li>
              <li>considera que el Anuncio viola este Acuerdo o políticas, o</li>
              <li>existe riesgo para usuarios o para el cumplimiento legal.</li>
            </ul>
            <p>7.2. La Plataforma puede solicitar información adicional para verificación (incluyendo evidencia del anunciante/empleador).</p>
            <p>7.3. La Plataforma puede usar herramientas automatizadas (incluida IA) para detectar abuso o riesgo.</p>

            <h2>8) Reportes y cooperación</h2>
            <p>8.1. Los usuarios podrán reportar Anuncios (por ejemplo: estafa, salario ilegal, discriminación, engañoso).</p>
            <p>8.2. El Anunciante se compromete a cooperar de buena fe con solicitudes razonables de verificación y revisiones.</p>

            <h2>9) Garantías del anunciante</h2>
            <p>El Anunciante declara y garantiza que:</p>
            <ul>
              <li>9.1. Tiene derecho a publicar el Anuncio y a contactar/recibir postulaciones para ese rol.</li>
              <li>9.2. El Anuncio y el proceso de contratación cumplen las leyes aplicables.</li>
              <li>9.3. El salario por hora publicado cumple mínimos legales aplicables.</li>
              <li>9.4. El Anuncio no es engañoso ni discriminatorio y se enfoca en habilidades/aptitudes.</li>
              <li>9.5. Tiene derechos para usar logos/marcas/contenidos incluidos en el Anuncio.</li>
            </ul>

            <h2>10) Indemnidad</h2>
            <p>En la medida permitida por la ley, el Anunciante acepta indemnizar y mantener indemne a la Plataforma y a su operador por reclamaciones, pérdidas, sanciones, costos y gastos (incluidos honorarios legales razonables) derivados de:</p>
            <ul>
              <li>el Anuncio,</li>
              <li>el proceso de contratación del Anunciante,</li>
              <li>incumplimiento de este Acuerdo,</li>
              <li>violación de derechos de terceros, o</li>
              <li>enlaces/sistemas inseguros del Anunciante.</li>
            </ul>

            <h2>11) Limitación de responsabilidad</h2>
            <p>11.1. En la medida permitida por la ley, la Plataforma no garantiza resultados de contratación, postulantes, ni la disponibilidad/seguridad de sitios externos de terceros.</p>
            <p>11.2. Nada en este Acuerdo limita derechos o responsabilidades que no puedan excluirse legalmente.</p>

            <h2>12) Suspensión y terminación</h2>
            <p>La Plataforma puede suspender o terminar la capacidad del Anunciante de publicar Anuncios si detecta fraude, abuso, manipulación, incumplimientos o riesgos para usuarios.</p>

            <h2>13) Cambios del acuerdo</h2>
            <p>Podemos actualizar este Acuerdo. Publicaremos la versión vigente en <code>/job-posting-terms</code> y podremos solicitar re-aceptación al publicar o editar Anuncios.</p>

            <h2>14) Contacto</h2>
            <p>Para asuntos de privacidad y datos: <a href="mailto:privacy@latinterritory.com" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@latinterritory.com</a></p>
          </section>

          <hr className="border-gray-200 dark:border-gray-700 my-12" />

          {/* ── EN ── */}
          <section className="prose dark:prose-invert max-w-none">
            <h1 className="text-3xl font-extrabold tracking-tight">
              (EN) Job Posting Terms
              <span className="block text-lg font-normal text-gray-500 dark:text-gray-400 mt-1">
                Advertiser Agreement
              </span>
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              <strong>Latinterritory.com</strong><br />
              URL:{' '}
              <a href="/job-posting-terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                latinterritory.com/job-posting-terms
              </a>
              <br />
              Last updated: 17 February 2026
            </p>

            <p>
              These Job Posting Terms (the &quot;Agreement&quot;) govern the posting of job advertisements (each a &quot;Job Ad&quot;) on latinterritory.com (the &quot;Platform&quot;) by any user posting as an employer, business, recruiter, authorised representative or organisation (the &quot;Advertiser&quot;).
            </p>
            <p>
              By ticking the acceptance checkbox and/or posting a Job Ad, you confirm you have read and agree to this Agreement.
            </p>

            <h2>1) Platform role and scope</h2>
            <p>1.1 The Platform provides a space to publish Job Ads and allow applicants to contact the Advertiser or apply via external links.</p>
            <p>1.2 The Platform is not the employer, not an employment agency, and is not a party to the employment relationship.</p>
            <p>1.3 The Advertiser is solely responsible for the Job Ad and recruitment process.</p>
            <p>1.4 The Platform does not interview or screen candidates, negotiate terms, process payments, collect CVs on behalf of advertisers, or enter into employment contracts. Any employment relationship or agreement is solely between the Advertiser and the applicant outside the Platform.</p>

            <h2>2) Eligibility, identity and authority</h2>
            <p>2.1 You represent that you are:</p>
            <ul>
              <li>(a) the genuine employer; or</li>
              <li>(b) an authorised recruiter/representative; or</li>
              <li>(c) an authorised organisation promoting opportunities.</li>
            </ul>
            <p>2.2 On request, you will provide reasonable evidence of identity and authority (e.g., email/phone verification, organisation documentation, domain verification, or other reasonable information).</p>

            <h2>3) Mandatory Job Ad fields</h2>
            <p>3.1 Each Job Ad must be clear, accurate and include at minimum:</p>
            <ul>
              <li>Role title</li>
              <li>Category</li>
              <li>Description</li>
              <li>Location</li>
              <li>Employment type</li>
              <li>Hourly pay (AUD) (mandatory)</li>
              <li>At least one contact method (email and/or phone) and/or an external application URL</li>
            </ul>
            <p>3.2 You warrant the contact details provided are accurate, active and monitored.</p>

            <h2>4) Hourly pay requirement and compliance</h2>
            <p>4.1 Hourly pay (AUD) is mandatory to post on the Platform.</p>
            <p>4.2 You warrant the hourly pay stated:</p>
            <ul>
              <li>is genuine and offered in good faith; and</li>
              <li>
                meets minimum legal entitlements applicable to the work location (e.g., applicable instrument or national minimum wage).{' '}
                <a href="https://www.fairwork.gov.au/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Fair Work Ombudsman
                </a>
              </li>
            </ul>
            <p>4.3 You must not state hourly pay below minimum legal entitlements or use pay details in a misleading way.</p>

            <h2>5) Prohibited content and conduct</h2>
            <p>You must not post Job Ads that:</p>
            <ul>
              <li>5.1 Are false, misleading or deceptive about pay, conditions, location, requirements or the nature of the role.</li>
              <li>5.2 Include unlawful discriminatory wording, except where a genuine occupational requirement applies.</li>
              <li>5.3 Request payments to apply, deposits, gift cards, crypto, suspicious &quot;fees&quot;, or other scam-like practices.</li>
              <li>5.4 Use URL shorteners or malicious links.</li>
              <li>5.5 Request unnecessary sensitive applicant data (e.g., bank details at initial stage).</li>
              <li>5.6 Promote unlawful work or non-compliant labour practices.</li>
            </ul>

            <h2>6) External links, advertiser email and phone</h2>
            <p>6.1 If you include an external URL, you are responsible for the security, content and compliance of the destination site.</p>
            <p>6.2 You warrant the email/phone shown belongs to the Advertiser (or authorised employer contact) and will be used only for recruitment purposes.</p>
            <p>6.3 The Platform may block or reject links deemed unsafe, fraudulent or high risk.</p>

            <h2>7) Moderation and takedown rights</h2>
            <p>7.1 The Platform may review, reject, pause, restrict visibility, hide or remove any Job Ad without notice if it is reported, suspected to be unlawful/scam, violates this Agreement/policies, or poses risk.</p>
            <p>7.2 The Platform may request additional information for verification.</p>
            <p>7.3 The Platform may use automated tools (including AI) to detect abuse or risk.</p>

            <h2>8) Reports and cooperation</h2>
            <p>Users may report Job Ads (e.g., scam, illegal pay, discrimination, misleading). You agree to cooperate in good faith with reasonable verification and review requests.</p>

            <h2>9) Advertiser warranties</h2>
            <p>You warrant that:</p>
            <ul>
              <li>9.1 You have the right and authority to post the Job Ad.</li>
              <li>9.2 The Job Ad and recruitment process comply with applicable laws.</li>
              <li>9.3 The hourly pay stated meets minimum legal entitlements.</li>
              <li>9.4 The Job Ad is not misleading or discriminatory and focuses on skills and abilities.</li>
              <li>9.5 You have rights to use any logos/brands/content included.</li>
            </ul>

            <h2>10) Indemnity</h2>
            <p>To the extent permitted by law, you will indemnify and hold harmless the Platform and its operator from claims, losses, penalties, costs and expenses (including reasonable legal fees) arising from your Job Ad, recruitment process, breach of this Agreement, third-party rights issues, or unsafe links/systems.</p>

            <h2>11) Limitation of liability</h2>
            <p>To the extent permitted by law, the Platform does not guarantee applicants, hiring outcomes, or the availability/security of third-party external sites. Nothing excludes non-excludable rights or liabilities.</p>

            <h2>12) Suspension/termination</h2>
            <p>The Platform may suspend or terminate your ability to post for breach, fraud/scam activity, manipulation, or user safety risk.</p>

            <h2>13) Changes</h2>
            <p>We may update this Agreement and may require re-acceptance when posting or editing if changes are material.</p>

            <h2>14) Contact</h2>
            <p>Privacy/data matters: <a href="mailto:privacy@latinterritory.com" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@latinterritory.com</a></p>
          </section>

        </div>
      </div>
    </main>
  )
}
