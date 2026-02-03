import { Metadata } from "next";
import SupportForm from "@/components/forms/support-form";

export const metadata: Metadata = {
  title: "Soporte Legal y Ayuda | Latin Territory",
  description: "Centro de soporte para reportes, reclamos de propiedad y asistencia legal.",
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Centro de Soporte
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Utiliza este canal oficial para reportar contenido, reclamar la propiedad de un negocio o contactar a nuestro equipo.
          </p>
        </div>

        <SupportForm />

      </div>
    </div>
  );
}
