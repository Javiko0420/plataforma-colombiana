import { Metadata } from "next";
import { LtPageShell, LtPanel } from "@/components/lt";

export const metadata: Metadata = {
  title: "Normas de la Comunidad | Latinterritory",
  description:
    "Reglas de participación para los foros de Latinterritory.com",
};

export default function CommunityGuidelinesPage() {
  return (
    <LtPageShell maxWidth="5xl">
      <LtPanel className="p-8 md:p-12">
        <div className="border-b-[2px] border-[var(--lt-ink)] pb-8 mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            Community Guidelines (Normas de la Comunidad)
          </h1>
          <p style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}>
            Última actualización: 03 de febrero de 2026
          </p>
        </div>

        <article
          className="max-w-none space-y-4 text-sm leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:pt-4 [&_h2]:text-[var(--lt-ink)] [&_h3]:font-semibold [&_h3]:pt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-[var(--lt-terracota)] [&_a]:underline [&_strong]:text-[var(--lt-ink)]"
          style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}
        >
          <p>
            Bienvenido/a a la comunidad de Latinterritory.com (la
            &quot;Plataforma&quot;). Estas Community Guidelines
            (&quot;Normas&quot;) establecen las reglas para participar en foros
            y espacios comunitarios (&quot;Foros&quot;). Nuestro objetivo es un
            espacio seguro y útil para la comunidad latina y emprendedora en
            Australia.
          </p>
          <p>
            Estas Normas complementan nuestros Términos de Uso, Política de
            Privacidad y el Contrato de Usuario Registrado. En caso de
            conflicto, estas Normas prevalecen sobre asuntos relacionados con
            Foros.
          </p>

          {/* Sección 1 */}
          <h2>1) Principios del foro</h2>
          <ul>
            <li>
              1.1. Los Foros están diseñados para conversaciones respetuosas,
              informativas y seguras.
            </li>
            <li>
              1.2. El contenido publicado en Foros es contenido generado por
              usuarios. Cada autor es responsable de lo que publica.
            </li>
            <li>
              1.3. No somos una autoridad pública ni un servicio de emergencias.
              Si existe riesgo inmediato, llama a los números de emergencia
              locales.
            </li>
          </ul>

          {/* Sección 2 */}
          <h2>2) Requisitos de participación</h2>
          <ul>
            <li>
              2.1. Para publicar debes iniciar sesión con una cuenta válida.
            </li>
            <li>
              2.2. En V1, los Foros son solo texto: no se permiten imágenes,
              archivos, adjuntos ni contenido incrustado.
            </li>
            <li>
              2.3. Podemos aplicar verificación, límites de publicación o
              medidas anti-spam para proteger la comunidad.
            </li>
          </ul>

          {/* Sección 3 */}
          <h2>3) Visibilidad, naturaleza efímera y expectativas</h2>
          <ul>
            <li>
              3.1. Las publicaciones pueden ser visibles para otros usuarios y/o
              visitantes según la configuración del Foro.
            </li>
            <li>
              3.2. En V1, las publicaciones están diseñadas para borrado
              automático tras aproximadamente 24 horas.
            </li>
            <li>
              3.3. Aun con borrado automático, reconoces que otros usuarios
              pueden haber leído, copiado o compartido el contenido mientras
              estuvo disponible.
            </li>
            <li>
              3.4. No publiques nada que no estarías dispuesto/a a ver citado
              fuera del Foro.
            </li>
          </ul>

          {/* Sección 4 */}
          <h2>4) Reglas obligatorias de conducta</h2>
          <p>Debes cumplir estas reglas:</p>

          <h3>4.1 Respeto y convivencia</h3>
          <ul>
            <li>No acoses, intimides o humilles a otros usuarios.</li>
            <li>
              No ataques a personas por su origen, nacionalidad, raza, religión,
              género, orientación sexual, discapacidad u otras características.
            </li>
            <li>No incites a violencia, autolesión o daño.</li>
          </ul>

          <h3>
            4.2 Cero tolerancia a difamación y acusaciones graves sin fundamento
          </h3>
          <ul>
            <li>
              No publiques acusaciones criminales o graves como hechos
              (&quot;estafa&quot;, &quot;robo&quot;, &quot;fraude&quot;,
              &quot;delito&quot;) sin base razonable y sin la debida cautela.
            </li>
            <li>
              No uses el Foro para &quot;linchar&quot; públicamente a negocios o
              personas.
            </li>
            <li>
              Puedes compartir experiencias y opiniones, pero evita acusaciones
              contundentes sin evidencias verificables.
            </li>
          </ul>

          <h3>4.3 Prohibición de doxxing y datos sensibles</h3>
          <p>Está prohibido publicar:</p>
          <ul>
            <li>
              direcciones privadas o datos personales de individuos (no confundir
              con direcciones comerciales ya públicas),
            </li>
            <li>
              teléfonos personales, emails personales, documentos, IDs, datos
              bancarios o médicos,
            </li>
            <li>capturas de conversaciones privadas sin consentimiento,</li>
            <li>cualquier información que ponga a alguien en riesgo.</li>
          </ul>

          <h3>4.4 Estafas, fraude y seguridad</h3>
          <p>No publiques:</p>
          <ul>
            <li>
              ofertas demasiado buenas para ser verdad, esquemas piramidales o
              &quot;trabajos&quot; que pidan dinero por adelantado,
            </li>
            <li>
              solicitudes de pagos, depósitos, gift cards o cripto para
              &quot;asegurar&quot; algo,
            </li>
            <li>phishing o ingeniería social,</li>
            <li>
              instrucciones para evadir controles, hackear, vulnerar cuentas, o
              cometer ilícitos.
            </li>
          </ul>

          <h3>4.5 Spam y autopromoción</h3>
          <ul>
            <li>No spamees ni publiques contenido repetitivo.</li>
            <li>
              No uses el Foro para publicidad masiva o captación agresiva.
            </li>
            <li>
              Si la Plataforma habilita secciones específicas para promociones,
              solo allí se permite (y siguiendo reglas).
            </li>
          </ul>

          <h3>4.6 Enlaces y contenido externo</h3>
          <ul>
            <li>Se prohíben enlaces acortados (bit.ly y similares).</li>
            <li>Se prohíben enlaces maliciosos o sospechosos.</li>
            <li>
              Si compartes un enlace, asegúrate de que sea relevante, seguro y
              provenga de una fuente confiable.
            </li>
            <li>
              Latinterritory no controla ni garantiza sitios de terceros.
            </li>
          </ul>

          {/* Sección 5 */}
          <h2>5) Contenido prohibido (lista práctica)</h2>
          <p>No está permitido publicar:</p>
          <ul>
            <li>amenazas, chantaje o extorsión;</li>
            <li>odio/discriminación;</li>
            <li>pornografía o contenido sexual explícito;</li>
            <li>violencia gráfica;</li>
            <li>instrucciones para actividades ilegales;</li>
            <li>suplantación de identidad;</li>
            <li>malware, phishing o links peligrosos;</li>
            <li>información personal/sensible de terceros;</li>
            <li>
              contenido que infrinja derechos de autor o marcas sin
              autorización.
            </li>
          </ul>

          {/* Sección 6 */}
          <h2>6) Suplantación y autenticidad</h2>
          <ul>
            <li>
              6.1. No te hagas pasar por otra persona, entidad, ONG o negocio.
            </li>
            <li>
              6.2. No declares afiliaciones falsas (&quot;trabajo en X&quot;,
              &quot;soy agente migratorio&quot;, &quot;soy abogado&quot;) si no
              lo eres.
            </li>
            <li>
              6.3. Si compartes consejos profesionales (legal, migratorio, salud,
              impuestos), aclara que es tu experiencia/opinión y recomienda
              acudir a un profesional registrado.
            </li>
          </ul>

          {/* Sección 7 */}
          <h2>7) Moderación, IA y acciones de cumplimiento</h2>
          <ul>
            <li>
              7.1. Podemos moderar contenido con revisión humana y/o automatizada
              (incluida IA) para prevenir abuso, fraude y contenido prohibido.
            </li>
            <li>
              7.2. Podemos, a nuestra discreción y cuando sea necesario:
              <ul>
                <li>ocultar o retirar publicaciones,</li>
                <li>limitar visibilidad,</li>
                <li>bloquear enlaces,</li>
                <li>restringir funciones,</li>
                <li>suspender o cerrar cuentas.</li>
              </ul>
            </li>
            <li>
              7.3. La moderación automatizada puede equivocarse. Puedes solicitar
              revisión si crees que fue un error.
            </li>
          </ul>

          {/* Sección 8 */}
          <h2>8) Reportes y proceso de respuesta</h2>
          <ul>
            <li>
              8.1. Puedes reportar contenido desde la Plataforma mediante el
              botón &quot;Reportar&quot;.
            </li>
            <li>
              8.2. Motivos típicos de reporte incluyen: spam, odio, acoso, datos
              personales, estafa, suplantación, difamación, enlace peligroso.
            </li>
            <li>
              8.3. Podemos solicitar información adicional para investigar.
            </li>
            <li>
              8.4. Si hay riesgo inmediato o contenido claramente ilegal, podemos
              actuar sin aviso previo.
            </li>
          </ul>

          {/* Sección 9 */}
          <h2>9) Sanciones (en escalera)</h2>
          <p>Según la gravedad, aplicaremos:</p>
          <ul>
            <li>advertencia,</li>
            <li>eliminación/ocultamiento de contenido,</li>
            <li>
              restricciones temporales (ej. no publicar por X días),
            </li>
            <li>suspensión o cierre permanente,</li>
            <li>reporte a autoridades si corresponde por ley.</li>
          </ul>

          {/* Sección 10 */}
          <h2>10) Privacidad y datos</h2>
          <ul>
            <li>10.1. No publiques datos personales.</li>
            <li>
              10.2. Si necesitas ejercer derechos de privacidad
              (acceso/corrección/eliminación), contáctanos:{" "}
              <a href="mailto:privacy@latinterritory.com">
                privacy@latinterritory.com
              </a>
              .
            </li>
          </ul>

          {/* Sección 11 */}
          <h2>11) Limitación de responsabilidad</h2>
          <ul>
            <li>
              11.1. En la medida permitida por la ley, Latinterritory no es
              responsable del contenido publicado por usuarios.
            </li>
            <li>
              11.2. Nada en estas Normas limita derechos que no puedan excluirse
              legalmente.
            </li>
          </ul>

          {/* Sección 12 */}
          <h2>12) Cambios a estas Normas</h2>
          <p>
            Podemos actualizar estas Normas por seguridad, legalidad o mejoras
            del servicio. La versión vigente será la publicada.
          </p>
        </article>
      </LtPanel>
    </LtPageShell>
  );
}
