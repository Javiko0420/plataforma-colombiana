import { z } from 'zod'

/**
 * Validation schemas for the application
 * Using Zod for runtime type validation and security
 */

// User validation schemas
export const userRegistrationSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  email: z
    .string()
    .email('Formato de email inválido')
    .max(255, 'El email no puede exceder 255 caracteres')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial'
    ),
})

export const userLoginSchema = z.object({
  email: z.string().email('Formato de email inválido').toLowerCase(),
  password: z.string().min(1, 'La contraseña es requerida'),
})

// Business validation schemas
export const businessSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .trim(),
  category: z.enum([
    'GASTRONOMIA',
    'TECNOLOGIA',
    'ARTESANIAS',
    'SERVICIOS',
    'MODA',
    'AGRICULTURA',
    'TURISMO',
    'SALUD',
    'EDUCACION',
    'CONSTRUCCION',
    'TRANSPORTE',
    'ENTRETENIMIENTO',
    'OTROS'
  ]),
  city: z
    .string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(50, 'La ciudad no puede exceder 50 caracteres')
    .trim(),
  department: z
    .string()
    .min(2, 'El departamento debe tener al menos 2 caracteres')
    .max(50, 'El departamento no puede exceder 50 caracteres')
    .trim(),
  phone: z
    .string()
    .regex(/^\+57\s?[0-9]{10}$/, 'Formato de teléfono inválido. Use: +57 XXXXXXXXXX')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Formato de email inválido')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url('Formato de URL inválido')
    .optional()
    .or(z.literal('')),
  whatsapp: z
    .string()
    .regex(/^\+57\s?[0-9]{10}$/, 'Formato de WhatsApp inválido. Use: +57 XXXXXXXXXX')
    .optional()
    .or(z.literal('')),
  instagram: z
    .string()
    .regex(/^@[a-zA-Z0-9._]+$/, 'Formato de Instagram inválido. Use: @usuario')
    .optional()
    .or(z.literal('')),
  facebook: z
    .string()
    .url('Formato de URL de Facebook inválido')
    .optional()
    .or(z.literal('')),
})

// Product validation schemas
export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .trim(),
  price: z
    .number()
    .positive('El precio debe ser positivo')
    .max(999999999, 'El precio es demasiado alto')
    .optional(),
  currency: z.enum(['COP', 'USD', 'EUR']).default('COP'),
})

// Forum validation schemas
export const forumPostSchema = z.object({
  title: z
    .string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres')
    .trim(),
  content: z
    .string()
    .min(10, 'El contenido debe tener al menos 10 caracteres')
    .max(5000, 'El contenido no puede exceder 5000 caracteres')
    .trim(),
  forumId: z.string().cuid('ID de foro inválido'),
})

export const forumCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'El comentario no puede estar vacío')
    .max(1000, 'El comentario no puede exceder 1000 caracteres')
    .trim(),
  postId: z.string().cuid('ID de post inválido'),
})

// Search and filter schemas
export const searchSchema = z.object({
  query: z
    .string()
    .max(100, 'La búsqueda no puede exceder 100 caracteres')
    .trim()
    .optional(),
  category: z
    .enum([
      'GASTRONOMIA',
      'TECNOLOGIA',
      'ARTESANIAS',
      'SERVICIOS',
      'MODA',
      'AGRICULTURA',
      'TURISMO',
      'SALUD',
      'EDUCACION',
      'CONSTRUCCION',
      'TRANSPORTE',
      'ENTRETENIMIENTO',
      'OTROS'
    ])
    .optional(),
  department: z.string().max(50).optional(),
  city: z.string().max(50).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(50).default(10),
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z.object({
    size: z.number().max(5242880, 'El archivo no puede exceder 5MB'), // 5MB
    type: z.enum(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
      .refine(
        (val) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(val),
        { message: 'Tipo de archivo no permitido. Use: JPEG, PNG o WebP' }
      ),
    name: z.string().max(255, 'El nombre del archivo es demasiado largo'),
  })
})

// API response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
})

// Type exports for TypeScript
export type UserRegistration = z.infer<typeof userRegistrationSchema>
export type UserLogin = z.infer<typeof userLoginSchema>
export type BusinessData = z.infer<typeof businessSchema>
export type ProductData = z.infer<typeof productSchema>
export type ForumPostData = z.infer<typeof forumPostSchema>
export type ForumCommentData = z.infer<typeof forumCommentSchema>
export type SearchParams = z.infer<typeof searchSchema>
export type FileUpload = z.infer<typeof fileUploadSchema>
export type ApiResponse = z.infer<typeof apiResponseSchema>
