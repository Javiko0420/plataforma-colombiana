"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Lock, /* CreditCard, */ Save, /* ShieldCheck, */ Eye, EyeOff, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
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

// Password change validation (mirrors backend schema)
const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
      .max(128, "La contraseña no puede exceder 128 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial (@$!%*?&)"
      ),
    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "La nueva contraseña debe ser diferente a la actual",
    path: ["newPassword"],
  });

type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;

/** Evaluate password strength for the visual indicator */
function getPasswordStrength(password: string) {
  const checks = [
    { label: "Mínimo 8 caracteres", passed: password.length >= 8 },
    { label: "Una letra minúscula", passed: /[a-z]/.test(password) },
    { label: "Una letra mayúscula", passed: /[A-Z]/.test(password) },
    { label: "Un número", passed: /\d/.test(password) },
    { label: "Un carácter especial (@$!%*?&)", passed: /[@$!%*?&]/.test(password) },
  ];
  const score = checks.filter((c) => c.passed).length;
  return { checks, score };
}

export default function SettingsTabs() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

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

  const passwordForm = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const watchedNewPassword = passwordForm.watch("newPassword");
  const passwordStrength = getPasswordStrength(watchedNewPassword || "");

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

        // Auth info for security tab
        setHasPassword(user.hasPassword ?? false);
        setIsGoogleUser(user.isGoogleUser ?? false);
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

  const onPasswordSubmit = async (data: PasswordChangeValues) => {
    setPasswordSubmitting(true);
    setPasswordMessage(null);

    try {
      const res = await fetch("/api/users/me/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Error al cambiar la contraseña");
      }

      setPasswordMessage({ type: "success", text: result.message });
      passwordForm.reset();
      // Collapse the form after success
      setTimeout(() => setShowPasswordForm(false), 2500);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error desconocido";
      setPasswordMessage({ type: "error", text: msg });
    } finally {
      setPasswordSubmitting(false);
    }
  };

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
        {/* TODO: Habilitar cuando se lance la monetización de la plataforma
        <button
          onClick={() => setActiveTab("billing")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === "billing" ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
        >
          <CreditCard className="w-5 h-5" /> Suscripciones
        </button>
        */}
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

        {/* PESTAÑA: SEGURIDAD */}
        {activeTab === "security" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Seguridad de la Cuenta</h2>

            {/* --- Contraseña --- */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Contraseña</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Se recomienda cambiarla cada 3 meses.
                  </p>
                </div>

                {/* Google-only users cannot change password here */}
                {isGoogleUser && !hasPassword ? (
                  <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full font-medium">
                    Gestionada por Google
                  </span>
                ) : (
                  <button
                    type="button"
                    className="text-blue-600 font-bold text-sm hover:underline"
                    onClick={() => {
                      setShowPasswordForm((prev) => !prev);
                      setPasswordMessage(null);
                      passwordForm.reset();
                    }}
                  >
                    {showPasswordForm ? "Cancelar" : "Actualizar"}
                  </button>
                )}
              </div>

              {/* Google-only informational message */}
              {isGoogleUser && !hasPassword && (
                <div className="px-4 pb-4">
                  <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Tu cuenta está vinculada a Google. Para cambiar tu contraseña, hazlo directamente desde tu{" "}
                      <a
                        href="https://myaccount.google.com/security"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium"
                      >
                        cuenta de Google
                      </a>.
                    </p>
                  </div>
                </div>
              )}

              {/* Password change form */}
              {showPasswordForm && hasPassword && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-5">
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    {/* Current password */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Contraseña actual
                      </label>
                      <div className="relative">
                        <input
                          {...passwordForm.register("currentPassword")}
                          type={showCurrentPw ? "text" : "password"}
                          autoComplete="current-password"
                          className="w-full p-3 pr-12 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="Ingresa tu contraseña actual"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          aria-label={showCurrentPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {showCurrentPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {passwordForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    {/* New password */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Nueva contraseña
                      </label>
                      <div className="relative">
                        <input
                          {...passwordForm.register("newPassword")}
                          type={showNewPw ? "text" : "password"}
                          autoComplete="new-password"
                          className="w-full p-3 pr-12 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="Mínimo 8 caracteres"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          aria-label={showNewPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {showNewPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}

                      {/* Strength indicator */}
                      {watchedNewPassword && (
                        <div className="mt-3 space-y-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-colors ${
                                  i <= passwordStrength.score
                                    ? passwordStrength.score <= 2
                                      ? "bg-red-500"
                                      : passwordStrength.score <= 3
                                        ? "bg-amber-500"
                                        : "bg-emerald-500"
                                    : "bg-slate-200 dark:bg-slate-700"
                                }`}
                              />
                            ))}
                          </div>
                          <ul className="space-y-1">
                            {passwordStrength.checks.map((check) => (
                              <li key={check.label} className="flex items-center gap-2 text-xs">
                                {check.passed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                )}
                                <span className={check.passed ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}>
                                  {check.label}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Confirm new password */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Confirmar nueva contraseña
                      </label>
                      <div className="relative">
                        <input
                          {...passwordForm.register("confirmPassword")}
                          type={showConfirmPw ? "text" : "password"}
                          autoComplete="new-password"
                          className="w-full p-3 pr-12 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="Repite la nueva contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          aria-label={showConfirmPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {showConfirmPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    {/* Status message */}
                    {passwordMessage && (
                      <div
                        className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                          passwordMessage.type === "success"
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                        }`}
                      >
                        {passwordMessage.type === "success" ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 shrink-0" />
                        )}
                        {passwordMessage.text}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={passwordSubmitting}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
                    >
                      {passwordSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Actualizando...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Cambiar Contraseña
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* --- 2FA --- */}
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Autenticación de 2 Factores</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Agrega una capa extra de seguridad.</p>
                </div>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">Próximamente</span>
            </div>

            {/* --- Verificación de Identidad --- */}
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Verificación de Identidad</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Verifica tu cuenta con ID australiano.</p>
                </div>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">Próximamente</span>
            </div>
          </div>
        )}

        {/* TODO: Habilitar cuando se lance la monetización de la plataforma
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
        */}

      </main>
    </div>
  );
}
