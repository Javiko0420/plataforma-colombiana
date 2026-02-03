"use client";

import { useForm, ValidationError } from "@formspree/react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function SupportForm() {

  const [state, handleSubmit] = useForm("mlglzegz");

  if (state.succeeded) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">¡Solicitud Recibida!</h3>
        <p className="text-green-700 dark:text-green-400">
          Nuestro equipo legal y de soporte revisará tu caso.<br/>
          Te responderemos al correo proporcionado en un plazo de 24 a 48 horas hábiles.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre Completo</label>
          <input
            id="name"
            type="text" 
            name="name" 
            required
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Juan Pérez"
          />
          <ValidationError prefix="Name" field="name" errors={state.errors} />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Correo Electrónico</label>
          <input
            id="email"
            type="email" 
            name="email" 
            required
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="juan@ejemplo.com"
          />
          <ValidationError prefix="Email" field="email" errors={state.errors} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
           <label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono (Opcional)</label>
           <input
            id="phone"
            type="tel" 
            name="phone"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+61 412 000 000"
           />
        </div>

        <div className="space-y-2">
           <label htmlFor="reason" className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Solicitud</label>
           <div className="relative">
             <select
              id="reason"
              name="reason"
              required
              defaultValue=""
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
             >
               <option value="" disabled>Selecciona una opción...</option>
               <option value="Reclamar Negocio">Reclamar propiedad de un negocio</option>
               <option value="Reportar Contenido">Reportar contenido inapropiado/ilegal</option>
               <option value="Apelación">Apelar una sanción o bloqueo</option>
               <option value="Problema Técnico">Problema Técnico</option>
               <option value="Otro">Otro</option>
             </select>
             <div className="absolute right-3 top-3.5 pointer-events-none text-slate-500">▼</div>
           </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-300">Detalle de la solicitud</label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Por favor describe la situación con el mayor detalle posible. Si es un reporte, incluye enlaces."
        />
        <ValidationError prefix="Message" field="message" errors={state.errors} />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex gap-3 items-start text-sm text-blue-800 dark:text-blue-300">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>
          Al enviar este formulario, aceptas que nuestro equipo legal procese tus datos para resolver esta incidencia de acuerdo con nuestra Política de Privacidad.
        </p>
      </div>

      <button
        type="submit"
        disabled={state.submitting}
        className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg"
      >
        {state.submitting ? "Enviando..." : (
          <>
            <Send className="w-4 h-4" /> Enviar Solicitud
          </>
        )}
      </button>
    </form>
  );
}
