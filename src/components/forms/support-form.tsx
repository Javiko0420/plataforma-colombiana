"use client";

import { useForm, ValidationError } from "@formspree/react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { LtButton, LtPanel } from "@/components/lt";

export default function SupportForm() {
  const [state, handleSubmit] = useForm("mlglzegz");

  if (state.succeeded) {
    return (
      <LtPanel tone="bg" shadow="md" className="p-8 text-center animate-in fade-in zoom-in duration-500">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-[2px] border-[var(--lt-ink)]"
          style={{ background: 'var(--lt-paper)', color: 'var(--lt-verde)' }}
        >
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
        >
          ¡Solicitud Recibida!
        </h3>
        <p style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}>
          Nuestro equipo legal y de soporte revisará tu caso.<br />
          Te responderemos al correo proporcionado en un plazo de 24 a 48 horas hábiles.
        </p>
      </LtPanel>
    );
  }

  return (
    <LtPanel className="p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="lt-label">Nombre Completo</label>
            <input
              id="name"
              type="text"
              name="name"
              required
              className="lt-input"
              placeholder="Juan Pérez"
            />
            <ValidationError prefix="Name" field="name" errors={state.errors} />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="lt-label">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              name="email"
              required
              className="lt-input"
              placeholder="juan@ejemplo.com"
            />
            <ValidationError prefix="Email" field="email" errors={state.errors} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="phone" className="lt-label">Teléfono (Opcional)</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              className="lt-input"
              placeholder="+61 412 000 000"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="reason" className="lt-label">Tipo de Solicitud</label>
            <div className="relative">
              <select
                id="reason"
                name="reason"
                required
                defaultValue=""
                className="lt-input appearance-none"
              >
                <option value="" disabled>Selecciona una opción...</option>
                <option value="Reclamar Negocio">Reclamar propiedad de un negocio</option>
                <option value="Reportar Contenido">Reportar contenido inapropiado/ilegal</option>
                <option value="Apelación">Apelar una sanción o bloqueo</option>
                <option value="Problema Técnico">Problema Técnico</option>
                <option value="Otro">Otro</option>
              </select>
              <div
                className="absolute right-3 top-3.5 pointer-events-none"
                style={{ color: 'var(--lt-ink-soft)' }}
              >
                ▼
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="lt-label">Detalle de la solicitud</label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            className="lt-input"
            placeholder="Por favor describe la situación con el mayor detalle posible. Si es un reporte, incluye enlaces."
          />
          <ValidationError prefix="Message" field="message" errors={state.errors} />
        </div>

        <LtPanel tone="bg" shadow="sm" className="p-4 flex gap-3 items-start text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--lt-terracota)' }} />
          <p style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}>
            Al enviar este formulario, aceptas que nuestro equipo legal procese tus datos para resolver esta incidencia de acuerdo con nuestra Política de Privacidad.
          </p>
        </LtPanel>

        <LtButton
          type="submit"
          variant="sticker"
          tone="ink"
          size="lg"
          rotate={-1}
          disabled={state.submitting}
          loading={state.submitting}
          loadingText="Enviando..."
          iconLeft={!state.submitting ? <Send className="w-4 h-4" /> : undefined}
          className="w-full"
        >
          Enviar Solicitud
        </LtButton>
      </form>
    </LtPanel>
  );
}
