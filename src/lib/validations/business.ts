import { z } from "zod";

export const businessSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(50),
  description: z.string().min(10, "Cuéntanos un poco más sobre tu negocio (mínimo 10 caracteres)").max(500),
  category: z.string().min(1, "Selecciona una categoría"),
  
  email: z.string().email("Ingresa un correo válido"),
  phone: z
    .string()
    .min(10, "El número es muy corto")
    .regex(
      /^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/, 
      "Debe ser un número válido de Australia (ej: 0412 345 678 o +61...)"
    ),
  website: z.string().url("Debe ser una URL válida (https://...)").optional().or(z.literal("")),
  
  // Redes: Aceptamos URLs o Usernames, pero lo ideal es validar formato
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  whatsapp: z.string().optional(),

  address: z.string().optional(),
  city: z.string().min(1, "La ciudad es obligatoria"),
  
  // Validamos que suban máximo 5 imágenes
  images: z.array(z.string()).min(1, "Sube al menos 1 imagen").max(5, "Máximo 5 imágenes"),
});

export type BusinessFormValues = z.infer<typeof businessSchema>;
