"use client";

import { useState } from "react";
import { Star, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AccessibleModal } from "@/components/ui/accessible-modal";
import { Button } from "@/components/lh/Button";

interface ReviewFormProps {
  businessId: string;
}

const policyH5: React.CSSProperties = { fontWeight: 600, color: 'var(--lh-fg)' };
const policyLink: React.CSSProperties = { color: 'var(--lh-accent)', textDecoration: 'underline' };

export default function ReviewForm({ businessId }: ReviewFormProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  if (!session) {
    return (
      <div className="lh-card" style={{ padding: 24, textAlign: 'center' }}>
        <p style={{ marginBottom: 18, fontSize: 14, lineHeight: 1.6, color: 'var(--lh-fg2)' }}>
          Inicia sesión para compartir tu opinión
        </p>
        <Button href="/auth/signin" variant="primary" size="md">Ingresar</Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert("Por favor selecciona una calificación (estrellas)");
    if (!acceptedPolicy) return alert("Debes aceptar la política de reseñas para continuar.");

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, rating, comment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al publicar");

      setComment("");
      setRating(0);
      setAcceptedPolicy(false);
      router.refresh();
      alert("¡Gracias por tu opinión! ⭐");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al publicar";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lh-card" style={{ padding: 24 }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--lh-font)', fontSize: 17, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--lh-fg)', margin: '0 0 18px' }}>
        <Star size={18} style={{ color: 'var(--lh-warm)', fill: 'var(--lh-warm)' }} aria-hidden="true" />
        Escribir una reseña
      </h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--lh-fg)' }}>Tu calificación:</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 0, display: 'flex' }}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(rating)}
                aria-label={`Calificar con ${star} estrellas`}
              >
                <Star
                  size={34}
                  style={{
                    color: star <= (hover || rating) ? 'var(--lh-warm)' : 'var(--lh-fg3)',
                    fill: star <= (hover || rating) ? 'var(--lh-warm)' : 'transparent',
                    opacity: star <= (hover || rating) ? 1 : 0.35,
                    transition: 'color .15s, fill .15s',
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="¿Qué te pareció el servicio? Cuéntanos tu experiencia (mínimo 10 caracteres)…"
          rows={4}
          className="lh-input"
          style={{ resize: 'vertical', minHeight: 100 }}
          required
          minLength={10}
        />

        <div style={{ padding: 16, borderRadius: 14, border: '1px solid var(--lh-border)', background: 'var(--lh-surface2)' }}>
          <div style={{ display: 'flex', gap: 11, marginBottom: 16, fontSize: 12.5, lineHeight: 1.55, color: 'var(--lh-fg2)' }}>
            <ShieldCheck size={18} style={{ flexShrink: 0, color: 'var(--lh-green)' }} aria-hidden="true" />
            <p style={{ margin: 0 }}>
              Al publicar, aceptas que tu reseña será pública y mostrará tu ciudad. No incluyas datos personales ni acusaciones sin fundamento.{" "}
              <button type="button" onClick={() => setShowPolicyModal(true)} style={{ ...policyLink, background: 'transparent', border: 0, cursor: 'pointer', padding: 0, font: 'inherit' }}>
                Lee la Review Policy.
              </button>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
            <input
              id="policy-check"
              name="policy-check"
              type="checkbox"
              checked={acceptedPolicy}
              onChange={(e) => setAcceptedPolicy(e.target.checked)}
              style={{ width: 18, height: 18, marginTop: 1, flexShrink: 0, accentColor: 'var(--lh-accent)', cursor: 'pointer' }}
            />
            <label htmlFor="policy-check" style={{ fontSize: 14, fontWeight: 500, cursor: 'pointer', userSelect: 'none', color: 'var(--lh-fg)' }}>
              He leído y acepto la Política de Reseñas
            </label>
          </div>
        </div>

        <Button type="submit" variant="primary" size="md" disabled={isSubmitting || !acceptedPolicy}>
          {isSubmitting ? 'Publicando…' : 'Publicar reseña'}
        </Button>
      </form>

      <AccessibleModal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        title="Review Policy (Política de Reseñas)"
        size="xl"
      >
        <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8, fontSize: 14, lineHeight: 1.6, color: 'var(--lh-fg2)', display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div style={{ borderBottom: '1px solid var(--lh-border)', paddingBottom: 16 }}>
            <h4 style={{ fontWeight: 600, fontSize: 17, color: 'var(--lh-fg)', margin: 0 }}>Latinterritory.com</h4>
            <p style={{ fontSize: 12, marginTop: 4 }}>Última actualización: 03 de febrero de 2026</p>
            <p style={{ marginTop: 16 }}>
              Esta Política de Reseñas (&quot;Review Policy&quot;) regula la publicación, visibilidad, moderación y gestión de reseñas en latinterritory.com (la &quot;Plataforma&quot;). Se aplica a todos los usuarios que publiquen reseñas sobre negocios, emprendimientos u organizaciones listadas.
            </p>
            <p style={{ marginTop: 8, fontSize: 12.5, fontStyle: 'italic' }}>
              Esta Review Policy complementa nuestros Términos de Uso y el Contrato de Usuario Registrado. En caso de conflicto, prevalecerá esta Review Policy para asuntos relacionados con reseñas.
            </p>
          </div>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h5 style={policyH5}>1) Principios de la sección de reseñas</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>1.1. La Plataforma busca que las reseñas sean útiles, honestas y seguras, para ayudar a la comunidad a tomar decisiones informadas.</li>
              <li>1.2. Promovemos tanto reseñas positivas como negativas, siempre que cumplan las reglas.</li>
              <li>1.3. Las reseñas son contenido generado por usuarios. El autor de una reseña es el único responsable de su contenido.</li>
            </ul>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h5 style={policyH5}>2) Elegibilidad para publicar reseñas</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>2.1. Para publicar una reseña debes iniciar sesión con una cuenta válida.</li>
              <li>2.2. En V1, las reseñas no son anónimas dentro de la Plataforma; sin embargo, la Plataforma puede mostrar públicamente un identificador (por ejemplo, &quot;Usuario registrado&quot;) y la ciudad del autor.</li>
              <li>2.3. Podemos limitar la publicación de reseñas por razones de seguridad (por ejemplo, verificación, prevención de spam, intentos repetidos).</li>
            </ul>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h5 style={policyH5}>3) Visibilidad pública y uso de información de contexto</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>3.1. Las reseñas publicadas se muestran públicamente y pueden ser visibles para cualquier visitante (incluyendo usuarios no registrados).</li>
              <li>3.2. Al publicar una reseña, aceptas que la Plataforma muestre tu ciudad junto a la reseña como contexto (por ejemplo, Brisbane, Sydney, Melbourne).</li>
              <li>3.3. Tu correo electrónico y contraseña nunca se mostrarán públicamente.</li>
            </ul>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h5 style={policyH5}>4) Reglas obligatorias de contenido</h5>
            <p>Tu reseña debe basarse en una experiencia real y cumplir con estas reglas:</p>

            <div style={{ padding: 16, borderRadius: 12, marginTop: 8, border: '1px solid color-mix(in oklch, var(--lh-terra) 35%, transparent)', background: 'color-mix(in oklch, var(--lh-terra) 7%, var(--lh-surface))' }}>
              <h6 style={{ fontWeight: 600, marginBottom: 8, color: 'var(--lh-terra)' }}>4.1 Contenido prohibido (cero tolerancia)</h6>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Difamación:</strong> acusaciones graves presentadas como hechos sin base razonable o afirmaciones destinadas a dañar reputación sin sustento.</li>
                <li><strong>Datos personales/sensibles (&quot;doxxing&quot;):</strong> direcciones privadas, teléfonos, emails, IDs, info médica/financiera.</li>
                <li><strong>Acoso u odio:</strong> insultos, humillación, discriminación o incitación a violencia.</li>
                <li><strong>Amenazas o chantaje.</strong></li>
                <li>Contenido ilegal o que promueva actividades ilícitas.</li>
                <li><strong>Spam:</strong> links repetitivos, publicidad no solicitada, o campañas coordinadas.</li>
                <li>Suplantación o identidad falsa.</li>
                <li>Contenido sexual explícito o violencia gráfica.</li>
                <li>Enlaces acortados o maliciosos.</li>
              </ul>
            </div>

            <div style={{ marginTop: 8 }}>
              <h6 style={{ fontWeight: 600, color: 'var(--lh-fg)' }}>4.2 Reglas de calidad y veracidad</h6>
              <ul className="list-disc pl-5 space-y-1">
                <li>Describe qué pasó, cuándo (aprox.), y cómo te atendieron, sin exagerar hechos.</li>
                <li>Distingue entre opinión (&quot;me pareció caro&quot;) y hecho (&quot;me cobraron X y la factura dice Y&quot;).</li>
                <li>No uses la reseña como &quot;arma&quot; para obtener beneficios.</li>
              </ul>
            </div>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h5 style={policyH5}>5) Conflictos de interés e incentivos</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>5.1. Está prohibido publicar si eres dueño/empleado/familiar sin revelarlo, eres competidor directo, o te pagaron por reseñar.</li>
              <li>5.2. Reseñas incentivadas (descuentos, regalos) deben declarar explícitamente el incentivo.</li>
              <li>5.3. La Plataforma puede marcar, limitar o retirar reseñas con incentivos no declarados.</li>
            </ul>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h5 style={policyH5}>6) Múltiples reseñas y campañas coordinadas</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>6.1. No permitimos campañas coordinadas de reseñas destinadas a manipular reputación.</li>
              <li>6.2. Podemos limitar reseñas repetidas sobre el mismo negocio desde una misma cuenta o red.</li>
            </ul>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h5 style={policyH5}>7) Edición y eliminación por el autor</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>7.1. El autor puede editar o eliminar su reseña.</li>
              <li>7.2. La Plataforma conserva registros técnicos limitados por seguridad.</li>
              <li>7.3. Si hay investigación en curso, podemos restringir temporalmente la edición/eliminación.</li>
            </ul>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h5 style={policyH5}>8) Respuesta del negocio (&quot;Owner Reply&quot;) y disputa</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>8.1. El negocio puede responder respetuosamente.</li>
              <li>8.2. Pueden reportar violaciones a esta Review Policy.</li>
              <li>8.3. Podemos solicitar evidencia razonable a cualquiera de las partes.</li>
              <li>8.4. No actuamos como árbitro de disputas comerciales, solo evaluamos el cumplimiento de la Policy.</li>
            </ul>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h5 style={policyH5}>9) Moderación y decisiones de la Plataforma</h5>
            <p>La Plataforma puede moderar antes o después mediante revisión humana o IA. Podemos ocultar reseñas, limitar visibilidad o suspender cuentas. Ofrecemos un canal de apelación.</p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h5 style={policyH5}>10) Criterios típicos para retirar/ocultar</h5>
            <p>Retiraremos reseñas por contenido prohibido, falsedad, conflicto de interés, datos personales, spam o riesgo legal. <strong>No retiramos reseñas únicamente por ser negativas.</strong></p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h5 style={policyH5}>11) Reportes y contacto</h5>
            <p>Usa el botón &quot;Reportar&quot; o contacta a <a href="mailto:privacy@latinterritory.com" style={policyLink}>privacy@latinterritory.com</a> para temas de privacidad.</p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h5 style={policyH5}>12) Limitación de responsabilidad</h5>
            <p>En la medida permitida por ley, Latinterritory no es responsable por el contenido publicado por usuarios.</p>
          </section>

          <div style={{ position: 'sticky', bottom: 0, paddingTop: 16, marginTop: 8, borderTop: '1px solid var(--lh-border)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: 'var(--lh-surface)' }}>
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowPolicyModal(false)}>Cerrar</Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                setShowPolicyModal(false);
                setAcceptedPolicy(true);
              }}
            >
              Acepto la política
            </Button>
          </div>
        </div>
      </AccessibleModal>
    </div>
  );
}
