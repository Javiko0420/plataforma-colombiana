/**
 * Fuente de verdad de categorías para web y mobile (Latin Territory).
 * --------------------------------------------------------------------
 * Cada vertical tiene su propio set semántico. El `value` es la clave estable
 * (MAYÚSCULAS, sin tildes) que se guarda en la BD, viaja por la API y se usa en
 * filtros; el `label` es el texto legible para mostrar en la UI.
 *
 * IMPORTANTE: este módulo es TS puro y NO debe importar `@prisma/client`,
 * porque lo consumen client components (forms/filtros). La sincronía de los
 * valores de negocio con el enum Prisma `Category` se verifica en
 * `src/lib/__tests__/categories.test.ts`.
 */

export type CategoryOption = { value: string; label: string };

// Negocios: sectores comerciales. Los `value` coinciden con el enum Prisma `Category`.
export const BUSINESS_CATEGORIES = [
  { value: 'GASTRONOMIA', label: 'Gastronomía' },
  { value: 'TECNOLOGIA', label: 'Tecnología' },
  { value: 'ARTESANIAS', label: 'Artesanías' },
  { value: 'SERVICIOS', label: 'Servicios' },
  { value: 'MODA', label: 'Moda' },
  { value: 'AGRICULTURA', label: 'Agricultura' },
  { value: 'TURISMO', label: 'Turismo' },
  { value: 'SALUD', label: 'Salud' },
  { value: 'EDUCACION', label: 'Educación' },
  { value: 'CONSTRUCCION', label: 'Construcción' },
  { value: 'TRANSPORTE', label: 'Transporte' },
  { value: 'ENTRETENIMIENTO', label: 'Entretenimiento' },
  { value: 'OTROS', label: 'Otros' },
] as const satisfies readonly CategoryOption[];

// Eventos: tipos de evento.
export const EVENT_CATEGORIES = [
  { value: 'CONCIERTO', label: 'Concierto' },
  { value: 'TEATRO', label: 'Teatro' },
  { value: 'COMEDIA', label: 'Comedia' },
  { value: 'FIESTA', label: 'Fiesta' },
  { value: 'FESTIVAL', label: 'Festival' },
  { value: 'DEPORTES', label: 'Deportes' },
  { value: 'CULTURAL', label: 'Cultural' },
  { value: 'NETWORKING', label: 'Networking' },
  { value: 'OTRO', label: 'Otro' },
] as const satisfies readonly CategoryOption[];

// Empleos: áreas laborales.
export const JOB_CATEGORIES = [
  { value: 'TECNOLOGIA', label: 'Tecnología' },
  { value: 'HOSTELERIA', label: 'Hostelería' },
  { value: 'CONSTRUCCION', label: 'Construcción' },
  { value: 'VENTAS', label: 'Ventas' },
  { value: 'MARKETING', label: 'Marketing' },
] as const satisfies readonly CategoryOption[];

// Arrays de claves canónicas (para validación rápida).
export const businessCategoryValues = BUSINESS_CATEGORIES.map((c) => c.value);
export const eventCategoryValues = EVENT_CATEGORIES.map((c) => c.value);
export const jobCategoryValues = JOB_CATEGORIES.map((c) => c.value);

/** True si `value` es una clave válida dentro de la lista dada. */
export function isValidCategory(list: readonly CategoryOption[], value: string): boolean {
  return list.some((c) => c.value === value);
}

/** Devuelve el label de una clave; si no existe, devuelve la clave misma. */
export function categoryLabel(list: readonly CategoryOption[], value: string): string {
  return list.find((c) => c.value === value)?.label ?? value;
}
