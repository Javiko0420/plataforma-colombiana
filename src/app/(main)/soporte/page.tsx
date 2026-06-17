import { Metadata } from "next";
import SupportForm from "@/components/forms/support-form";

export const metadata: Metadata = {
  title: "Soporte Legal y Ayuda | Latin Territory",
  description: "Centro de soporte para reportes, reclamos de propiedad y asistencia legal.",
};

export default function SupportPage() {
  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)' }}>
      <div className="lh-container" style={{ maxWidth: 760, paddingTop: 40, paddingBottom: 64 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 className="lh-h1" style={{ fontSize: 'clamp(30px,5vw,46px)' }}>Centro de soporte</h1>
          <p style={{ fontSize: 17, color: 'var(--lh-fg2)', maxWidth: 560, margin: '14px auto 0', lineHeight: 1.55 }}>
            Utiliza este canal oficial para reportar contenido, reclamar la propiedad de un negocio o contactar a nuestro equipo.
          </p>
        </div>

        <SupportForm />
      </div>
    </div>
  );
}
