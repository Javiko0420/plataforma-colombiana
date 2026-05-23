// src/app/terminos/page.tsx
import { Metadata } from "next";
import { LtPageShell, LtPanel } from "@/components/lt";

export const metadata: Metadata = {
  title: "Términos de Uso | Latinterritory",
  description:
    "Condiciones generales de uso de la plataforma Latinterritory.",
};

export default function TermsPage() {
  return (
    <LtPageShell maxWidth="5xl">
      <LtPanel className="p-8 md:p-12">
        <div className="border-b-[2px] border-[var(--lt-ink)] pb-8 mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            Términos de Uso — Latinterritory
          </h1>
          <p style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}>
            Última actualización: 31 de enero de 2026
          </p>
        </div>

        <article
          className="max-w-none space-y-4 text-sm leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:pt-4 [&_h2]:text-[var(--lt-ink)] [&_h3]:font-semibold [&_h3]:pt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-[var(--lt-terracota)] [&_a]:underline [&_strong]:text-[var(--lt-ink)]"
          style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}
        >
          <p>
            Estos Términos de Uso (&quot;Términos&quot;) regulan el acceso y uso
            de <strong>latinterritory.com</strong> (la &quot;Plataforma&quot;),
            operada por <strong>Javier Felipe Guerrero Zambrano</strong>{" "}
            (&quot;Latinterritory&quot;, &quot;nosotros&quot;), con base en
            Brisbane, QLD, Australia.
          </p>
          <p>
            Al acceder o usar la Plataforma, aceptas estos Términos. Si no estás
            de acuerdo, no uses la Plataforma.
          </p>

          {/* Sección 1 */}
          <h2>1) Documentos aplicables</h2>
          <p>Estos Términos se complementan con:</p>
          <ul>
            <li>Política de Privacidad, y</li>
            <li>
              políticas y reglas publicadas en la Plataforma (por ejemplo,
              reglas de comunidad, directorio y empleos).
            </li>
          </ul>
          <p>
            En caso de conflicto, prevalecerán las reglas más específicas para
            la funcionalidad correspondiente.
          </p>

          {/* Sección 2 */}
          <h2>2) Qué es Latinterritory y qué NO es</h2>
          <p>
            <strong>Latinterritory es</strong> una plataforma para:
          </p>
          <ul>
            <li>listar y descubrir negocios (Directorio),</li>
            <li>publicar reseñas,</li>
            <li>participar en foros (contenido de duración limitada),</li>
            <li>visualizar anuncios de empleo con enlaces externos (V1).</li>
          </ul>
          <p>
            <strong>Latinterritory NO es:</strong>
          </p>
          <ul>
            <li>
              empleador, agencia de reclutamiento, ni intermediario de
              contratación;
            </li>
            <li>
              proveedor de los servicios ofrecidos por negocios listados;
            </li>
            <li>
              garante de la veracidad, exactitud o legalidad del contenido
              publicado por terceros.
            </li>
          </ul>

          {/* Sección 3 */}
          <h2>3) Elegibilidad</h2>
          <p>
            La Plataforma no está dirigida a menores de 16 años. Si eres menor
            de 16, no uses la Plataforma ni crees una cuenta.
          </p>

          {/* Sección 4 */}
          <h2>4) Cuenta, acceso y seguridad</h2>
          <p>
            <strong>4.1.</strong> Para reseñar o publicar en foros debes crear
            una cuenta con email y contraseña.
          </p>
          <p>
            <strong>4.2.</strong> El &quot;username/alias&quot; es opcional y no
            es requerido para iniciar sesión.
          </p>
          <p>
            <strong>4.3.</strong> Eres responsable de:
          </p>
          <ul>
            <li>mantener tu contraseña segura,</li>
            <li>toda actividad realizada con tu cuenta,</li>
            <li>notificar cualquier acceso no autorizado.</li>
          </ul>
          <p>
            <strong>4.4.</strong> Podemos suspender o cerrar cuentas si
            detectamos fraude, abuso o incumplimientos.
          </p>

          {/* Sección 5 */}
          <h2>5) Directorio de negocios</h2>

          <h3>5.1 Creación, autorización y veracidad</h3>
          <p>
            Las fichas del Directorio las crea el dueño o representante
            autorizado del negocio. Al publicar, declaras que:
          </p>
          <ul>
            <li>
              tienes derecho a publicar los datos (teléfono, email, dirección,
              web),
            </li>
            <li>la información es veraz y actualizada,</li>
            <li>tienes permisos sobre logos/fotos.</li>
          </ul>

          <h3>5.2 Visibilidad pública</h3>
          <p>
            El Directorio puede ser visible sin login. Al publicar datos de
            contacto y dirección, aceptas que:
          </p>
          <ul>
            <li>pueden ser vistos por cualquier persona,</li>
            <li>pueden ser indexados por motores de búsqueda,</li>
            <li>terceros pueden copiarlos mientras estén públicos.</li>
          </ul>

          <h3>5.3 Fotos y logos</h3>
          <p>
            Puedes subir hasta 5 fotos por negocio, con un máximo de 2 MB por
            archivo, además del logo (según límites publicados en la
            Plataforma).
          </p>
          <p>
            No publiques contenido que infrinja derechos de autor, marcas o
            derechos de imagen.
          </p>

          <h3>5.4 Edición y eliminación</h3>
          <p>
            El dueño del negocio puede editar y eliminar sus fichas.
            Latinterritory puede conservar registros técnicos razonables por
            seguridad y prevención de fraude.
          </p>

          <h3>5.5 Reclamar negocio (&quot;claim listing&quot;)</h3>
          <p>
            Si un negocio fue publicado por alguien no autorizado, el dueño
            legítimo puede solicitar el reclamo. Latinterritory podrá requerir
            evidencia razonable y:
          </p>
          <ul>
            <li>transferir la administración de la ficha, o</li>
            <li>retirar/ajustar la ficha si corresponde.</li>
          </ul>

          {/* Sección 6 */}
          <h2>6) Reseñas</h2>
          <p>
            <strong>6.1.</strong> Las reseñas requieren inicio de sesión y no
            son anónimas dentro de la Plataforma.
          </p>
          <p>
            <strong>6.2.</strong> Los usuarios pueden editar o eliminar sus
            reseñas.
          </p>
          <p>
            <strong>6.3.</strong> Reglas: se prohíbe difamación, acoso, odio,
            amenazas, doxxing, spam y publicidad engañosa.
          </p>
          <p>
            <strong>6.4.</strong> Respuesta del negocio: la Plataforma puede
            permitir que el negocio responda públicamente a una reseña
            (&quot;owner reply&quot;).
          </p>
          <p>
            <strong>6.5.</strong> Moderación: Latinterritory puede moderar de
            forma manual y/o con herramientas automatizadas (incluyendo IA).
            Puede haber errores. Puedes solicitar revisión.
          </p>

          {/* Sección 7 */}
          <h2>7) Foros (contenido de 24 horas)</h2>
          <p>
            <strong>7.1.</strong> Para publicar en foros debes iniciar sesión.
          </p>
          <p>
            <strong>7.2.</strong> En V1, las publicaciones del foro están
            diseñadas para borrado automático al cumplirse el período de
            duración (por ejemplo, 24 horas).
          </p>
          <p>
            <strong>7.3.</strong> Aun con borrado, el contenido pudo ser visto o
            copiado por terceros mientras estuvo publicado.
          </p>
          <p>
            <strong>7.4.</strong> Se prohíben acoso, suplantación, fraude,
            doxxing, contenido ilegal y spam.
          </p>
          <p>
            <strong>7.5.</strong> En V1 se prohíbe publicar promociones/venta
            directa o publicidad dentro de foros y reseñas, salvo que la
            Plataforma habilite espacios controlados para ello.
          </p>

          {/* Sección 8 */}
          <h2>8) Empleos</h2>

          <h3>8.1 Rol y postulaciones externas</h3>
          <p>
            Latinterritory permite visualizar anuncios de empleo. En V1, la
            postulación se realiza mediante enlaces externos. Latinterritory no
            recopila CVs ni gestiona postulaciones internas en V1.
          </p>

          <h3>8.2 Verificación y categorías</h3>
          <p>
            Los anunciantes deben cumplir requisitos de verificación. La
            categoría Community Services está restringida a anunciantes con
            estatus Partner Verified (ONG).
          </p>

          <h3>8.3 Enlaces externos</h3>
          <p>
            Al hacer clic en &quot;Aplicar en sitio externo&quot;, el usuario
            sale de Latinterritory. No controlamos ni somos responsables del
            contenido, disponibilidad o prácticas de privacidad del sitio
            externo.
          </p>

          <h3>8.4 Datos de contacto en anuncios (V1)</h3>
          <p>Para reducir fraude, scraping y abuso:</p>
          <ul>
            <li>
              el método principal de postulación será el enlace externo;
            </li>
            <li>
              no se permite publicar números de teléfono como canal de
              postulación o contacto dentro del anuncio en V1;
            </li>
            <li>
              se podrá permitir un correo electrónico institucional del
              anunciante como contacto adicional solo si corresponde a un
              dominio legítimo (por ejemplo, dominio corporativo u
              organizacional), sujeto a las reglas y validaciones publicadas por
              Latinterritory;
            </li>
            <li>
              se prohíben enlaces acortados y canales de contacto de alto riesgo
              como &quot;solo WhatsApp/Telegram&quot;.
            </li>
          </ul>

          <h3>8.5 Prohibiciones</h3>
          <p>Se prohíbe publicar anuncios que:</p>
          <ul>
            <li>pidan pagos para aplicar,</li>
            <li>prometan empleo/ingresos garantizados,</li>
            <li>utilicen enlaces acortados,</li>
            <li>sean discriminatorios o ilegales,</li>
            <li>contengan fraude o suplantación.</li>
          </ul>
          <p>
            Latinterritory puede retirar anuncios ante riesgo o reportes
            creíbles.
          </p>

          {/* Sección 9 */}
          <h2>9) Servicios Premium y pagos (futuro)</h2>
          <p>
            Latinterritory puede ofrecer servicios de pago (por ejemplo,
            anuncios destacados, planes premium o funciones adicionales). Los
            precios, alcance, duración y condiciones se publicarán antes de la
            compra, junto con políticas de reembolso/cancelación aplicables.
            Nada en estos Términos limita derechos que no puedan excluirse
            legalmente.
          </p>

          {/* Sección 10 */}
          <h2>10) Contenido generado por usuarios (UGC) y licencia</h2>
          <p>
            Tú conservas la titularidad de tu contenido, pero al publicarlo
            otorgas a Latinterritory una licencia no exclusiva, mundial y libre
            de regalías para alojar, reproducir, mostrar y distribuir tu
            contenido con el fin de operar y mejorar la Plataforma. Garantizas
            que tienes derecho a publicarlo y que no infringe derechos de
            terceros.
          </p>

          {/* Sección 11 */}
          <h2>11) Uso aceptable y prohibiciones generales</h2>
          <p>No puedes usar la Plataforma para:</p>
          <ul>
            <li>actividades ilegales, fraude, suplantación,</li>
            <li>acoso, amenazas, odio, doxxing,</li>
            <li>spam o publicidad no autorizada,</li>
            <li>vulnerar seguridad o distribuir malware,</li>
            <li>
              extracción automatizada de datos (scraping) o recolección masiva
              de emails/teléfonos,
            </li>
            <li>interferir con el funcionamiento de la Plataforma.</li>
          </ul>
          <p>
            Podemos aplicar rate limiting, bloqueos y medidas técnicas para
            proteger el servicio.
          </p>

          {/* Sección 12 */}
          <h2>12) Reportes, quejas y retiro (&quot;takedown&quot;)</h2>
          <p>
            Puedes reportar contenido. Podemos ocultar, retirar o restringir
            contenido/cuentas ante reportes creíbles, riesgo de fraude/daño o
            incumplimiento de estos Términos.
          </p>

          {/* Sección 13 */}
          <h2>13) Apelaciones</h2>
          <p>
            Si se toma una medida contra tu cuenta o contenido, podrás solicitar
            revisión (&quot;apelación&quot;) dentro de 7 días, salvo casos
            urgentes de seguridad o ilegalidad.
          </p>

          {/* Sección 14 */}
          <h2>14) Propiedad intelectual de Latinterritory</h2>
          <p>
            La marca, el diseño, el código y los elementos propios de la
            Plataforma pertenecen a Latinterritory o a sus licenciantes. No
            puedes copiarlos o explotarlos sin permiso.
          </p>

          {/* Sección 15 */}
          <h2>15) Privacidad</h2>
          <p>
            El tratamiento de información se rige por nuestra{" "}
            <a href="/privacidad">Política de Privacidad</a>.
          </p>

          {/* Sección 16 */}
          <h2>16) Disponibilidad y cambios</h2>
          <p>
            Podemos actualizar, modificar, suspender o interrumpir la Plataforma
            por mantenimiento, seguridad o mejoras. Podemos actualizar estos
            Términos; el uso continuado implica aceptación de la versión
            vigente.
          </p>

          {/* Sección 17 */}
          <h2>17) Responsabilidad y limitaciones</h2>
          <p>
            La Plataforma se ofrece &quot;tal cual&quot; y &quot;según
            disponibilidad&quot;. En la medida permitida por la ley,
            Latinterritory no será responsable por pérdidas indirectas o
            consecuenciales derivadas del uso de la Plataforma o del contenido
            de terceros (negocios, reseñas, anuncios, enlaces externos). Nada en
            estos Términos excluye derechos que no puedan excluirse legalmente.
          </p>

          {/* Sección 18 */}
          <h2>18) Indemnidad</h2>
          <p>
            En la medida permitida por ley, aceptas indemnizar a Latinterritory
            por reclamos de terceros derivados de tu contenido, tu
            incumplimiento de estos Términos, infracción de derechos de terceros
            o uso indebido de la Plataforma.
          </p>

          {/* Sección 19 */}
          <h2>19) Terminación</h2>
          <p>
            Puedes dejar de usar la Plataforma en cualquier momento.
            Latinterritory puede suspender o terminar el acceso si existe
            incumplimiento, fraude, riesgo o motivos de seguridad.
          </p>

          {/* Sección 20 */}
          <h2>20) Ley aplicable y jurisdicción</h2>
          <p>
            Estos Términos se rigen por las leyes de Queensland, Australia, y
            las partes se someten a la jurisdicción de sus tribunales, salvo que
            la ley disponga lo contrario.
          </p>

          {/* Sección 21 */}
          <h2>21) Contacto</h2>
          <p>Para soporte, reportes o quejas:</p>
          <ul>
            <li>
              <strong>Email:</strong>{" "}
              <a href="mailto:privacy@latinterritory.com">
                privacy@latinterritory.com
              </a>
            </li>
          </ul>
        </article>
      </LtPanel>
    </LtPageShell>
  );
}
