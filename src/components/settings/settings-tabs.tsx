"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Lock, CreditCard, Save, ShieldCheck } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

// VALIDACIÓN FRONTEND (Debe coincidir con backend)
const settingsSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  nickname: z.string().optional(),
  email: z.string().email(), // Solo lectura por ahora si es Google
  phoneNumber: z.string().regex(/^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/, "Formato inválido (Ej: 0412...)").optional().or(z.literal("")),
  dateOfBirth: z.string().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    const ageDiffMs = Date.now() - date.getTime();
    const ageDate = new Date(ageDiffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970) >= 16;
  }, "Debes ser mayor de 16 años").optional().or(z.literal("")),
  image: z.string().optional(),
});

type SettingsValues = z.infer<typeof settingsSchema>;

export default function SettingsTabs() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: "",
      nickname: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",
      image: "",
    },
  });

  // Cargar datos desde la API al iniciar
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/users/me");
        if (!res.ok) throw new Error("Error al cargar datos");
        
        const data = await res.json();
        const user = data.data;
        
        // Formatear fecha para el input type="date" (YYYY-MM-DD)
        const dob = user.dateOfBirth 
          ? new Date(user.dateOfBirth).toISOString().split('T')[0] 
          : "";
        
        form.reset({
          name: user.name || "",
          nickname: user.nickname || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
          dateOfBirth: dob,
          image: user.image || "",
        });
      } catch (error) {
        console.error("Error cargando datos del usuario:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchUserData();
    }
  }, [session, form]);

  const onSubmit = async (data: SettingsValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al actualizar");
      }

      // Actualizar sesión cliente
      await update({
        ...session,
        user: {
            ...session?.user,
            name: data.name,
            image: data.image,
            // @ts-ignore
            nickname: data.nickname,
            phoneNumber: data.phoneNumber,
            dateOfBirth: data.dateOfBirth
        }
      });

      alert("Perfil actualizado correctamente ✅");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      
      {/* SIDEBAR DE NAVEGACIÓN */}
      <aside className="w-full md:w-64 space-y-2">
        <button
          onClick={() => setActiveTab("general")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === "general" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
        >
          <User className="w-5 h-5" /> General
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === "security" ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
        >
          <Lock className="w-5 h-5" /> Seguridad
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === "billing" ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
        >
          <CreditCard className="w-5 h-5" /> Suscripciones
        </button>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-1">
        
        {/* PESTAÑA: GENERAL */}
        {activeTab === "general" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Información Personal</h2>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Foto de Perfil */}
              <div className="flex items-center gap-6">
                 <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                    {form.watch("image") ? (
                        <Image src={form.watch("image")!} alt="Avatar" fill className="object-cover" />
                    ) : (
                        <div className="bg-slate-100 dark:bg-slate-800 w-full h-full flex items-center justify-center"><User /></div>
                    )}
                 </div>
                 <CldUploadWidget
                    onSuccess={(result) => {
                      if (result.info && typeof result.info === 'object' && 'secure_url' in result.info) {
                        form.setValue("image", result.info.secure_url as string);
                      }
                    }}
                    uploadPreset="latinterritory_uploads"
                  >
                    {({ open }) => (
                      <button type="button" onClick={() => open()} className="text-sm text-blue-600 font-bold hover:underline">
                        Cambiar foto
                      </button>
                    )}
                  </CldUploadWidget>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre Completo</label>
                  <input {...form.register("name")} className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700" />
                  {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Apodo (Nickname)</label>
                  <input {...form.register("nickname")} className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input {...form.register("email")} disabled className="w-full p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed" title="Para cambiar el email, ve a Seguridad" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono (Australia)</label>
                  <input {...form.register("phoneNumber")} placeholder="0412 345 678" className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700" />
                  {form.formState.errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{form.formState.errors.phoneNumber.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha de Nacimiento</label>
                  <input type="date" {...form.register("dateOfBirth")} className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700" />
                  <p className="text-xs text-slate-500 mt-1">Debes ser mayor de 16 años.</p>
                  {form.formState.errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{form.formState.errors.dateOfBirth.message}</p>}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
                    {isSubmitting ? "Guardando..." : <><Save className="w-5 h-5" /> Guardar Cambios</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PESTAÑA: SEGURIDAD (Placeholders para futuro) */}
        {activeTab === "security" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Seguridad de la Cuenta</h2>
            
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl flex justify-between items-center">
                <div>
                    <h3 className="font-bold">Contraseña</h3>
                    <p className="text-sm text-slate-500">Se recomienda cambiarla cada 3 meses.</p>
                </div>
                <button className="text-blue-600 font-bold text-sm hover:underline" onClick={() => alert("Si usas Google Login, debes cambiarla en Google. Si usas correo, funcionalidad en desarrollo.")}>Actualizar</button>
            </div>

            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl flex justify-between items-center">
                <div>
                    <h3 className="font-bold">Autenticación de 2 Factores</h3>
                    <p className="text-sm text-slate-500">Agrega una capa extra de seguridad.</p>
                </div>
                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">Próximamente</span>
            </div>
            
             <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl flex justify-between items-center">
                <div>
                    <h3 className="font-bold">Verificación de Identidad</h3>
                    <p className="text-sm text-slate-500">Verifica tu cuenta con ID australiano.</p>
                </div>
                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">Próximamente</span>
            </div>
          </div>
        )}

        {/* PESTAÑA: SUSCRIPCIONES */}
        {activeTab === "billing" && (
           <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center py-16">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Planes y Verificación</h2>
              <p className="text-slate-500 max-w-md mx-auto">
                  Próximamente podrás suscribirte a planes premium para destacar tus negocios y verificar tu cuenta con insignia azul.
              </p>
           </div>
        )}

      </main>
    </div>
  );
}
