"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Lock, Save, Eye, EyeOff, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { Button } from "@/components/lh/Button";

// VALIDACIÓN FRONTEND (Debe coincidir con backend)
const settingsSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  nickname: z.string().optional(),
  email: z.string().email(),
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

const errText: React.CSSProperties = { color: 'var(--lh-terra)', fontSize: 12.5, marginTop: 6 };
const fieldHint: React.CSSProperties = { fontSize: 12.5, marginTop: 6, color: 'var(--lh-fg3)' };
const comingSoon: React.CSSProperties = { padding: '5px 11px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: 'var(--lh-surface2)', border: '1px solid var(--lh-border2)', color: 'var(--lh-fg3)' };

export default function SettingsTabs() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    defaultValues: { name: "", nickname: "", email: "", phoneNumber: "", dateOfBirth: "", image: "" },
  });

  const passwordForm = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const watchedNewPassword = passwordForm.watch("newPassword");
  const passwordStrength = getPasswordStrength(watchedNewPassword || "");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/users/me");
        if (!res.ok) throw new Error("Error al cargar datos");

        const data = await res.json();
        const user = data.data;

        const dob = user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "";

        form.reset({
          name: user.name || "",
          nickname: user.nickname || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
          dateOfBirth: dob,
          image: user.image || "",
        });

        setHasPassword(user.hasPassword ?? false);
        setIsGoogleUser(user.isGoogleUser ?? false);
      } catch (error) {
        console.error("Error cargando datos del usuario:", error);
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
      if (!res.ok) throw new Error(result.error || "Error al cambiar la contraseña");

      setPasswordMessage({ type: "success", text: result.message });
      passwordForm.reset();
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

      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.name,
          image: data.image,
          nickname: data.nickname,
          phoneNumber: data.phoneNumber,
          dateOfBirth: data.dateOfBirth,
        },
      });

      alert("Perfil actualizado correctamente ✅");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabBtn = (tab: string): React.CSSProperties => ({
    width: '100%', display: 'flex', alignItems: 'center', gap: 11,
    padding: '12px 16px', borderRadius: 12, border: '1px solid',
    fontFamily: 'var(--lh-font)', fontWeight: 600, fontSize: 14.5, cursor: 'pointer',
    transition: 'background .18s, color .18s, border-color .18s',
    background: activeTab === tab ? 'var(--lh-accent)' : 'var(--lh-surface)',
    borderColor: activeTab === tab ? 'var(--lh-accent)' : 'var(--lh-border)',
    color: activeTab === tab ? '#fff' : 'var(--lh-fg2)',
  });

  const sectionBox: React.CSSProperties = { borderRadius: 14, border: '1px solid var(--lh-border)', overflow: 'hidden' };

  return (
    <div className="flex flex-col md:flex-row gap-8">

      {/* SIDEBAR DE NAVEGACIÓN */}
      <aside className="w-full md:w-60" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={() => setActiveTab("general")} style={tabBtn("general")}>
          <User size={18} /> General
        </button>
        <button onClick={() => setActiveTab("security")} style={tabBtn("security")}>
          <Lock size={18} /> Seguridad
        </button>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-1">

        {/* PESTAÑA: GENERAL */}
        {activeTab === "general" && (
          <div className="lh-card" style={{ padding: 'clamp(20px,4vw,32px)' }}>
            <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 19, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--lh-fg)', margin: '0 0 24px' }}>
              Información personal
            </h2>

            <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Foto de perfil */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ position: 'relative', width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--lh-border)', background: 'var(--lh-surface2)' }}>
                  {form.watch("image") ? (
                    <Image src={form.watch("image")!} alt="Avatar" fill style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User style={{ color: 'var(--lh-fg3)' }} />
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
                    <button type="button" onClick={() => open()} style={{ fontSize: 14, fontWeight: 600, color: 'var(--lh-accent)', background: 'transparent', border: 0, cursor: 'pointer' }}>
                      Cambiar foto
                    </button>
                  )}
                </CldUploadWidget>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="lh-label">Nombre completo</label>
                  <input {...form.register("name")} className={`lh-input${form.formState.errors.name ? ' lh-input--invalid' : ''}`} />
                  {form.formState.errors.name && <p style={errText}>{form.formState.errors.name.message}</p>}
                </div>
                <div>
                  <label className="lh-label">Apodo (nickname)</label>
                  <input {...form.register("nickname")} className="lh-input" />
                </div>

                <div>
                  <label className="lh-label">Email</label>
                  <input {...form.register("email")} disabled className="lh-input" style={{ opacity: 0.6, cursor: 'not-allowed' }} title="Para cambiar el email, ve a Seguridad" />
                </div>

                <div>
                  <label className="lh-label">Teléfono (Australia)</label>
                  <input {...form.register("phoneNumber")} placeholder="0412 345 678" className={`lh-input${form.formState.errors.phoneNumber ? ' lh-input--invalid' : ''}`} />
                  {form.formState.errors.phoneNumber && <p style={errText}>{form.formState.errors.phoneNumber.message}</p>}
                </div>

                <div>
                  <label className="lh-label">Fecha de nacimiento</label>
                  <input type="date" {...form.register("dateOfBirth")} className={`lh-input${form.formState.errors.dateOfBirth ? ' lh-input--invalid' : ''}`} />
                  <p style={fieldHint}>Debes ser mayor de 16 años.</p>
                  {form.formState.errors.dateOfBirth && <p style={errText}>{form.formState.errors.dateOfBirth.message}</p>}
                </div>
              </div>

              <div style={{ paddingTop: 18, borderTop: '1px solid var(--lh-border)' }}>
                <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
                  {!isSubmitting && <Save size={18} />}
                  {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* PESTAÑA: SEGURIDAD */}
        {activeTab === "security" && (
          <div className="lh-card" style={{ padding: 'clamp(20px,4vw,32px)', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 19, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--lh-fg)', margin: 0 }}>
              Seguridad de la cuenta
            </h2>

            <div style={sectionBox}>
              <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, background: 'var(--lh-surface2)' }}>
                <div>
                  <h3 style={{ fontWeight: 600, color: 'var(--lh-fg)', margin: 0 }}>Contraseña</h3>
                  <p style={{ fontSize: 13.5, color: 'var(--lh-fg2)', margin: '2px 0 0' }}>Se recomienda cambiarla cada 3 meses.</p>
                </div>

                {isGoogleUser && !hasPassword ? (
                  <span style={comingSoon}>Gestionada por Google</span>
                ) : (
                  <button
                    type="button"
                    style={{ fontWeight: 600, fontSize: 14, color: 'var(--lh-accent)', background: 'transparent', border: 0, cursor: 'pointer' }}
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
                <div style={{ padding: '0 16px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, borderRadius: 12, border: '1px solid color-mix(in oklch, var(--lh-warm) 35%, transparent)', background: 'color-mix(in oklch, var(--lh-warm) 9%, var(--lh-surface))', padding: 12 }}>
                    <AlertTriangle size={18} style={{ color: 'var(--lh-warm)', flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: 0 }}>
                      Tu cuenta está vinculada a Google. Para cambiar tu contraseña, hazlo directamente desde tu{" "}
                      <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', fontWeight: 500, color: 'var(--lh-accent)' }}>
                        cuenta de Google
                      </a>.
                    </p>
                  </div>
                </div>
              )}

              {showPasswordForm && hasPassword && (
                <div style={{ borderTop: '1px solid var(--lh-border)', padding: 16, background: 'var(--lh-surface)' }}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label className="lh-label">Contraseña actual</label>
                      <div style={{ position: 'relative' }}>
                        <input {...passwordForm.register("currentPassword")} type={showCurrentPw ? "text" : "password"} autoComplete="current-password" className="lh-input" style={{ paddingRight: 44 }} placeholder="Ingresa tu contraseña actual" />
                        <button type="button" onClick={() => setShowCurrentPw((v) => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--lh-fg3)', display: 'flex' }} aria-label={showCurrentPw ? "Ocultar contraseña" : "Mostrar contraseña"}>
                          {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.currentPassword && <p style={errText}>{passwordForm.formState.errors.currentPassword.message}</p>}
                    </div>

                    <div>
                      <label className="lh-label">Nueva contraseña</label>
                      <div style={{ position: 'relative' }}>
                        <input {...passwordForm.register("newPassword")} type={showNewPw ? "text" : "password"} autoComplete="new-password" className="lh-input" style={{ paddingRight: 44 }} placeholder="Mínimo 8 caracteres" />
                        <button type="button" onClick={() => setShowNewPw((v) => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--lh-fg3)', display: 'flex' }} aria-label={showNewPw ? "Ocultar contraseña" : "Mostrar contraseña"}>
                          {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.newPassword && <p style={errText}>{passwordForm.formState.errors.newPassword.message}</p>}

                      {watchedNewPassword && (
                        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div
                                key={i}
                                style={{
                                  height: 6, flex: 1, borderRadius: 99,
                                  background: i <= passwordStrength.score
                                    ? passwordStrength.score <= 2 ? '#ef4444' : passwordStrength.score <= 3 ? 'var(--lh-warm)' : 'var(--lh-green)'
                                    : 'var(--lh-surface2)',
                                }}
                              />
                            ))}
                          </div>
                          <ul style={{ display: 'flex', flexDirection: 'column', gap: 4, margin: 0, padding: 0, listStyle: 'none' }}>
                            {passwordStrength.checks.map((check) => (
                              <li key={check.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                {check.passed ? <CheckCircle2 size={14} style={{ color: 'var(--lh-green)', flexShrink: 0 }} /> : <XCircle size={14} style={{ color: 'var(--lh-fg3)', flexShrink: 0 }} />}
                                <span style={{ color: check.passed ? 'var(--lh-green)' : 'var(--lh-fg3)' }}>{check.label}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="lh-label">Confirmar nueva contraseña</label>
                      <div style={{ position: 'relative' }}>
                        <input {...passwordForm.register("confirmPassword")} type={showConfirmPw ? "text" : "password"} autoComplete="new-password" className="lh-input" style={{ paddingRight: 44 }} placeholder="Repite la nueva contraseña" />
                        <button type="button" onClick={() => setShowConfirmPw((v) => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--lh-fg3)', display: 'flex' }} aria-label={showConfirmPw ? "Ocultar contraseña" : "Mostrar contraseña"}>
                          {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.confirmPassword && <p style={errText}>{passwordForm.formState.errors.confirmPassword.message}</p>}
                    </div>

                    {passwordMessage && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 12, fontSize: 14, border: `1px solid color-mix(in oklch, var(--lh-${passwordMessage.type === 'success' ? 'green' : 'terra'}) 30%, transparent)`, background: `color-mix(in oklch, var(--lh-${passwordMessage.type === 'success' ? 'green' : 'terra'}) 10%, var(--lh-surface))`, color: passwordMessage.type === 'success' ? 'var(--lh-green)' : 'var(--lh-terra)' }}>
                        {passwordMessage.type === "success" ? <CheckCircle2 size={16} style={{ flexShrink: 0 }} /> : <XCircle size={16} style={{ flexShrink: 0 }} />}
                        {passwordMessage.text}
                      </div>
                    )}

                    <Button type="submit" variant="primary" size="sm" disabled={passwordSubmitting}>
                      {!passwordSubmitting && <Lock size={15} />}
                      {passwordSubmitting ? 'Actualizando…' : 'Cambiar contraseña'}
                    </Button>
                  </form>
                </div>
              )}
            </div>

            <div style={{ padding: 16, ...sectionBox, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <h3 style={{ fontWeight: 600, color: 'var(--lh-fg)', margin: 0 }}>Autenticación de 2 factores</h3>
                <p style={{ fontSize: 13.5, color: 'var(--lh-fg2)', margin: '2px 0 0' }}>Agrega una capa extra de seguridad.</p>
              </div>
              <span style={comingSoon}>Próximamente</span>
            </div>

            <div style={{ padding: 16, ...sectionBox, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <h3 style={{ fontWeight: 600, color: 'var(--lh-fg)', margin: 0 }}>Verificación de identidad</h3>
                <p style={{ fontSize: 13.5, color: 'var(--lh-fg2)', margin: '2px 0 0' }}>Verifica tu cuenta con ID australiano.</p>
              </div>
              <span style={comingSoon}>Próximamente</span>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
