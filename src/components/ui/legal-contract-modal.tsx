'use client'

import Link from 'next/link'
import { FileText, X, CheckCircle } from 'lucide-react'
import { Button } from '@/components/lh/Button'

interface LegalContractModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
  accepted: boolean
  onAcceptedChange: (value: boolean) => void
  /** Label for the confirm button */
  submitLabel?: string
}

const h5: React.CSSProperties = { fontWeight: 600, marginBottom: 8, color: 'var(--lh-fg)' }
const link: React.CSSProperties = { color: 'var(--lh-accent)', textDecoration: 'underline' }
const strong: React.CSSProperties = { color: 'var(--lh-fg)', fontWeight: 600 }

/**
 * Shared Legal Contract Modal.
 * Displays the full "Contrato de Usuario Registrado" with checkbox acceptance.
 * Used by both RegisterForm (new users) and CompleteProfileForm (Google OAuth users)
 * to ensure legal parity across all registration paths.
 */
export default function LegalContractModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  accepted,
  onAcceptedChange,
  submitLabel = 'Confirmar y Crear',
}: LegalContractModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contract-modal-title"
    >
      <div
        className="w-full max-w-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh', background: 'var(--lh-surface)', border: '1px solid var(--lh-border)', borderRadius: 20, boxShadow: 'var(--lh-shadow-lg)', fontFamily: 'var(--lh-font)' }}
      >
        <div className="flex items-center justify-between" style={{ padding: '18px 24px', background: 'linear-gradient(160deg,var(--lh-accent),var(--lh-accent-ink))', color: '#fff' }}>
          <div className="flex items-center gap-3">
            <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.16)' }}>
              <FileText size={20} />
            </span>
            <div>
              <h3 id="contract-modal-title" style={{ fontFamily: 'var(--lh-font)', fontSize: 17, fontWeight: 600, margin: 0 }}>
                Contrato de Usuario Registrado
              </h3>
              <p style={{ fontSize: 12, opacity: 0.85, margin: '2px 0 0' }}>Debes aceptar para continuar con tu registro.</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar modal" style={{ color: '#fff', background: 'transparent', border: 0, cursor: 'pointer', padding: 4, borderRadius: 8, display: 'inline-flex' }}>
            <X size={20} />
          </button>
        </div>

        <div
          className="overflow-y-auto text-sm space-y-6 leading-relaxed"
          style={{ padding: 24, background: 'var(--lh-bg)', color: 'var(--lh-fg2)' }}
        >
          <div className="text-center pb-6" style={{ borderBottom: '1px solid var(--lh-border)' }}>
            <h4 style={{ fontFamily: 'var(--lh-font)', fontSize: 19, fontWeight: 600, marginBottom: 8, color: 'var(--lh-fg)' }}>
              CONTRATO DE USUARIO REGISTRADO
            </h4>
            <p style={{ fontSize: 14, color: 'var(--lh-fg2)' }}>(Acuerdo de Registro y Uso)</p>
            <p style={{ fontSize: 14, fontWeight: 500, marginTop: 12, color: 'var(--lh-fg)' }}>Latinterritory.com</p>
            <p style={{ fontSize: 12, marginTop: 4, color: 'var(--lh-fg3)' }}>Última actualización: 03 de febrero de 2026</p>
          </div>

          <div className="text-justify space-y-3">
            <p>
              Este Contrato de Usuario Registrado (el &quot;Acuerdo&quot;) es un acuerdo legal entre tú (&quot;Usuario&quot;, &quot;tú&quot;) y el operador de latinterritory.com (&quot;la Plataforma&quot;), Javier Felipe Guerrero Zambrano, Brisbane QLD, Australia (&quot;Latinterritory&quot;, &quot;nosotros&quot;).
            </p>
            <p>
              Al crear una cuenta, iniciar sesión o usar funcionalidades de Usuario Registrado (reseñas, foros, creación/gestión de fichas), confirmas que has leído y aceptas este Acuerdo.
            </p>
          </div>

          <div className="text-justify">
            <h5 style={h5}>1) Documentos vinculantes</h5>
            <p className="mb-2">Este Acuerdo se complementa con:</p>
            <ol className="list-decimal pl-6 space-y-1 mb-2">
              <li><Link href="/terminos" target="_blank" style={link}>Términos de Uso de la Plataforma</Link>, y</li>
              <li><Link href="/privacidad" target="_blank" style={link}>Política de Privacidad</Link>.</li>
            </ol>
            <p>En caso de conflicto, prevalecerá el documento más específico para la funcionalidad que estés usando.</p>
          </div>

          <div className="text-justify">
            <h5 style={h5}>2) Elegibilidad y capacidad</h5>
            <ul className="space-y-2">
              <li><strong>2.1.</strong> Debes tener 16 años o más para registrarte.</li>
              <li><strong>2.2.</strong> Garantizas que tienes capacidad legal para celebrar este Acuerdo y cumplirlo.</li>
              <li><strong>2.3.</strong> Si usas la cuenta en representación de una empresa u organización, declaras tener autorización para obligarla.</li>
            </ul>
          </div>

          <div className="text-justify">
            <h5 style={h5}>3) Registro de cuenta y seguridad</h5>
            <ul className="space-y-2">
              <li><strong>3.1.</strong> Para registrarte, debes proporcionar un correo electrónico y crear una contraseña.</li>
              <li><strong>3.2.</strong> Eres responsable de mantener tus credenciales seguras y de toda actividad realizada desde tu cuenta.</li>
              <li><strong>3.3.</strong> Debes notificarnos de inmediato si sospechas acceso no autorizado.</li>
              <li><strong>3.4.</strong> Podemos implementar medidas de seguridad (verificación, límites de intentos, bloqueos temporales) para prevenir abuso.</li>
            </ul>
          </div>

          <div className="text-justify">
            <h5 style={h5}>4) Perfil, identidad y datos visibles</h5>
            <ul className="space-y-2">
              <li><strong>4.1.</strong> La Plataforma podrá mostrar públicamente información asociada a tu actividad, incluyendo reseñas y publicaciones en foros.</li>
              <li><strong>4.2.</strong> Al publicar una reseña, aceptas que se muestre públicamente tu ciudad (por ejemplo, Brisbane, Sydney, etc.) como parte del contexto del contenido.</li>
              <li><strong>4.3.</strong> La Plataforma puede permitir un nombre visible (&quot;display name/username&quot;) como opción. Si no lo configuras, podremos mostrar un identificador genérico (por ejemplo, &quot;Usuario registrado&quot;) junto con tu ciudad.</li>
              <li><strong>4.4.</strong> No publiques en tu perfil o contenidos datos sensibles tuyos o de terceros (doxxing).</li>
            </ul>
          </div>

          <div className="text-justify">
            <h5 style={h5}>5) Reglas de conducta y uso permitido</h5>
            <p className="mb-2">Te comprometes a NO:</p>
            <ol className="list-[lower-alpha] pl-6 space-y-1">
              <li>publicar contenido ilegal, fraudulento o engañoso;</li>
              <li>difamar, acosar, amenazar o incitar violencia;</li>
              <li>publicar odio o discriminación;</li>
              <li>publicar datos personales sensibles o de terceros (doxxing), incluidos números de identificación, domicilios privados, información financiera o médica;</li>
              <li>suplantar identidades o falsificar afiliaciones;</li>
              <li>enviar spam, publicidad no autorizada o contenido repetitivo;</li>
              <li>intentar vulnerar la seguridad de la Plataforma, extraer datos masivamente (scraping), o interferir con su funcionamiento;</li>
              <li>publicar enlaces acortados, enlaces maliciosos o que dirijan a fraude (en especial en secciones de alta sensibilidad como empleos y comunidad).</li>
            </ol>
          </div>

          <div className="text-justify">
            <h5 style={h5}>6) Contenido generado por el usuario (UGC)</h5>
            <ul className="space-y-2">
              <li><strong>6.1.</strong> &quot;Contenido&quot; incluye reseñas, publicaciones en foros, textos, imágenes (donde estén permitidas), logos y cualquier material que subas.</li>
              <li><strong>6.2.</strong> Eres el único responsable de tu Contenido y garantizas que:
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  <li>tienes derechos y permisos para publicarlo,</li>
                  <li>no infringe derechos de autor, marca, privacidad o imagen de terceros,</li>
                  <li>es veraz en la medida en que afirme hechos.</li>
                </ul>
              </li>
              <li><strong>6.3.</strong> <em>Licencia a Latinterritory.</em> Al publicar Contenido, nos otorgas una licencia no exclusiva, mundial, transferible y sublicenciable, libre de regalías, para alojar, reproducir, adaptar (por ejemplo, para formatos), mostrar, distribuir y comunicar tu Contenido solo en la medida necesaria para operar, moderar, promocionar y mejorar la Plataforma.</li>
              <li><strong>6.4.</strong> <em>Retiro y copia.</em> Aunque elimines tu Contenido, puede haber copias temporales en caché, logs o respaldos por razones técnicas y de seguridad.</li>
            </ul>
          </div>

          <div className="text-justify">
            <h5 style={h5}>7) Reseñas (publicación, visibilidad y moderación posterior)</h5>
            <ul className="space-y-2">
              <li><strong>7.1.</strong> Las reseñas requieren inicio de sesión.</li>
              <li><strong>7.2.</strong> <em>Visibilidad:</em> por diseño, las reseñas publicadas se muestran públicamente y la Plataforma puede mostrar todas las reseñas (positivas, neutrales o negativas), salvo que infrinjan este Acuerdo, los Términos, o la ley.</li>
              <li><strong>7.3.</strong> <em>No pre-aprobación:</em> la publicación de reseñas puede ocurrir sin revisión previa; sin embargo, Latinterritory podrá moderar y retirar reseñas posteriormente.</li>
              <li><strong>7.4.</strong> Puedes editar o eliminar tus reseñas, sujeto a limitaciones técnicas razonables y a medidas de preservación de evidencia ante reportes, fraudes o requerimientos legales.</li>
              <li><strong>7.5.</strong> <em>Prohibiciones específicas:</em>
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  <li>reseñas falsas, difamatorias o con ataques personales,</li>
                  <li>acusaciones como hechos sin base (ej. &quot;son estafadores&quot;) sin evidencia verificable,</li>
                  <li>reseñas incentivadas sin revelar conflicto de interés,</li>
                  <li>publicación de datos personales de terceros,</li>
                  <li>spam, promociones o publicidad no autorizada.</li>
                </ul>
              </li>
              <li><strong>7.6.</strong> La Plataforma puede permitir respuesta del negocio (&quot;owner reply&quot;), la cual también debe cumplir estas reglas.</li>
            </ul>
          </div>

          <div className="text-justify">
            <h5 style={h5}>8) Foros (V1: solo texto) y contenido efímero</h5>
            <ul className="space-y-2">
              <li><strong>8.1.</strong> En V1, los foros son solo texto. No está permitido subir imágenes, archivos o adjuntos en foros.</li>
              <li><strong>8.2.</strong> En V1, las publicaciones del foro están diseñadas para borrado automático tras aproximadamente 24 horas.</li>
              <li><strong>8.3.</strong> Aun con borrado automático, reconoces que terceros pueden haber visto o copiado el Contenido mientras estuvo disponible.</li>
              <li><strong>8.4.</strong> Está prohibido usar foros para promociones, ventas directas o spam en V1 (salvo que la Plataforma habilite espacios específicos para ello).</li>
              <li><strong>8.5.</strong> Latinterritory puede ocultar o retirar publicaciones antes del plazo por seguridad, reportes, riesgo de fraude o incumplimiento.</li>
            </ul>
          </div>

          <div className="text-justify">
            <h5 style={h5}>9) Directorio de negocios y administración de fichas</h5>
            <ul className="space-y-2">
              <li><strong>9.1.</strong> Si creas o administras una ficha de negocio, declaras que eres el dueño o representante autorizado y que tienes derecho a publicar datos como nombre comercial, correo, teléfono, dirección, web y material gráfico.</li>
              <li><strong>9.2.</strong> Aceptas que estos datos pueden ser visibles públicamente sin login y ser indexados por motores de búsqueda.</li>
              <li><strong>9.3.</strong> Permitimos reclamar fichas (&quot;claim listing&quot;) y podemos solicitar evidencia razonable para transferir control o retirar contenido ante suplantación o fraude.</li>
              <li><strong>9.4.</strong> Los archivos subidos están limitados (por ejemplo, hasta 5 fotos por negocio, máximo 2MB por archivo), sujeto a reglas técnicas vigentes.</li>
            </ul>
          </div>

          <div className="text-justify">
            <h5 style={h5}>10) Empleos (V1) y enlaces externos</h5>
            <ul className="space-y-2">
              <li><strong>10.1.</strong> En V1, la Plataforma muestra anuncios de empleo y dirige a procesos de postulación externos mediante enlaces. No recopilamos CVs ni gestionamos postulaciones internas en V1.</li>
              <li><strong>10.2.</strong> No garantizamos la veracidad, legalidad o disponibilidad de sitios externos. Al salir de la Plataforma aplican términos/privacidad de terceros.</li>
              <li><strong>10.3.</strong> La categoría &quot;Community Services&quot; puede restringirse a anunciantes Partner Verified (ONG) según reglas vigentes.</li>
              <li><strong>10.4.</strong> Está prohibido publicar ofertas que pidan pagos para postularse, usen enlaces acortados, o promuevan fraude.</li>
            </ul>
          </div>

          <div className="text-justify">
            <h5 style={h5}>11) Moderación, automatización e IA</h5>
            <ul className="space-y-2">
              <li><strong>11.1.</strong> Podemos moderar contenido manualmente y/o con herramientas automatizadas (incluida IA) para prevenir abuso, fraude y contenido prohibido.</li>
              <li><strong>11.2.</strong> La moderación automatizada puede equivocarse. Puedes solicitar revisión mediante los canales oficiales de soporte/reporte.</li>
              <li><strong>11.3.</strong> Podemos ocultar, limitar o retirar contenido y restringir cuentas si lo consideramos necesario para seguridad, cumplimiento legal o integridad del servicio.</li>
            </ul>
          </div>

          <div className="text-justify">
            <h5 style={h5}>12) Reportes, quejas y &quot;takedown&quot;</h5>
            <ul className="space-y-2">
              <li><strong>12.1.</strong> Puedes reportar contenido o conducta.</li>
              <li><strong>12.2.</strong> Podemos solicitar información adicional para investigar.</li>
              <li><strong>12.3.</strong> Podemos actuar sin aviso previo en casos urgentes (fraude, doxxing, amenazas, riesgo legal).</li>
              <li><strong>12.4.</strong> Podemos ofrecer un proceso de apelación dentro de un plazo razonable (por ejemplo, 7 días), salvo casos de urgencia.</li>
            </ul>
          </div>

          <div className="text-justify">
            <h5 style={h5}>13) Suspensión y terminación</h5>
            <ul className="space-y-2">
              <li><strong>13.1.</strong> Puedes cerrar tu cuenta conforme a los mecanismos disponibles.</li>
              <li><strong>13.2.</strong> Podemos suspender o terminar tu acceso si:
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  <li>violas este Acuerdo o los Términos,</li>
                  <li>hay fraude, suplantación o abuso,</li>
                  <li>es necesario por requerimiento legal o seguridad.</li>
                </ul>
              </li>
              <li><strong>13.3.</strong> La terminación puede implicar pérdida de acceso a contenido, sujeto a lo indicado en la Política de Privacidad sobre retención técnica.</li>
            </ul>
          </div>

          <div className="text-justify">
            <h5 style={h5}>14) Seguridad, disponibilidad y cambios</h5>
            <ul className="space-y-2">
              <li><strong>14.1.</strong> La Plataforma se ofrece &quot;tal cual&quot; y &quot;según disponibilidad&quot;.</li>
              <li><strong>14.2.</strong> Podemos cambiar, actualizar o discontinuar funciones en cualquier momento por mantenimiento o mejoras.</li>
              <li><strong>14.3.</strong> Podemos actualizar este Acuerdo; al continuar usando la Plataforma, aceptas la versión vigente.</li>
            </ul>
          </div>

          <div className="text-justify">
            <h5 style={h5}>15) Limitación de responsabilidad</h5>
            <ul className="space-y-2">
              <li><strong>15.1.</strong> En la medida permitida por la ley, Latinterritory no será responsable por:
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  <li>contenido de terceros (negocios, reseñas, foros, anunciantes),</li>
                  <li>pérdidas indirectas, incidentales o consecuenciales,</li>
                  <li>daños derivados de enlaces externos o servicios de terceros,</li>
                  <li>interrupciones o fallos fuera de nuestro control razonable.</li>
                </ul>
              </li>
              <li><strong>15.2.</strong> Nada en este Acuerdo limita derechos que no puedan excluirse legalmente.</li>
            </ul>
          </div>

          <div className="text-justify">
            <h5 style={h5}>16) Indemnidad</h5>
            <p>
              En la medida permitida por la ley, aceptas defender, indemnizar y mantener indemne a Latinterritory frente a reclamaciones de terceros derivadas de:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>tu Contenido,</li>
              <li>tu incumplimiento de este Acuerdo,</li>
              <li>infracción de derechos de terceros,</li>
              <li>uso indebido de la Plataforma.</li>
            </ul>
          </div>

          <div className="text-justify">
            <h5 style={h5}>17) Ley aplicable y jurisdicción</h5>
            <p>
              Este Acuerdo se rige por las leyes de Queensland, Australia, y las partes se someten a la jurisdicción de sus tribunales, salvo que la ley disponga lo contrario.
            </p>
          </div>

          <div className="text-justify">
            <h5 style={h5}>18) Contacto</h5>
            <p>
              Para privacidad, reportes o solicitudes: <a href="mailto:privacy@latinterritory.com" style={link}>privacy@latinterritory.com</a>
            </p>
          </div>

        </div>

        <div style={{ padding: 24, borderTop: '1px solid var(--lh-border)' }}>
          <label className="flex items-start gap-3 cursor-pointer" style={{ marginBottom: 22 }}>
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => onAcceptedChange(e.target.checked)}
              style={{ marginTop: 2, width: 18, height: 18, flexShrink: 0, accentColor: 'var(--lh-accent)', cursor: 'pointer' }}
              aria-describedby="contract-acceptance-description"
            />
            <span id="contract-acceptance-description" style={{ fontSize: 14, userSelect: 'none', color: 'var(--lh-fg2)', lineHeight: 1.5 }}>
              Al crear mi cuenta, declaro que tengo <strong style={strong}>16 años o más</strong> y acepto los{' '}
              <Link href="/terminos" target="_blank" style={link}>Términos de Uso</Link>, la{' '}
              <Link href="/privacidad" target="_blank" style={link}>Política de Privacidad</Link> y el{' '}
              <strong style={strong}>Contrato de Usuario Registrado</strong>.
            </span>
          </label>

          <div className="flex gap-3">
            <Button onClick={onClose} disabled={isLoading} variant="secondary" size="md" style={{ flex: 1 }}>
              Cancelar
            </Button>
            <Button onClick={onConfirm} disabled={!accepted || isLoading} variant="primary" size="md" style={{ flex: 1 }} aria-label={isLoading ? 'Procesando...' : submitLabel}>
              {!isLoading && <CheckCircle size={18} />}
              {isLoading ? 'Procesando…' : submitLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
