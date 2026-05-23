"use client";

import { useState } from "react";
import { Star, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AccessibleModal } from "@/components/ui/accessible-modal";
import { LtButton } from "@/components/lt/Button";

interface ReviewFormProps {
  businessId: string;
}

const cardClass =
  "rounded-[var(--lt-radius-lg)] border-[2.2px] border-[var(--lt-ink)] p-6";

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
      <div
        className={`${cardClass} text-center`}
        style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker-lg)' }}
      >
        <p
          className="mb-5 text-sm leading-relaxed"
          style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
        >
          Inicia sesión para compartir tu opinión
        </p>
        <Link href="/auth/signin">
          <LtButton variant="sticker" tone="terracota" size="md" rotate={-1}>
            Ingresar
          </LtButton>
        </Link>
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

      if (!res.ok) {
        throw new Error(data.error || "Error al publicar");
      }

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
    <div
      className={cardClass}
      style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker-lg)' }}
    >
      <h3
        className="text-lg font-bold mb-5 flex items-center gap-2"
        style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
      >
        <Star className="w-5 h-5" style={{ color: 'var(--lt-sun)', fill: 'var(--lt-sun)' }} aria-hidden="true" />
        Escribir una reseña
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col gap-2">
          <span
            className="text-sm font-medium"
            style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink)' }}
          >
            Tu calificación:
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none focus:ring-2 focus:ring-[var(--lt-terracota)] rounded transition-transform hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(rating)}
                aria-label={`Calificar con ${star} estrellas`}
              >
                <Star
                  className="w-9 h-9"
                  style={{
                    color: star <= (hover || rating) ? 'var(--lt-sun)' : 'var(--lt-ink-soft)',
                    fill: star <= (hover || rating) ? 'var(--lt-sun)' : 'transparent',
                    opacity: star <= (hover || rating) ? 1 : 0.35,
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="¿Qué te pareció el servicio? Cuéntanos tu experiencia (mínimo 10 caracteres)..."
          rows={4}
          className="w-full rounded-[var(--lt-radius-sm)] border-[2px] border-[var(--lt-ink)] p-3 outline-none resize-y min-h-[100px] focus:ring-2 focus:ring-[var(--lt-terracota)] transition-shadow"
          style={{
            background: 'var(--lt-bg)',
            color: 'var(--lt-ink)',
            fontFamily: 'var(--lt-font-sans)',
          }}
          required
          minLength={10}
        />

        <div
          className="p-4 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)]"
          style={{ background: 'var(--lt-bg)' }}
        >
          <div
            className="flex gap-3 mb-4 text-xs leading-relaxed"
            style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
          >
             <ShieldCheck className="w-5 h-5 shrink-0" style={{ color: 'var(--lt-verde)' }} aria-hidden="true" />
             <p>
               Al publicar, aceptas que tu reseña será pública y mostrará tu ciudad. 
               No incluyas datos personales ni acusaciones sin fundamento.{" "}
               <button
                  type="button"
                  onClick={() => setShowPolicyModal(true)}
                  className="underline decoration-dotted underline-offset-2 hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--lt-terracota)' }}
                >
                  Lee la Review Policy.
                </button>
             </p>
          </div>

          <div className="flex items-start gap-3">
            <input
              id="policy-check"
              name="policy-check"
              type="checkbox"
              checked={acceptedPolicy}
              onChange={(e) => setAcceptedPolicy(e.target.checked)}
              className="h-5 w-5 mt-0.5 rounded border-[var(--lt-ink)] cursor-pointer accent-[var(--lt-terracota)] focus:ring-[var(--lt-terracota)]"
            />
            <label
              htmlFor="policy-check"
              className="text-sm font-medium cursor-pointer select-none"
              style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink)' }}
            >
              He leído y acepto la Política de Reseñas
            </label>
          </div>
        </div>

        <LtButton
          type="submit"
          variant="sticker"
          tone="ink"
          size="md"
          rotate={1}
          disabled={isSubmitting || !acceptedPolicy}
          loading={isSubmitting}
          loadingText="Publicando..."
          className="w-full sm:w-auto"
        >
          Publicar Reseña
        </LtButton>
      </form>

      <AccessibleModal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        title="REVIEW POLICY (POLÍTICA DE RESEÑAS)"
        size="xl"
      >
        <div
          className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 text-sm leading-relaxed"
          style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
        >
          
          <div className="border-b border-[var(--lt-ink)]/20 pb-4 mb-4">
            <h4 className="font-bold text-lg" style={{ color: 'var(--lt-ink)' }}>Latinterritory.com</h4>
            <p className="text-xs mt-1">Última actualización: 03 de febrero de 2026</p>
            <p className="mt-4">
              Esta Política de Reseñas (&quot;Review Policy&quot;) regula la publicación, visibilidad, moderación y gestión de reseñas en latinterritory.com (la &quot;Plataforma&quot;). Se aplica a todos los usuarios que publiquen reseñas sobre negocios, emprendimientos u organizaciones listadas.
            </p>
            <p className="mt-2 text-xs italic">
              Esta Review Policy complementa nuestros Términos de Uso y el Contrato de Usuario Registrado. En caso de conflicto, prevalecerá esta Review Policy para asuntos relacionados con reseñas.
            </p>
          </div>

          <section className="space-y-2">
            <h5 className="font-bold" style={{ color: 'var(--lt-ink)' }}>1) Principios de la sección de reseñas</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>1.1. La Plataforma busca que las reseñas sean útiles, honestas y seguras, para ayudar a la comunidad a tomar decisiones informadas.</li>
              <li>1.2. Promovemos tanto reseñas positivas como negativas, siempre que cumplan las reglas.</li>
              <li>1.3. Las reseñas son contenido generado por usuarios. El autor de una reseña es el único responsable de su contenido.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h5 className="font-bold" style={{ color: 'var(--lt-ink)' }}>2) Elegibilidad para publicar reseñas</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>2.1. Para publicar una reseña debes iniciar sesión con una cuenta válida.</li>
              <li>2.2. En V1, las reseñas no son anónimas dentro de la Plataforma; sin embargo, la Plataforma puede mostrar públicamente un identificador (por ejemplo, &quot;Usuario registrado&quot;) y la ciudad del autor.</li>
              <li>2.3. Podemos limitar la publicación de reseñas por razones de seguridad (por ejemplo, verificación, prevención de spam, intentos repetidos).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h5 className="font-bold" style={{ color: 'var(--lt-ink)' }}>3) Visibilidad pública y uso de información de contexto</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>3.1. Las reseñas publicadas se muestran públicamente y pueden ser visibles para cualquier visitante (incluyendo usuarios no registrados).</li>
              <li>3.2. Al publicar una reseña, aceptas que la Plataforma muestre tu ciudad junto a la reseña como contexto (por ejemplo, Brisbane, Sydney, Melbourne).</li>
              <li>3.3. Tu correo electrónico y contraseña nunca se mostrarán públicamente.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h5 className="font-bold" style={{ color: 'var(--lt-ink)' }}>4) Reglas obligatorias de contenido</h5>
            <p>Tu reseña debe basarse en una experiencia real y cumplir con estas reglas:</p>
            
            <div
              className="p-4 rounded-[var(--lt-radius-sm)] mt-2 border-[1.6px] border-[var(--lt-terracota)]"
              style={{ background: 'var(--lt-bg)' }}
            >
              <h6 className="font-bold mb-2" style={{ color: 'var(--lt-terracota)' }}>4.1 Contenido prohibido (cero tolerancia)</h6>
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

            <div className="mt-2">
                <h6 className="font-bold" style={{ color: 'var(--lt-ink)' }}>4.2 Reglas de calidad y veracidad</h6>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Describe qué pasó, cuándo (aprox.), y cómo te atendieron, sin exagerar hechos.</li>
                    <li>Distingue entre opinión (&quot;me pareció caro&quot;) y hecho (&quot;me cobraron X y la factura dice Y&quot;).</li>
                    <li>No uses la reseña como &quot;arma&quot; para obtener beneficios.</li>
                </ul>
            </div>
          </section>

          <section className="space-y-2">
            <h5 className="font-bold" style={{ color: 'var(--lt-ink)' }}>5) Conflictos de interés e incentivos</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>5.1. Está prohibido publicar si eres dueño/empleado/familiar sin revelarlo, eres competidor directo, o te pagaron por reseñar.</li>
              <li>5.2. Reseñas incentivadas (descuentos, regalos) deben declarar explícitamente el incentivo.</li>
              <li>5.3. La Plataforma puede marcar, limitar o retirar reseñas con incentivos no declarados.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h5 className="font-bold" style={{ color: 'var(--lt-ink)' }}>6) Múltiples reseñas y campañas coordinadas</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>6.1. No permitimos campañas coordinadas de reseñas destinadas a manipular reputación.</li>
              <li>6.2. Podemos limitar reseñas repetidas sobre el mismo negocio desde una misma cuenta o red.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h5 className="font-bold" style={{ color: 'var(--lt-ink)' }}>7) Edición y eliminación por el autor</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>7.1. El autor puede editar o eliminar su reseña.</li>
              <li>7.2. La Plataforma conserva registros técnicos limitados por seguridad.</li>
              <li>7.3. Si hay investigación en curso, podemos restringir temporalmente la edición/eliminación.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h5 className="font-bold" style={{ color: 'var(--lt-ink)' }}>8) Respuesta del negocio (&quot;Owner Reply&quot;) y disputa</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>8.1. El negocio puede responder respetuosamente.</li>
              <li>8.2. Pueden reportar violaciones a esta Review Policy.</li>
              <li>8.3. Podemos solicitar evidencia razonable a cualquiera de las partes.</li>
              <li>8.4. No actuamos como árbitro de disputas comerciales, solo evaluamos el cumplimiento de la Policy.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h5 className="font-bold" style={{ color: 'var(--lt-ink)' }}>9) Moderación y decisiones de la Plataforma</h5>
            <p>La Plataforma puede moderar antes o después mediante revisión humana o IA. Podemos ocultar reseñas, limitar visibilidad o suspender cuentas. Ofrecemos un canal de apelación.</p>
          </section>

          <section className="space-y-2">
            <h5 className="font-bold" style={{ color: 'var(--lt-ink)' }}>10) Criterios típicos para retirar/ocultar</h5>
            <p>Retiraremos reseñas por contenido prohibido, falsedad, conflicto de interés, datos personales, spam o riesgo legal. <strong>No retiramos reseñas únicamente por ser negativas.</strong></p>
          </section>

          <section className="space-y-2">
            <h5 className="font-bold" style={{ color: 'var(--lt-ink)' }}>11) Reportes y contacto</h5>
            <p>Usa el botón &quot;Reportar&quot; o contacta a <a href="mailto:privacy@latinterritory.com" className="underline" style={{ color: 'var(--lt-terracota)' }}>privacy@latinterritory.com</a> para temas de privacidad.</p>
          </section>

          <section className="space-y-2">
             <h5 className="font-bold" style={{ color: 'var(--lt-ink)' }}>12) Limitación de responsabilidad</h5>
             <p>En la medida permitida por ley, Latinterritory no es responsable por el contenido publicado por usuarios.</p>
          </section>

           <div
             className="pt-4 mt-6 border-t border-[var(--lt-ink)]/20 flex justify-end gap-3 sticky bottom-0 p-2"
             style={{ background: 'var(--lt-paper)' }}
           >
             <button
              type="button"
              onClick={() => setShowPolicyModal(false)}
              className="px-4 py-2 hover:opacity-80 transition-opacity"
              style={{ color: 'var(--lt-ink-soft)' }}
            >
              Cerrar
            </button>
             <LtButton
              type="button"
              variant="sticker"
              tone="terracota"
              size="sm"
              onClick={() => {
                setShowPolicyModal(false);
                setAcceptedPolicy(true);
              }}
            >
              Acepto la Política
            </LtButton>
          </div>
        </div>
      </AccessibleModal>
    </div>
  );
}
