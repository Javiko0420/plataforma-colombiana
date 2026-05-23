import { Metadata } from "next";
import SettingsTabs from "@/components/settings/settings-tabs";
import { LtPageShell } from "@/components/lt";

export const metadata: Metadata = {
  title: "Configuración de Cuenta | Latin Territory",
};

export default function SettingsPage() {
  return (
    <LtPageShell maxWidth="5xl">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
        >
          Configuración
        </h1>
        <p style={{ color: 'var(--lt-ink-soft)' }}>
          Administra tu perfil, seguridad y preferencias.
        </p>
      </div>

      <SettingsTabs />
    </LtPageShell>
  );
}
