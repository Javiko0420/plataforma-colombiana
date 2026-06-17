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
import { Button } from "@/components/lh/Button";

interface BusinessFormProps {
  initialData?: BusinessFormValues & { id: string; slug: string };
}

const errText: React.CSSProperties = { fontSize: 12.5, marginTop: 6, color: 'var(--lh-terra)' };
const sectionTitle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--lh-font)', fontSize: 17, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--lh-fg)', margin: 0 };

export default function BusinessForm({ initialData }: BusinessFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const action = initialData ? "Guardar cambios" : "Lanzar mi negocio 🚀";
  const title = initialData ? "Editar negocio" : "Registra tu negocio";
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div>
          <h1 className="lh-h2" style={{ fontSize: 'clamp(26px,4vw,32px)', margin: 0 }}>{title}</h1>
          <p style={{ marginTop: 8, color: 'var(--lh-fg2)' }}>{description}</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Datos del negocio */}
          <div className="lh-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={sectionTitle}>
              <Building2 size={18} style={{ color: 'var(--lh-accent)' }} /> Datos del negocio
            </h2>
            <div>
              <label htmlFor="name" className="lh-label">Nombre del negocio</label>
              <input id="name" {...form.register("name")} className={`lh-input${form.formState.errors.name ? ' lh-input--invalid' : ''}`} placeholder="Ej: Arepas Donde Javi" />
              {form.formState.errors.name && <p style={errText}>{form.formState.errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="category" className="lh-label">Categoría</label>
              <select id="category" {...form.register("category")} className={`lh-input${form.formState.errors.category ? ' lh-input--invalid' : ''}`}>
                <option value="">Selecciona una…</option>
                {BUSINESS_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {form.formState.errors.category && <p style={errText}>{form.formState.errors.category.message}</p>}
            </div>
            <div>
              <label htmlFor="description" className="lh-label">Descripción</label>
              <textarea id="description" {...form.register("description")} rows={4} className={`lh-input${form.formState.errors.description ? ' lh-input--invalid' : ''}`} style={{ resize: 'none' }} />
              {form.formState.errors.description && <p style={errText}>{form.formState.errors.description.message}</p>}
            </div>
          </div>

          {/* Galería */}
          <div className="lh-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={sectionTitle}>📸 Galería</h2>
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
            {form.formState.errors.images && <p style={errText}>{form.formState.errors.images.message}</p>}
          </div>

          {/* Contacto */}
          <div className="lh-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={sectionTitle}>
              <MapPin size={18} style={{ color: 'var(--lh-green)' }} /> Contacto
            </h2>
            <div>
              <label htmlFor="address" className="lh-label">Dirección física (opcional)</label>
              <input id="address" {...form.register("address")} className="lh-input" placeholder="Ej: 123 Queen St, Brisbane City" />
              <p style={{ fontSize: 12.5, marginTop: 6, color: 'var(--lh-fg3)' }}>
                Si la pones, crearemos un botón de &apos;Cómo llegar&apos; automático.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="lh-label">Ciudad</label>
                <select id="city" {...form.register("city")} className="lh-input">
                  <option value="Sydney">Sydney</option>
                  <option value="Melbourne">Melbourne</option>
                  <option value="Brisbane">Brisbane</option>
                  <option value="Perth">Perth</option>
                  <option value="Adelaide">Adelaide</option>
                  <option value="Gold Coast">Gold Coast</option>
                </select>
              </div>
              <div>
                <label htmlFor="email" className="lh-label">Email</label>
                <input id="email" {...form.register("email")} className={`lh-input${form.formState.errors.email ? ' lh-input--invalid' : ''}`} />
                {form.formState.errors.email && <p style={errText}>{form.formState.errors.email.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="phone" className="lh-label">WhatsApp / Teléfono</label>
              <input id="phone" {...form.register("phone")} className={`lh-input${form.formState.errors.phone ? ' lh-input--invalid' : ''}`} />
              {form.formState.errors.phone && <p style={errText}>{form.formState.errors.phone.message}</p>}
            </div>
            <div>
              <label htmlFor="instagram" className="lh-label">Instagram (usuario)</label>
              <input id="instagram" {...form.register("instagram")} className="lh-input" placeholder="sin @" />
            </div>
            <div>
              <label htmlFor="website" className="lh-label">Sitio web (opcional)</label>
              <input id="website" {...form.register("website")} className="lh-input" placeholder="https://..." />
            </div>
          </div>

          {Object.keys(form.formState.errors).length > 0 && (
            <div style={{ padding: '14px 16px', borderRadius: 13, background: 'color-mix(in oklch, var(--lh-terra) 10%, var(--lh-surface))', border: '1px solid color-mix(in oklch, var(--lh-terra) 30%, transparent)' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--lh-terra)', margin: 0 }}>Por favor corrige los siguientes campos:</p>
              <ul style={{ fontSize: 12.5, marginTop: 8, paddingLeft: 18, color: 'var(--lh-fg2)', listStyle: 'disc' }}>
                {Object.entries(form.formState.errors).map(([field, error]) => (
                  <li key={field}>{field}: {error?.message as string}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            {initialData && (
              <Button type="button" variant="secondary" size="md" onClick={() => router.push("/perfil")} disabled={isSubmitting} style={{ flex: 1 }}>
                Cancelar
              </Button>
            )}
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting} style={initialData ? { flex: 1 } : { width: '100%' }}>
              {isSubmitting ? 'Guardando…' : action}
            </Button>
          </div>
        </form>
      </div>

      {/* Vista previa */}
      <div className="hidden lg:block sticky top-8 h-fit">
        <h3 style={{ fontFamily: 'var(--lh-mono)', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--lh-fg3)', marginBottom: 16 }}>
          Vista previa
        </h3>
        <div className="lh-card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ height: 180, position: 'relative', background: 'var(--lh-surface2)' }}>
            {watchAllFields.images && watchAllFields.images.length > 0 ? (
              <Image src={watchAllFields.images[0]} alt="Preview" fill style={{ objectFit: 'cover' }} />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={56} style={{ color: 'var(--lh-fg3)', opacity: 0.4 }} />
              </div>
            )}
          </div>
          <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 22, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--lh-fg)', margin: 0 }}>
              {watchAllFields.name || "Nombre del negocio"}
            </h2>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--lh-accent)', margin: 0 }}>
              {watchAllFields.category || "Categoría"} • {watchAllFields.city}
            </p>
            <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: 0, lineHeight: 1.55 }}>
              {watchAllFields.description || "Descripción…"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
