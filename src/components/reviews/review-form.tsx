"use client";

import { useState } from "react";
import { Star, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AccessibleModal } from "@/components/ui/accessible-modal";

interface ReviewFormProps {
  businessId: string;
}

export default function ReviewForm({ businessId }: ReviewFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para la política
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  if (!session) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
        <p className="text-slate-600 dark:text-slate-400 mb-4">Inicia sesión para compartir tu opinión</p>
        <Link 
          href="/auth/signin" 
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Ingresar
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
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
        <Star className="w-5 h-5 fill-slate-900 dark:fill-white" />
        Escribir una reseña
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selector de Estrellas */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tu calificación:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(rating)}
                aria-label={`Calificar con ${star} estrellas`}
              >
                <Star
                  className={`w-9 h-9 ${
                    star <= (hover || rating)
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Texto */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="¿Qué te pareció el servicio? Cuéntanos tu experiencia (mínimo 10 caracteres)..."
          rows={4}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-y min-h-[100px]"
          required
          minLength={10}
        />

        {/* Sección de Legal y Checkbox */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-100 dark:border-slate-800">
          
          {/* Texto Corto Recomendado */}
          <div className="flex gap-3 mb-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
             <ShieldCheck className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400" />
             <p>
               Al publicar, aceptas que tu reseña será pública y mostrará tu ciudad. 
               No incluyas datos personales ni acusaciones sin fundamento. 
               <button
                  type="button"
                  onClick={() => setShowPolicyModal(true)}
                  className="ml-1 text-blue-600 hover:text-blue-500 underline decoration-dotted underline-offset-2"
                >
                  Lee la Review Policy.
                </button>
             </p>
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-3">
            <input
              id="policy-check"
              name="policy-check"
              type="checkbox"
              checked={acceptedPolicy}
              onChange={(e) => setAcceptedPolicy(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
            />
            <label htmlFor="policy-check" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              He leído y acepto la Política de Reseñas
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !acceptedPolicy}
          className="w-full sm:w-auto bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? "Publicando..." : "Publicar Reseña"}
        </button>
      </form>

      {/* Modal con Texto Legal Completo */}
      <AccessibleModal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        title="REVIEW POLICY (POLÍTICA DE RESEÑAS)"
        size="xl"
      >
        <div className="space-y-6 text-slate-700 dark:text-slate-300 max-h-[70vh] overflow-y-auto pr-4 text-sm leading-relaxed">
          
          <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Latinterritory.com</h4>
            <p className="text-slate-500 text-xs mt-1">Última actualización: 03 de febrero de 2026</p>
            <p className="mt-4">
              Esta Política de Reseñas (&quot;Review Policy&quot;) regula la publicación, visibilidad, moderación y gestión de reseñas en latinterritory.com (la &quot;Plataforma&quot;). Se aplica a todos los usuarios que publiquen reseñas sobre negocios, emprendimientos u organizaciones listadas.
            </p>
            <p className="mt-2 text-xs italic">
              Esta Review Policy complementa nuestros Términos de Uso y el Contrato de Usuario Registrado. En caso de conflicto, prevalecerá esta Review Policy para asuntos relacionados con reseñas.
            </p>
          </div>

          <section className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white">1) Principios de la sección de reseñas</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>1.1. La Plataforma busca que las reseñas sean útiles, honestas y seguras, para ayudar a la comunidad a tomar decisiones informadas.</li>
              <li>1.2. Promovemos tanto reseñas positivas como negativas, siempre que cumplan las reglas.</li>
              <li>1.3. Las reseñas son contenido generado por usuarios. El autor de una reseña es el único responsable de su contenido.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white">2) Elegibilidad para publicar reseñas</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>2.1. Para publicar una reseña debes iniciar sesión con una cuenta válida.</li>
              <li>2.2. En V1, las reseñas no son anónimas dentro de la Plataforma; sin embargo, la Plataforma puede mostrar públicamente un identificador (por ejemplo, &quot;Usuario registrado&quot;) y la ciudad del autor.</li>
              <li>2.3. Podemos limitar la publicación de reseñas por razones de seguridad (por ejemplo, verificación, prevención de spam, intentos repetidos).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white">3) Visibilidad pública y uso de información de contexto</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>3.1. Las reseñas publicadas se muestran públicamente y pueden ser visibles para cualquier visitante (incluyendo usuarios no registrados).</li>
              <li>3.2. Al publicar una reseña, aceptas que la Plataforma muestre tu ciudad junto a la reseña como contexto (por ejemplo, Brisbane, Sydney, Melbourne).</li>
              <li>3.3. Tu correo electrónico y contraseña nunca se mostrarán públicamente.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white">4) Reglas obligatorias de contenido</h5>
            <p>Tu reseña debe basarse en una experiencia real y cumplir con estas reglas:</p>
            
            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded mt-2 border border-red-100 dark:border-red-900/30">
              <h6 className="font-bold text-red-800 dark:text-red-400 mb-2">4.1 Contenido prohibido (cero tolerancia)</h6>
              <ul className="list-disc pl-5 space-y-1 text-red-900 dark:text-red-300/80">
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
                <h6 className="font-bold text-slate-900 dark:text-white">4.2 Reglas de calidad y veracidad</h6>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Describe qué pasó, cuándo (aprox.), y cómo te atendieron, sin exagerar hechos.</li>
                    <li>Distingue entre opinión (&quot;me pareció caro&quot;) y hecho (&quot;me cobraron X y la factura dice Y&quot;).</li>
                    <li>No uses la reseña como &quot;arma&quot; para obtener beneficios.</li>
                </ul>
            </div>
          </section>

          <section className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white">5) Conflictos de interés e incentivos</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>5.1. Está prohibido publicar si eres dueño/empleado/familiar sin revelarlo, eres competidor directo, o te pagaron por reseñar.</li>
              <li>5.2. Reseñas incentivadas (descuentos, regalos) deben declarar explícitamente el incentivo.</li>
              <li>5.3. La Plataforma puede marcar, limitar o retirar reseñas con incentivos no declarados.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white">6) Múltiples reseñas y campañas coordinadas</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>6.1. No permitimos campañas coordinadas de reseñas destinadas a manipular reputación.</li>
              <li>6.2. Podemos limitar reseñas repetidas sobre el mismo negocio desde una misma cuenta o red.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white">7) Edición y eliminación por el autor</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>7.1. El autor puede editar o eliminar su reseña.</li>
              <li>7.2. La Plataforma conserva registros técnicos limitados por seguridad.</li>
              <li>7.3. Si hay investigación en curso, podemos restringir temporalmente la edición/eliminación.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white">8) Respuesta del negocio (&quot;Owner Reply&quot;) y disputa</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>8.1. El negocio puede responder respetuosamente.</li>
              <li>8.2. Pueden reportar violaciones a esta Review Policy.</li>
              <li>8.3. Podemos solicitar evidencia razonable a cualquiera de las partes.</li>
              <li>8.4. No actuamos como árbitro de disputas comerciales, solo evaluamos el cumplimiento de la Policy.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white">9) Moderación y decisiones de la Plataforma</h5>
            <p>La Plataforma puede moderar antes o después mediante revisión humana o IA. Podemos ocultar reseñas, limitar visibilidad o suspender cuentas. Ofrecemos un canal de apelación.</p>
          </section>

          <section className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white">10) Criterios típicos para retirar/ocultar</h5>
            <p>Retiraremos reseñas por contenido prohibido, falsedad, conflicto de interés, datos personales, spam o riesgo legal. <strong>No retiramos reseñas únicamente por ser negativas.</strong></p>
          </section>

          <section className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white">11) Reportes y contacto</h5>
            <p>Usa el botón &quot;Reportar&quot; o contacta a <a href="mailto:privacy@latinterritory.com" className="text-blue-600 hover:underline">privacy@latinterritory.com</a> para temas de privacidad.</p>
          </section>

          <section className="space-y-2">
             <h5 className="font-bold text-slate-900 dark:text-white">12) Limitación de responsabilidad</h5>
             <p>En la medida permitida por ley, Latinterritory no es responsable por el contenido publicado por usuarios.</p>
          </section>

           <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-800 p-2">
             <button
              onClick={() => setShowPolicyModal(false)}
              className="text-slate-600 dark:text-slate-400 px-4 py-2 hover:underline"
            >
              Cerrar
            </button>
             <button
              onClick={() => {
                setShowPolicyModal(false);
                setAcceptedPolicy(true);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Acepto la Política
            </button>
          </div>
        </div>
      </AccessibleModal>
    </div>
  );
}
