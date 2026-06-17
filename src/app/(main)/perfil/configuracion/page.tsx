import { Metadata } from "next";
import SettingsTabs from "@/components/settings/settings-tabs";

export const metadata: Metadata = {
  title: "Configuración de Cuenta | Latin Territory",
};

export default function SettingsPage() {
  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)' }}>
      <div className="lh-container" style={{ maxWidth: 1040, paddingTop: 40, paddingBottom: 64 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 className="lh-h1" style={{ fontSize: 'clamp(28px,4vw,38px)' }}>Configuración</h1>
          <p style={{ fontSize: 16, color: 'var(--lh-fg2)', margin: '8px 0 0' }}>
            Administra tu perfil, seguridad y preferencias.
          </p>
        </div>

        <SettingsTabs />
      </div>
    </div>
  );
}
