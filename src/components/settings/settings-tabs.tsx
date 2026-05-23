"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Lock, /* CreditCard, */ Save, /* ShieldCheck, */ Eye, EyeOff, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { LtPanel, LtButton } from "@/components/lt";

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
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-[var(--lt-radius-sm)] border-2 border-[var(--lt-ink)] transition-all font-medium ${
            activeTab === "general"
              ? "shadow-[var(--lt-shadow-sticker)]"
              : "hover:-translate-y-0.5"
          }`}
          style={{
            background: activeTab === "general" ? 'var(--lt-terracota)' : 'var(--lt-paper)',
            color: activeTab === "general" ? 'var(--lt-paper)' : 'var(--lt-ink-soft)',
          }}
        >
          <User className="w-5 h-5" /> General
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-[var(--lt-radius-sm)] border-2 border-[var(--lt-ink)] transition-all font-medium ${
            activeTab === "security"
              ? "shadow-[var(--lt-shadow-sticker)]"
              : "hover:-translate-y-0.5"
          }`}
          style={{
            background: activeTab === "security" ? 'var(--lt-terracota)' : 'var(--lt-paper)',
            color: activeTab === "security" ? 'var(--lt-paper)' : 'var(--lt-ink-soft)',
          }}
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
          <LtPanel className="p-8">
            <h2
              className="text-xl font-bold mb-6"
              style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
            >
              Información Personal
            </h2>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Foto de Perfil */}
              <div className="flex items-center gap-6">
                 <div
                   className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--lt-ink)]"
                   style={{ background: 'var(--lt-bg)' }}
                 >
                    {form.watch("image") ? (
                        <Image src={form.watch("image")!} alt="Avatar" fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User style={{ color: 'var(--lt-ink-soft)' }} />
                        </div>
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
                      <button
                        type="button"
                        onClick={() => open()}
                        className="text-sm font-bold hover:underline"
                        style={{ color: 'var(--lt-terracota)' }}
                      >
                        Cambiar foto
                      </button>
                    )}
                  </CldUploadWidget>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="lt-label">Nombre Completo</label>
                  <input {...form.register("name")} className="lt-input" />
                  {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
                </div>
                <div>
                  <label className="lt-label">Apodo (Nickname)</label>
                  <input {...form.register("nickname")} className="lt-input" />
                </div>
                
                <div>
                  <label className="lt-label">Email</label>
                  <input
                    {...form.register("email")}
                    disabled
                    className="lt-input opacity-60 cursor-not-allowed"
                    title="Para cambiar el email, ve a Seguridad"
                  />
                </div>

                <div>
                  <label className="lt-label">Teléfono (Australia)</label>
                  <input {...form.register("phoneNumber")} placeholder="0412 345 678" className="lt-input" />
                  {form.formState.errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{form.formState.errors.phoneNumber.message}</p>}
                </div>

                <div>
                  <label className="lt-label">Fecha de Nacimiento</label>
                  <input type="date" {...form.register("dateOfBirth")} className="lt-input" />
                  <p className="text-xs mt-1" style={{ color: 'var(--lt-ink-soft)' }}>Debes ser mayor de 16 años.</p>
                  {form.formState.errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{form.formState.errors.dateOfBirth.message}</p>}
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--lt-ink)] opacity-20">
                <LtButton
                  type="submit"
                  variant="sticker"
                  tone="terracota"
                  size="md"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  loadingText="Guardando..."
                  iconLeft={!isSubmitting ? <Save className="w-5 h-5" /> : undefined}
                >
                  Guardar Cambios
                </LtButton>
              </div>
            </form>
          </LtPanel>
        )}

        {/* PESTAÑA: SEGURIDAD */}
        {activeTab === "security" && (
          <LtPanel className="p-8 space-y-6">
            <h2
              className="text-xl font-bold mb-4"
              style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
            >
              Seguridad de la Cuenta
            </h2>

            <div className="border-2 border-[var(--lt-ink)] rounded-[var(--lt-radius-sm)] overflow-hidden">
              <div className="p-4 flex justify-between items-center" style={{ background: 'var(--lt-bg)' }}>
                <div>
                  <h3 className="font-bold" style={{ color: 'var(--lt-ink)' }}>Contraseña</h3>
                  <p className="text-sm" style={{ color: 'var(--lt-ink-soft)' }}>
                    Se recomienda cambiarla cada 3 meses.
                  </p>
                </div>

                {isGoogleUser && !hasPassword ? (
                  <span
                    className="text-xs px-3 py-1.5 rounded-full font-medium border-2 border-[var(--lt-ink)]"
                    style={{ background: 'var(--lt-paper)', color: 'var(--lt-ink-soft)' }}
                  >
                    Gestionada por Google
                  </span>
                ) : (
                  <button
                    type="button"
                    className="font-bold text-sm hover:underline"
                    style={{ color: 'var(--lt-terracota)' }}
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

              {isGoogleUser && !hasPassword && (
                <div className="px-4 pb-4">
                  <div
                    className="flex items-start gap-3 rounded-[var(--lt-radius-sm)] border-2 border-amber-500 p-3"
                    style={{ background: 'var(--lt-bg)' }}
                  >
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm" style={{ color: 'var(--lt-ink-soft)' }}>
                      Tu cuenta está vinculada a Google. Para cambiar tu contraseña, hazlo directamente desde tu{" "}
                      <a
                        href="https://myaccount.google.com/security"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium"
                        style={{ color: 'var(--lt-terracota)' }}
                      >
                        cuenta de Google
                      </a>.
                    </p>
                  </div>
                </div>
              )}

              {showPasswordForm && hasPassword && (
                <div className="border-t-2 border-[var(--lt-ink)] p-4 space-y-5" style={{ background: 'var(--lt-paper)' }}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <div>
                      <label className="lt-label">Contraseña actual</label>
                      <div className="relative">
                        <input
                          {...passwordForm.register("currentPassword")}
                          type={showCurrentPw ? "text" : "password"}
                          autoComplete="current-password"
                          className="lt-input pr-12"
                          placeholder="Ingresa tu contraseña actual"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: 'var(--lt-ink-soft)' }}
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

                    <div>
                      <label className="lt-label">Nueva contraseña</label>
                      <div className="relative">
                        <input
                          {...passwordForm.register("newPassword")}
                          type={showNewPw ? "text" : "password"}
                          autoComplete="new-password"
                          className="lt-input pr-12"
                          placeholder="Mínimo 8 caracteres"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: 'var(--lt-ink-soft)' }}
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
                                    : "bg-[var(--lt-ink)] opacity-20"
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
                                  <XCircle className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--lt-ink-soft)' }} />
                                )}
                                <span style={{ color: check.passed ? 'var(--lt-verde)' : 'var(--lt-ink-soft)' }}>
                                  {check.label}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="lt-label">Confirmar nueva contraseña</label>
                      <div className="relative">
                        <input
                          {...passwordForm.register("confirmPassword")}
                          type={showConfirmPw ? "text" : "password"}
                          autoComplete="new-password"
                          className="lt-input pr-12"
                          placeholder="Repite la nueva contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: 'var(--lt-ink-soft)' }}
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

                    {passwordMessage && (
                      <div
                        className={`flex items-center gap-2 p-3 rounded-[var(--lt-radius-sm)] text-sm border-2 ${
                          passwordMessage.type === "success"
                            ? "border-emerald-500"
                            : "border-red-500"
                        }`}
                        style={{ background: 'var(--lt-bg)', color: 'var(--lt-ink)' }}
                      >
                        {passwordMessage.type === "success" ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 shrink-0 text-red-500" />
                        )}
                        {passwordMessage.text}
                      </div>
                    )}

                    <LtButton
                      type="submit"
                      variant="sticker"
                      tone="terracota"
                      size="sm"
                      disabled={passwordSubmitting}
                      loading={passwordSubmitting}
                      loadingText="Actualizando..."
                      iconLeft={!passwordSubmitting ? <Lock className="w-4 h-4" /> : undefined}
                    >
                      Cambiar Contraseña
                    </LtButton>
                  </form>
                </div>
              )}
            </div>

            <div
              className="p-4 border-2 border-[var(--lt-ink)] rounded-[var(--lt-radius-sm)] flex justify-between items-center"
              style={{ background: 'var(--lt-bg)' }}
            >
                <div>
                    <h3 className="font-bold" style={{ color: 'var(--lt-ink)' }}>Autenticación de 2 Factores</h3>
                    <p className="text-sm" style={{ color: 'var(--lt-ink-soft)' }}>Agrega una capa extra de seguridad.</p>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold border-2 border-[var(--lt-ink)]"
                  style={{ background: 'var(--lt-paper)', color: 'var(--lt-ink-soft)' }}
                >
                  Próximamente
                </span>
            </div>

            <div
              className="p-4 border-2 border-[var(--lt-ink)] rounded-[var(--lt-radius-sm)] flex justify-between items-center"
              style={{ background: 'var(--lt-bg)' }}
            >
                <div>
                    <h3 className="font-bold" style={{ color: 'var(--lt-ink)' }}>Verificación de Identidad</h3>
                    <p className="text-sm" style={{ color: 'var(--lt-ink-soft)' }}>Verifica tu cuenta con ID australiano.</p>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold border-2 border-[var(--lt-ink)]"
                  style={{ background: 'var(--lt-paper)', color: 'var(--lt-ink-soft)' }}
                >
                  Próximamente
                </span>
            </div>
          </LtPanel>
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
