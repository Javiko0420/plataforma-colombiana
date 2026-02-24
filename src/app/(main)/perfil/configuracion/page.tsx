import { Metadata } from "next";
import SettingsTabs from "@/components/settings/settings-tabs";

export const metadata: Metadata = {
  title: "Configuración de Cuenta | Latin Territory",
};

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Configuración</h1>
          <p className="text-slate-500 dark:text-slate-400">Administra tu perfil, seguridad y preferencias.</p>
        </div>

        {/* Componente Cliente que maneja las pestañas y formularios */}
        <SettingsTabs />
        
      </div>
    </div>
  );
}
