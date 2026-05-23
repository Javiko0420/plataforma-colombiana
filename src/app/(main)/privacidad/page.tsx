import { Metadata } from "next";
import { LtPageShell, LtPanel } from "@/components/lt";

export const metadata: Metadata = {
  title: "Política de Privacidad | Latinterritory",
  description:
    "Bases legales y política de tratamiento de datos de Latinterritory.",
};

export default function PrivacyPage() {
  return (
    <LtPageShell maxWidth="5xl">
      <LtPanel className="p-8 md:p-12">
        <div className="border-b-[2px] border-[var(--lt-ink)] pb-8 mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            Política de Privacidad — Latinterritory
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
            Esta Política de Privacidad describe cómo{" "}
            <strong>Latinterritory</strong> (&quot;nosotros&quot;) recopila,
            usa, almacena y comparte información cuando usas{" "}
            <strong>latinterritory.com</strong> (la &quot;Plataforma&quot;),
            incluyendo el Directorio, Reseñas, Foros y Empleos.
          </p>

          {/* Sección 1 */}
          <h2>1) Responsable (quién opera la Plataforma)</h2>
          <ul>
            <li>
              <strong>Operador:</strong> Javier Felipe Guerrero Zambrano
              (persona natural)
            </li>
            <li>
              <strong>Ubicación:</strong> Brisbane, QLD, Australia
            </li>
            <li>
              <strong>Contacto de privacidad:</strong>{" "}
              <a href="mailto:privacy@latinterritory.com">
                privacy@latinterritory.com
              </a>
            </li>
          </ul>

          {/* Sección 2 */}
          <h2>2) Alcance y principios</h2>
          <p>
            Latinterritory busca gestionar la información de forma abierta y
            transparente y, cuando corresponda, en línea con los{" "}
            <strong>Australian Privacy Principles (APPs)</strong> del{" "}
            <em>Privacy Act 1988 (Cth)</em>.
          </p>

          {/* Sección 3 */}
          <h2>3) Información que recopilamos</h2>
          <p>
            Dependiendo de cómo uses la Plataforma, podemos recopilar la
            siguiente información:
          </p>

          <h3>3.1 Información de cuenta (usuarios)</h3>
          <p>Si creas una cuenta para reseñar o participar en foros:</p>
          <ul>
            <li>correo electrónico,</li>
            <li>contraseña (almacenada como hash; nunca en texto plano),</li>
            <li>
              nombre de usuario/alias (opcional dentro de la Plataforma, no
              requerido para iniciar sesión),
            </li>
            <li>fecha/hora de registro e inicios de sesión,</li>
            <li>información que elijas añadir en tu perfil.</li>
          </ul>
          <p>
            <em>No solicitamos número de teléfono al usuario final en V1.</em>
          </p>

          <h3>3.2 Información del Directorio (negocios)</h3>
          <p>
            Los dueños o representantes de los negocios crean y administran sus
            fichas. Podemos almacenar y mostrar:
          </p>
          <ul>
            <li>nombre comercial,</li>
            <li>
              categoría (gastronomía, servicios, construcción, educación,
              tecnología),
            </li>
            <li>dirección física del negocio,</li>
            <li>teléfono y correo electrónico de contacto,</li>
            <li>enlace al sitio web,</li>
            <li>descripción,</li>
            <li>logo e imágenes del negocio.</li>
          </ul>
          <p>
            <strong>Imágenes:</strong> permitimos subir logos y fotos, con un
            tamaño máximo de 2 MB por archivo y un máximo de fotos por negocio
            según las reglas del producto (incluyendo límites publicados en la
            Plataforma).
          </p>
          <p>
            <strong>Visibilidad pública:</strong> el Directorio y los datos de
            contacto del negocio pueden ser visibles públicamente sin necesidad
            de iniciar sesión, y pueden ser indexados por motores de búsqueda.
          </p>

          <h3>3.3 Reseñas</h3>
          <p>
            Para publicar reseñas debes iniciar sesión. Las reseñas no son
            anónimas dentro de la Plataforma:
          </p>
          <ul>
            <li>almacenamos tu reseña y metadatos (fecha/hora),</li>
            <li>mostramos tu alias/perfil asociado a la reseña.</li>
          </ul>

          <h3>3.4 Foros</h3>
          <p>
            Para publicar en foros debes iniciar sesión. Los foros están
            diseñados para que el contenido sea visible durante un período
            limitado (por ejemplo, 24 horas), pero:
          </p>
          <ul>
            <li>
              el contenido puede ser copiado por terceros mientras esté
              publicado,
            </li>
            <li>
              podemos conservar registros técnicos y de seguridad por un período
              adicional razonable (ver sección 9).
            </li>
          </ul>

          <h3>3.5 Empleos y enlaces externos</h3>
          <p>
            En la sección de Empleos almacenamos información del anuncio
            (título, categoría, ciudad/estado, tipo de empleo, horas,
            descripción, requisitos relevantes como White Card si el trabajo es
            en obra, y enlace externo de postulación).
          </p>
          <p>
            <strong>V1:</strong> no recopilamos CVs ni realizamos postulaciones
            internas. La postulación se realiza en el sitio del anunciante u
            otra plataforma externa mediante enlace.
          </p>

          <h3>3.6 Verificación (empleos y Partner Verified)</h3>
          <p>
            Podemos recopilar información para verificación de anunciantes,
            incluyendo:
          </p>
          <ul>
            <li>verificación de correo electrónico,</li>
            <li>
              información del publicador del empleo y validaciones razonables,
            </li>
            <li>
              verificación manual para &quot;Partner Verified (ONG)&quot; (por
              ejemplo, comprobaciones razonables para confirmar
              identidad/representación).
            </li>
          </ul>

          <h3>3.7 Datos técnicos, seguridad y cookies</h3>
          <p>Recopilamos automáticamente cierta información técnica:</p>
          <ul>
            <li>
              dirección IP, tipo de navegador/dispositivo, sistema operativo,
            </li>
            <li>registros de acceso, actividad y eventos de seguridad,</li>
            <li>
              cookies y tecnologías similares necesarias para sesión, seguridad
              y funcionamiento del sitio.
            </li>
          </ul>

          {/* Sección 4 */}
          <h2>4) Google Analytics</h2>
          <p>
            Usamos (o planeamos usar) <strong>Google Analytics</strong> para
            entender el uso de la Plataforma y mejorarla. Esto puede implicar
            cookies/identificadores y recopilación de datos de navegación (p.
            ej., páginas visitadas, duración, eventos).
          </p>
          <p>
            Puedes gestionar cookies desde la configuración de tu navegador. Si
            implementamos un banner de cookies u opciones adicionales, lo
            comunicaremos en la Plataforma.
          </p>

          {/* Sección 5 */}
          <h2>5) Cómo usamos la información</h2>
          <p>Usamos la información para:</p>
          <ul>
            <li>
              operar cuentas, directorio, reseñas, foros y anuncios de empleo,
            </li>
            <li>
              publicar y mostrar contenido según la configuración del
              usuario/negocio,
            </li>
            <li>
              apoyar procesos de verificación (por ejemplo, Partner Verified),
            </li>
            <li>moderar contenido y aplicar normas,</li>
            <li>prevenir fraude, abuso, suplantación y scraping,</li>
            <li>mejorar rendimiento, estabilidad y experiencia de usuario,</li>
            <li>responder solicitudes de soporte y reportes.</li>
          </ul>

          {/* Sección 6 */}
          <h2>6) Moderación automatizada (IA) y decisiones</h2>
          <p>
            Podemos usar herramientas automatizadas (incluyendo IA) para ayudar
            a:
          </p>
          <ul>
            <li>detectar spam, fraude, abuso o contenido no permitido,</li>
            <li>apoyar la moderación de reseñas y publicaciones.</li>
          </ul>
          <p>
            Estas herramientas pueden cometer errores. Los usuarios pueden
            reportar contenido y solicitar revisión mediante nuestros canales de
            reporte/soporte.
          </p>

          {/* Sección 7 */}
          <h2>7) Cuándo compartimos información</h2>

          <h3>7.1 Información pública</h3>
          <p>Parte del contenido es público por diseño, incluyendo:</p>
          <ul>
            <li>
              fichas del Directorio y datos de contacto que el dueño publique,
            </li>
            <li>anuncios de empleo (sin datos de candidatos),</li>
            <li>
              reseñas asociadas al alias/perfil del usuario dentro de la
              Plataforma.
            </li>
          </ul>

          <h3>7.2 Proveedores de servicio</h3>
          <p>Usamos proveedores para operar la Plataforma, incluyendo:</p>
          <ul>
            <li>
              <strong>Vercel</strong> (hosting/despliegue),
            </li>
            <li>
              <strong>Cloudflare</strong> (DNS/seguridad/performance),
            </li>
            <li>
              <strong>Neon</strong> (base de datos),
            </li>
            <li>
              <strong>Cloudinary</strong> (almacenamiento/entrega de imágenes),
            </li>
            <li>
              <strong>Google Analytics</strong> (analítica).
            </li>
          </ul>
          <p>
            Estos proveedores pueden procesar datos en Australia u otras
            jurisdicciones según su infraestructura.
          </p>

          <h3>7.3 Requerimientos legales y protección</h3>
          <p>
            Podemos divulgar información si es razonablemente necesario para:
          </p>
          <ul>
            <li>cumplir obligaciones legales,</li>
            <li>responder a autoridades,</li>
            <li>investigar incidentes de seguridad, fraude o abuso,</li>
            <li>
              proteger derechos, seguridad y propiedad de usuarios, terceros y
              de la Plataforma.
            </li>
          </ul>

          {/* Sección 8 */}
          <h2>8) Transferencias internacionales</h2>
          <p>
            Aunque operamos con enfoque en Australia, algunos proveedores pueden
            procesar o almacenar datos fuera de Australia. Tomamos medidas
            razonables para seleccionar proveedores confiables y proteger la
            información.
          </p>

          {/* Sección 9 */}
          <h2>9) Retención de datos</h2>
          <ul>
            <li>
              <strong>Datos de cuenta:</strong> mientras la cuenta esté activa o
              sea necesario para operar la Plataforma.
            </li>
            <li>
              <strong>Foros:</strong> el contenido se muestra por un período
              limitado (por ejemplo, 24 horas), pero podemos retener registros
              técnicos y de seguridad por un período adicional razonable para
              prevenir abuso e investigar incidentes.
            </li>
            <li>
              <strong>Logs de seguridad y moderación:</strong> podemos
              retenerlos por períodos razonables para prevenir fraude, resolver
              disputas y proteger a la comunidad.
            </li>
            <li>
              <strong>Eliminación/anonimización:</strong> cuando sea posible y
              ya no sea necesario conservarlos, eliminaremos o anonimizaremos
              datos, salvo que exista obligación legal de retención.
            </li>
          </ul>

          {/* Sección 10 */}
          <h2>10) Seguridad</h2>
          <p>
            Aplicamos medidas razonables para proteger la información (controles
            de acceso, registros, mitigación de abuso). Sin embargo, ningún
            sistema es completamente seguro.
          </p>

          {/* Sección 11 */}
          <h2>11) Tus derechos y opciones</h2>
          <p>Puedes:</p>
          <ul>
            <li>actualizar tu información de cuenta y tu alias/perfil,</li>
            <li>solicitar corrección de información inexacta,</li>
            <li>
              solicitar eliminación de cuenta (sujeto a retención razonable por
              seguridad/obligaciones legales),
            </li>
            <li>
              reportar contenido (reseñas, foros, anuncios) y solicitar
              revisión.
            </li>
          </ul>
          <p>
            <strong>Importante:</strong> si publicaste teléfono/email/dirección
            en una ficha, esa información pudo haber sido copiada o indexada por
            terceros antes de que la elimines.
          </p>

          {/* Sección 12 */}
          <h2>12) Menores de edad</h2>
          <p>
            La Plataforma no está dirigida a menores de 16 años. Si crees que un
            menor nos proporcionó información personal, contáctanos.
          </p>

          {/* Sección 13 */}
          <h2>13) Sitios externos</h2>
          <p>
            La Plataforma incluye enlaces a sitios externos (por ejemplo,
            postulación a empleos). No controlamos las prácticas de privacidad
            de terceros. Revisa sus políticas antes de enviar información.
          </p>

          {/* Sección 14 */}
          <h2>14) Cambios a esta política</h2>
          <p>
            Podemos actualizar esta política para reflejar cambios en la
            Plataforma o requisitos legales. Publicaremos la versión vigente con
            una nueva fecha de actualización.
          </p>

          {/* Sección 15 */}
          <h2>15) Contacto</h2>
          <p>
            Para consultas o solicitudes relacionadas con privacidad:
          </p>
          <ul>
            <li>
              <strong>Email:</strong>{" "}
              <a href="mailto:privacy@latinterritory.com">
                privacy@latinterritory.com
              </a>
            </li>
            <li>
              <strong>Operador:</strong> Javier Felipe Guerrero Zambrano
            </li>
            <li>
              <strong>Ubicación:</strong> Brisbane, QLD, Australia
            </li>
          </ul>
        </article>
      </LtPanel>
    </LtPageShell>
  );
}
