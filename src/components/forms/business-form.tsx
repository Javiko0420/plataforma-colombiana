// src/components/forms/business-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessSchema, BusinessFormValues } from "@/lib/validations/business";
import { BUSINESS_CATEGORIES } from "@/lib/constants/categories";
import { useRouter } from "next/navigation";
import { Building2, MapPin } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import Image from "next/image";
import { LtButton, LtPanel } from "@/components/lt";

interface BusinessFormProps {
  initialData?: BusinessFormValues & { id: string; slug: string };
}

export default function BusinessForm({ initialData }: BusinessFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const action = initialData ? "Guardar Cambios" : "Lanzar mi Negocio 🚀";
  const title = initialData ? "Editar Territorio" : "Registra tu Territorio";
  const description = initialData ? "Mantén tu información actualizada." : "Empieza gratis. Escala cuando quieras.";

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
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
        const res = await fetch(`/api/businesses/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Error al actualizar");
        }

        alert("¡Cambios guardados con éxito!");

        router.refresh();

        setTimeout(() => {
          router.push(`/negocio/${initialData.slug}`);
        }, 100);
      } else {
        const res = await fetch("/api/businesses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Error al crear");
        router.push("/perfil?success=business_created");
      }
    } catch {
      alert("Hubo un error. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-8">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            {title}
          </h1>
          <p
            className="mt-2"
            style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
          >
            {description}
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log("Errores de validación:", errors);
        })} className="space-y-6">
          <LtPanel tone="bg" shadow="sm" className="p-6 space-y-4">
            <h2
              className="text-xl font-semibold flex items-center gap-2"
              style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
            >
              <Building2 className="w-5 h-5" style={{ color: 'var(--lt-terracota)' }} />
              Datos del Negocio
            </h2>
            <div className="grid gap-2">
              <label htmlFor="name" className="lt-label">Nombre del Negocio</label>
              <input id="name" {...form.register("name")} className="lt-input" placeholder="Ej: Arepas Donde Javi" />
              {form.formState.errors.name && (
                <p className="text-xs" style={{ color: 'var(--lt-accent)' }}>{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <label htmlFor="category" className="lt-label">Categoría</label>
              <select id="category" {...form.register("category")} className="lt-input">
                <option value="">Selecciona una...</option>
                {BUSINESS_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {form.formState.errors.category && (
                <p className="text-xs" style={{ color: 'var(--lt-accent)' }}>{form.formState.errors.category.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="lt-label">Descripción</label>
              <textarea id="description" {...form.register("description")} rows={4} className="lt-input" />
              {form.formState.errors.description && (
                <p className="text-xs" style={{ color: 'var(--lt-accent)' }}>{form.formState.errors.description.message}</p>
              )}
            </div>
          </LtPanel>

          <LtPanel tone="bg" shadow="sm" className="p-6 space-y-4">
            <h2
              className="text-xl font-semibold flex items-center gap-2"
              style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
            >
              📸 Galería
            </h2>
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
            {form.formState.errors.images && (
              <p className="text-xs" style={{ color: 'var(--lt-accent)' }}>{form.formState.errors.images.message}</p>
            )}
          </LtPanel>

          <LtPanel tone="bg" shadow="sm" className="p-6 space-y-4">
            <h2
              className="text-xl font-semibold flex items-center gap-2"
              style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
            >
              <MapPin className="w-5 h-5" style={{ color: 'var(--lt-verde)' }} />
              Contacto
            </h2>
            <div className="mb-4">
              <label htmlFor="address" className="lt-label">Dirección Física (Opcional)</label>
              <input
                id="address"
                {...form.register("address")}
                className="lt-input"
                placeholder="Ej: 123 Queen St, Brisbane City"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--lt-ink-soft)' }}>
                Si la pones, crearemos un botón de &apos;Cómo llegar&apos; automático.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="lt-label">Ciudad</label>
                <select id="city" {...form.register("city")} className="lt-input">
                  <option value="Sydney">Sydney</option>
                  <option value="Melbourne">Melbourne</option>
                  <option value="Brisbane">Brisbane</option>
                  <option value="Perth">Perth</option>
                  <option value="Adelaide">Adelaide</option>
                  <option value="Gold Coast">Gold Coast</option>
                </select>
              </div>
              <div>
                <label htmlFor="email" className="lt-label">Email</label>
                <input id="email" {...form.register("email")} className="lt-input" />
                {form.formState.errors.email && (
                  <p className="text-xs mt-1" style={{ color: 'var(--lt-accent)' }}>{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="phone" className="lt-label">WhatsApp / Teléfono</label>
              <input id="phone" {...form.register("phone")} className="lt-input" />
              {form.formState.errors.phone && (
                <p className="text-xs mt-1" style={{ color: 'var(--lt-accent)' }}>{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="instagram" className="lt-label">Instagram (Usuario)</label>
              <input id="instagram" {...form.register("instagram")} className="lt-input" placeholder="sin @" />
            </div>
            <div>
              <label htmlFor="website" className="lt-label">Sitio Web (Opcional)</label>
              <input id="website" {...form.register("website")} className="lt-input" placeholder="https://..." />
            </div>
          </LtPanel>

          {Object.keys(form.formState.errors).length > 0 && (
            <LtPanel tone="bg" shadow="sm" className="p-4 border-[var(--lt-accent)]">
              <p className="text-sm font-medium" style={{ color: 'var(--lt-accent)' }}>
                Por favor corrige los siguientes campos:
              </p>
              <ul className="text-xs mt-2 list-disc list-inside" style={{ color: 'var(--lt-ink-soft)' }}>
                {Object.entries(form.formState.errors).map(([field, error]) => (
                  <li key={field}>{field}: {error?.message as string}</li>
                ))}
              </ul>
            </LtPanel>
          )}

          <div className="flex gap-4">
            {initialData && (
              <LtButton
                type="button"
                variant="outline"
                tone="paper"
                size="lg"
                onClick={() => router.push("/perfil")}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </LtButton>
            )}
            <LtButton
              type="submit"
              variant="sticker"
              tone="terracota"
              size="lg"
              rotate={-1}
              disabled={isSubmitting}
              loading={isSubmitting}
              loadingText="Guardando..."
              className={initialData ? "flex-1" : "w-full"}
            >
              {action}
            </LtButton>
          </div>
        </form>
      </div>

      <div className="hidden lg:block sticky top-8 h-fit">
        <h3
          className="text-sm font-medium uppercase tracking-wider mb-4"
          style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
        >
          Vista Previa
        </h3>
        <LtPanel shadow="lg" className="overflow-hidden">
          <div className="h-48 relative" style={{ background: 'var(--lt-bg)' }}>
            {watchAllFields.images && watchAllFields.images.length > 0 ? (
              <Image src={watchAllFields.images[0]} alt="Preview" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--lt-bg)' }}>
                <Building2 className="w-16 h-16 opacity-20" style={{ color: 'var(--lt-ink)' }} />
              </div>
            )}
          </div>
          <div className="p-6 space-y-4">
            <h2
              className="text-2xl font-bold"
              style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
            >
              {watchAllFields.name || "Nombre del Negocio"}
            </h2>
            <p className="text-sm" style={{ color: 'var(--lt-terracota)' }}>
              {watchAllFields.category || "Categoría"} • {watchAllFields.city}
            </p>
            <p className="text-sm" style={{ color: 'var(--lt-ink-soft)' }}>
              {watchAllFields.description || "Descripción..."}
            </p>
          </div>
        </LtPanel>
      </div>
    </div>
  );
}
