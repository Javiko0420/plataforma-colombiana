import { Metadata } from "next";
import SupportForm from "@/components/forms/support-form";
import { LtPageShell } from "@/components/lt";

export const metadata: Metadata = {
  title: "Soporte Legal y Ayuda | Latin Territory",
  description: "Centro de soporte para reportes, reclamos de propiedad y asistencia legal.",
};

export default function SupportPage() {
  return (
    <LtPageShell maxWidth="2xl">
      <div className="text-center space-y-4 mb-8">
        <h1
          className="text-3xl md:text-5xl font-black tracking-tight"
          style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
        >
          Centro de Soporte
        </h1>
        <p
          className="text-lg max-w-2xl mx-auto"
          style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
        >
          Utiliza este canal oficial para reportar contenido, reclamar la propiedad de un negocio o contactar a nuestro equipo.
        </p>
      </div>

      <SupportForm />
    </LtPageShell>
  );
}
