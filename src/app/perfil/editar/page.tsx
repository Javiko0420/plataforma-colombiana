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

// Esquema local
const formSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  nickname: z.string().optional(),
  image: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditProfilePage() {
  const { data: session, update } = useSession(); // update permite actualizar la sesión del lado cliente
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

  // Cargar datos iniciales cuando la sesión esté ready
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
    // Doble confirmación para evitar accidentes
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

      // Cerrar sesión y mandar al home
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

      // ⚠️ TRUCO CLAVE: Actualizamos la sesión del navegador para ver la foto nueva al instante
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

  if (!session) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 flex justify-center">
      <div className="max-w-2xl w-full space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/perfil" className="p-2 bg-slate-900 rounded-full hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Editar mi Perfil</h1>
        </div>

        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 shadow-xl">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* FOTO DE PERFIL (Circular) */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-950 group">
                {form.watch("image") ? (
                  <Image src={form.watch("image")!} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700">
                    <User className="w-16 h-16" />
                  </div>
                )}
                
                {/* Overlay de Edición */}
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
              <p className="text-xs text-slate-500">Haz clic en la foto para cambiarla</p>
            </div>

            {/* CAMPOS DE TEXTO */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-300">Nombre Completo</label>
                <input
                  {...form.register("name")}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                {form.formState.errors.name && <p className="text-red-400 text-xs">{form.formState.errors.name.message}</p>}
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-300">Apodo (Nickname)</label>
                <input
                  {...form.register("nickname")}
                  placeholder="Ej: JaviDev"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <p className="text-xs text-slate-500">Así te verán en los foros y comentarios.</p>
              </div>
            </div>

            {/* BOTÓN GUARDAR */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2"
            >
              {isSubmitting ? "Guardando..." : (
                <>
                  <Save className="w-5 h-5" /> Guardar Cambios
                </>
              )}
            </button>

          </form>

          <hr className="my-8 border-slate-700" />

          {/* ZONA DE PELIGRO */}
          <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-900/30 rounded-full text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-400 mb-1">Eliminar Cuenta</h3>
                <p className="text-sm text-red-400/70 mb-4">
                  Si eliminas tu cuenta, perderás acceso a todos tus negocios y reseñas. Esta acción no se puede deshacer.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  type="button"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Sí, eliminar mi cuenta definitivamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
