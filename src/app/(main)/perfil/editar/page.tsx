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
import { LtPageShell, LtPanel, LtButton } from "@/components/lt";

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
    defaultValues: {
      name: "",
      nickname: "",
      image: "",
    },
  });

  useEffect(() => {
    if (session?.user) {
      form.reset({
        name: session.user.name || "",
        // @ts-ignore: nickname puede no estar en los tipos base de next-auth aun
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
      const res = await fetch("/api/users/me", {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar cuenta");

      await signOut({ callbackUrl: "/" });

    } catch (error) {
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
        user: {
            ...session?.user,
            name: data.name,
            image: data.image,
            nickname: data.nickname
        }
      });

      router.push("/perfil");
      router.refresh();
    } catch (error) {
      alert("Hubo un error al guardar tu perfil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <LtPageShell maxWidth="2xl">
        <p className="p-8 text-center" style={{ color: 'var(--lt-ink-soft)' }}>Cargando...</p>
      </LtPageShell>
    );
  }

  return (
    <LtPageShell maxWidth="2xl">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href="/perfil"
            className="p-2 rounded-full border-2 border-[var(--lt-ink)] transition-colors hover:-translate-y-0.5"
            style={{ background: 'var(--lt-paper)' }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--lt-ink)' }} />
          </Link>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            Editar mi Perfil
          </h1>
        </div>

        <LtPanel className="p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div
                className="relative w-32 h-32 rounded-full overflow-hidden border-[3px] border-[var(--lt-ink)] group"
                style={{ background: 'var(--lt-bg)' }}
              >
                {form.watch("image") ? (
                  <Image src={form.watch("image")!} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16" style={{ color: 'var(--lt-ink-soft)' }} />
                  </div>
                )}
                
                <CldUploadWidget
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
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </button>
                  )}
                </CldUploadWidget>
              </div>
              <p className="text-xs" style={{ color: 'var(--lt-ink-soft)' }}>
                Haz clic en la foto para cambiarla
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="lt-label">Nombre Completo</label>
                <input
                  {...form.register("name")}
                  className="lt-input"
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <label className="lt-label">Apodo (Nickname)</label>
                <input
                  {...form.register("nickname")}
                  placeholder="Ej: JaviDev"
                  className="lt-input"
                />
                <p className="text-xs" style={{ color: 'var(--lt-ink-soft)' }}>
                  Así te verán en los foros y comentarios.
                </p>
              </div>
            </div>

            <LtButton
              type="submit"
              variant="sticker"
              tone="terracota"
              size="md"
              className="w-full"
              disabled={isSubmitting}
              loading={isSubmitting}
              loadingText="Guardando..."
              iconLeft={!isSubmitting ? <Save className="w-5 h-5" /> : undefined}
            >
              Guardar Cambios
            </LtButton>
          </form>

          <hr className="my-8 border-[var(--lt-ink)] opacity-20" />

          <div
            className="rounded-[var(--lt-radius-lg)] border-2 border-red-500 p-6"
            style={{ background: 'var(--lt-bg)' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="p-3 rounded-full border-2 border-red-500"
                style={{ background: 'var(--lt-paper)' }}
              >
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3
                  className="text-lg font-bold mb-1"
                  style={{ color: 'var(--lt-ink)' }}
                >
                  Eliminar Cuenta
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--lt-ink-soft)' }}>
                  Si eliminas tu cuenta, perderás acceso a todos tus negocios y reseñas. Esta acción no se puede deshacer.
                </p>
                <LtButton
                  type="button"
                  variant="sticker"
                  tone="ink"
                  size="sm"
                  onClick={handleDeleteAccount}
                  disabled={isSubmitting}
                  iconLeft={<Trash2 className="w-4 h-4" />}
                  style={{ background: '#dc2626', color: 'white', borderColor: '#991b1b' }}
                >
                  Sí, eliminar mi cuenta definitivamente
                </LtButton>
              </div>
            </div>
          </div>
        </LtPanel>
      </div>
    </LtPageShell>
  );
}
