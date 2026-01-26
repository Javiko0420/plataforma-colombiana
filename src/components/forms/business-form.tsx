// src/components/forms/business-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessSchema, BusinessFormValues } from "@/lib/validations/business";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Globe, Phone, Mail, Instagram, CheckCircle2 } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import Image from "next/image";

interface BusinessFormProps {
  initialData?: BusinessFormValues & { id: string; slug: string }; // Si viene data, es EDICIÓN
}

export default function BusinessForm({ initialData }: BusinessFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Título dinámico
  const action = initialData ? "Guardar Cambios" : "Lanzar mi Negocio 🚀";
  const title = initialData ? "Editar Territorio" : "Registra tu Territorio";
  const description = initialData ? "Mantén tu información actualizada." : "Empieza gratis. Escala cuando quieras.";

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      category: "",
      city: "Sydney",
      website: "",
      instagram: "",
      images: [],
    },
    mode: "onChange",
  });

  const watchAllFields = form.watch();

  const onSubmit = async (data: BusinessFormValues) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        // MODO EDICIÓN (PUT)
        const res = await fetch(`/api/businesses/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Error al actualizar");
        }

        // ÉXITO
        alert("¡Cambios guardados con éxito!"); // Feedback visual inmediato
        
        router.refresh(); // 👈 IMPORTANTE: Obliga a Next.js a recargar los datos del servidor
        
        // Esperamos un poquito para asegurar que el refresh ocurra antes de navegar
        setTimeout(() => {
          router.push(`/negocio/${initialData.slug}`); 
        }, 100);

      } else {
        // MODO CREACIÓN (POST)
        const res = await fetch("/api/businesses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Error al crear");
        router.push("/perfil?success=business_created");
      }
    } catch (error) {
      alert("Hubo un error. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* COLUMNA IZQUIERDA: FORMULARIO */}
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-slate-400 mt-2">{description}</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log("Errores de validación:", errors);
        })} className="space-y-6">
          {/* Datos Básicos */}
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-100"><Building2 className="w-5 h-5 text-blue-400" /> Datos del Negocio</h2>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-300">Nombre del Negocio</label>
              <input {...form.register("name")} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" placeholder="Ej: Arepas Donde Javi" />
              {form.formState.errors.name && <p className="text-red-400 text-xs">{form.formState.errors.name.message}</p>}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-300">Categoría</label>
              <select {...form.register("category")} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white">
                <option value="">Selecciona una...</option>
                <option value="Gastronomía">Gastronomía</option>
                <option value="Servicios">Servicios</option>
                <option value="Salud">Salud</option>
                <option value="Construcción">Construcción</option>
                <option value="Educación">Educación</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Otros">Otros</option>
              </select>
              {form.formState.errors.category && <p className="text-red-400 text-xs">{form.formState.errors.category.message}</p>}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-300">Descripción</label>
              <textarea {...form.register("description")} rows={4} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
              {form.formState.errors.description && <p className="text-red-400 text-xs">{form.formState.errors.description.message}</p>}
            </div>
          </div>

          {/* Galería (Componente ImageUpload) */}
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-100">📸 Galería</h2>
            <ImageUpload 
              value={watchAllFields.images || []} 
              disabled={isSubmitting}
              onChange={(url) => {
                const current = form.getValues("images") || [];
                form.setValue("images", [...current, url], { shouldValidate: true });
              }}
              onRemove={(url) => {
                const current = form.getValues("images") || [];
                form.setValue("images", current.filter((c) => c !== url), { shouldValidate: true });
              }}
            />
            {form.formState.errors.images && <p className="text-red-400 text-xs">{form.formState.errors.images.message}</p>}
          </div>

          {/* Contacto */}
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-100"><MapPin className="w-5 h-5 text-green-400" /> Contacto</h2>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-sm font-medium text-slate-300">Ciudad</label>
                  <select {...form.register("city")} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white">
                    <option value="Sydney">Sydney</option>
                    <option value="Melbourne">Melbourne</option>
                    <option value="Brisbane">Brisbane</option>
                    <option value="Perth">Perth</option>
                    <option value="Adelaide">Adelaide</option>
                    <option value="Gold Coast">Gold Coast</option>
                  </select>
               </div>
               <div>
                  <label className="text-sm font-medium text-slate-300">Email</label>
                  <input {...form.register("email")} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
                  {form.formState.errors.email && <p className="text-red-400 text-xs mt-1">{form.formState.errors.email.message}</p>}
               </div>
            </div>
            <div>
               <label className="text-sm font-medium text-slate-300">WhatsApp / Teléfono</label>
               <input {...form.register("phone")} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
               {form.formState.errors.phone && <p className="text-red-400 text-xs mt-1">{form.formState.errors.phone.message}</p>}
            </div>
            <div>
               <label className="text-sm font-medium text-slate-300">Instagram (Usuario)</label>
               <input {...form.register("instagram")} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" placeholder="sin @" />
            </div>
            <div>
               <label className="text-sm font-medium text-slate-300">Sitio Web (Opcional)</label>
               <input {...form.register("website")} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" placeholder="https://..." />
            </div>
          </div>

          {/* Mostrar resumen de errores si los hay */}
          {Object.keys(form.formState.errors).length > 0 && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-sm font-medium">Por favor corrige los siguientes campos:</p>
              <ul className="text-red-300 text-xs mt-2 list-disc list-inside">
                {Object.entries(form.formState.errors).map(([field, error]) => (
                  <li key={field}>{field}: {error?.message as string}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Guardando..." : action}
          </button>
        </form>
      </div>

      {/* COLUMNA DERECHA: LIVE PREVIEW */}
      <div className="hidden lg:block sticky top-8 h-fit">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Vista Previa</h3>
        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            {/* Portada Preview */}
            <div className="h-48 bg-slate-800 relative">
               {watchAllFields.images && watchAllFields.images.length > 0 ? (
                  <Image src={watchAllFields.images[0]} alt="Preview" fill className="object-cover" />
               ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-900 to-slate-800">
                    <Building2 className="w-16 h-16 text-white/20" />
                  </div>
               )}
            </div>
            <div className="p-6 space-y-4">
                <h2 className="text-2xl font-bold text-white">{watchAllFields.name || "Nombre del Negocio"}</h2>
                <p className="text-blue-400 text-sm">{watchAllFields.category || "Categoría"} • {watchAllFields.city}</p>
                <p className="text-slate-400 text-sm">{watchAllFields.description || "Descripción..."}</p>
            </div>
        </div>
      </div>
    </div>
  );
}
