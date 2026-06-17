"use client";

import { useForm, ValidationError } from "@formspree/react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/lh/Button";

export default function SupportForm() {
  const [state, handleSubmit] = useForm("mlglzegz");

  if (state.succeeded) {
    return (
      <div className="lh-card" style={{ padding: 'clamp(24px,5vw,32px)', textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', background: 'color-mix(in oklch, var(--lh-green) 14%, transparent)', color: 'var(--lh-green)' }}>
          <CheckCircle2 size={30} />
        </div>
        <h3 className="lh-h2" style={{ fontSize: 24, margin: '0 0 8px' }}>¡Solicitud recibida!</h3>
        <p style={{ color: 'var(--lh-fg2)', lineHeight: 1.6 }}>
          Nuestro equipo legal y de soporte revisará tu caso.<br />
          Te responderemos al correo proporcionado en un plazo de 24 a 48 horas hábiles.
        </p>
      </div>
    );
  }

  return (
    <div className="lh-card" style={{ padding: 'clamp(22px,4vw,32px)' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="name" className="lh-label">Nombre completo</label>
            <input id="name" type="text" name="name" required className="lh-input" placeholder="Juan Pérez" />
            <ValidationError prefix="Name" field="name" errors={state.errors} />
          </div>

          <div>
            <label htmlFor="email" className="lh-label">Correo electrónico</label>
            <input id="email" type="email" name="email" required className="lh-input" placeholder="juan@ejemplo.com" />
            <ValidationError prefix="Email" field="email" errors={state.errors} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="phone" className="lh-label">Teléfono (opcional)</label>
            <input id="phone" type="tel" name="phone" className="lh-input" placeholder="+61 412 000 000" />
          </div>

          <div>
            <label htmlFor="reason" className="lh-label">Tipo de solicitud</label>
            <select id="reason" name="reason" required defaultValue="" className="lh-input">
              <option value="" disabled>Selecciona una opción…</option>
              <option value="Reclamar Negocio">Reclamar propiedad de un negocio</option>
              <option value="Reportar Contenido">Reportar contenido inapropiado/ilegal</option>
              <option value="Apelación">Apelar una sanción o bloqueo</option>
              <option value="Problema Técnico">Problema técnico</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="message" className="lh-label">Detalle de la solicitud</label>
          <textarea id="message" name="message" required rows={5} className="lh-input" style={{ resize: 'none' }} placeholder="Por favor describe la situación con el mayor detalle posible. Si es un reporte, incluye enlaces." />
          <ValidationError prefix="Message" field="message" errors={state.errors} />
        </div>

        <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 13, background: 'var(--lh-surface2)', border: '1px solid var(--lh-border2)' }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1, color: 'var(--lh-accent)' }} />
          <p style={{ fontSize: 13.5, color: 'var(--lh-fg2)', margin: 0, lineHeight: 1.55 }}>
            Al enviar este formulario, aceptas que nuestro equipo legal procese tus datos para resolver esta incidencia de acuerdo con nuestra Política de Privacidad.
          </p>
        </div>

        <Button type="submit" variant="primary" size="md" disabled={state.submitting} style={{ width: '100%' }}>
          {!state.submitting && <Send size={16} />}
          {state.submitting ? 'Enviando…' : 'Enviar solicitud'}
        </Button>
      </form>
    </div>
  );
}
