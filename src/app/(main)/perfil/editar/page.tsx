"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Camera, Save, ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/lh/Button";

const formSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  nickname: z.string().optional(),
  image: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", nickname: "", image: "" },
  });

  useEffect(() => {
    if (session?.user) {
      form.reset({
        name: session.user.name || "",
        // @ts-expect-error nickname puede no estar en los tipos base de next-auth aun
        nickname: session.user.nickname || "",
        image: session.user.image || "",
      });
    }
  }, [session, form]);

  const handleDeleteAccount = async () => {
    const confirm1 = window.confirm("⚠️ ¿Estás seguro de que quieres eliminar tu cuenta permanentemente?");
    if (!confirm1) return;

    const confirm2 = window.confirm("⛔ ESTA ACCIÓN ES IRREVERSIBLE.\n\nSe borrarán todos tus negocios, fotos y reseñas. ¿Estás absolutamente seguro?");
    if (!confirm2) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/users/me", { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar cuenta");
      await signOut({ callbackUrl: "/" });
    } catch {
      alert("Hubo un error al intentar eliminar tu cuenta.");
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Error al actualizar");

      await update({
        ...session,
        user: { ...session?.user, name: data.name, image: data.image, nickname: data.nickname },
      });

      router.push("/perfil");
      router.refresh();
    } catch {
      alert("Hubo un error al guardar tu perfil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)' }}>
        <div className="lh-container" style={{ maxWidth: 680, paddingTop: 40 }}>
          <p style={{ padding: 32, textAlign: 'center', color: 'var(--lh-fg3)' }}>Cargando…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)' }}>
      <div className="lh-container" style={{ maxWidth: 680, paddingTop: 40, paddingBottom: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <Link href="/perfil" className="lh-btn lh-btn--sm lh-btn--secondary" style={{ padding: 10 }} aria-label="Volver al perfil">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="lh-h2" style={{ fontSize: 'clamp(22px,3.5vw,28px)', margin: 0 }}>Editar mi perfil</h1>
        </div>

        <div className="lh-card" style={{ padding: 'clamp(24px,5vw,32px)' }}>
          <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div className="group" style={{ position: 'relative', width: 128, height: 128, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--lh-border)', background: 'var(--lh-surface2)' }}>
                {form.watch("image") ? (
                  <Image src={form.watch("image")!} alt="Avatar" fill style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={56} style={{ color: 'var(--lh-fg3)' }} />
                  </div>
                )}

                <CldUploadWidget
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onSuccess={(result: any) => {
                    form.setValue("image", result.info.secure_url, { shouldValidate: true });
                  }}
                  uploadPreset="latinterritory_uploads"
                  options={{
                    maxFiles: 1,
                    maxFileSize: 2000000,
                    sources: ['local', 'camera', 'url'],
                    folder: 'avatars',
                    clientAllowedFormats: ['png', 'jpeg', 'jpg', 'webp'],
                  }}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="opacity-0 group-hover:opacity-100"
                      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity .2s', cursor: 'pointer', border: 0 }}
                    >
                      <Camera size={30} color="#fff" />
                    </button>
                  )}
                </CldUploadWidget>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--lh-fg3)' }}>Haz clic en la foto para cambiarla</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="lh-label">Nombre completo</label>
                <input {...form.register("name")} className={`lh-input${form.formState.errors.name ? ' lh-input--invalid' : ''}`} />
                {form.formState.errors.name && (
                  <p style={{ marginTop: 6, fontSize: 12.5, color: 'var(--lh-terra)' }}>{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="lh-label">Apodo (nickname)</label>
                <input {...form.register("nickname")} placeholder="Ej: JaviDev" className="lh-input" />
                <p style={{ marginTop: 6, fontSize: 12.5, color: 'var(--lh-fg3)' }}>Así te verán en los foros y comentarios.</p>
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" disabled={isSubmitting} style={{ width: '100%' }}>
              {!isSubmitting && <Save size={18} />}
              {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </form>

          <hr style={{ margin: '32px 0', border: 0, borderTop: '1px solid var(--lh-border)' }} />

          {/* Danger zone */}
          <div style={{ borderRadius: 16, border: '1px solid color-mix(in oklch, var(--lh-terra) 35%, transparent)', background: 'color-mix(in oklch, var(--lh-terra) 7%, var(--lh-surface))', padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in oklch, var(--lh-terra) 14%, transparent)', color: 'var(--lh-terra)' }}>
                <AlertTriangle size={22} />
              </span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: 'var(--lh-font)', fontSize: 16, fontWeight: 600, color: 'var(--lh-fg)', margin: '0 0 4px' }}>Eliminar cuenta</h3>
                <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: '0 0 16px', lineHeight: 1.55 }}>
                  Si eliminas tu cuenta, perderás acceso a todos tus negocios y reseñas. Esta acción no se puede deshacer.
                </p>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isSubmitting}
                  className="lh-btn lh-btn--sm"
                  style={{ background: 'var(--lh-terra)', color: '#fff', opacity: isSubmitting ? 0.6 : 1 }}
                >
                  <Trash2 size={15} /> Sí, eliminar mi cuenta definitivamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
