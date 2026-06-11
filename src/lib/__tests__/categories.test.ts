/**
 * Categorías: tests de integridad y anti-drift.
 */

import { describe, it, expect } from 'vitest';
import { Category } from '@prisma/client';
import {
  BUSINESS_CATEGORIES,
  EVENT_CATEGORIES,
  JOB_CATEGORIES,
  businessCategoryValues,
  isValidCategory,
  categoryLabel,
} from '@/lib/constants/categories';

describe('categorías - fuente de verdad', () => {
  it('los valores de negocio coinciden exactamente con el enum Prisma Category', () => {
    // Si esto falla, el módulo de constantes y el schema de Prisma se desincronizaron.
    expect([...businessCategoryValues].sort()).toEqual([...Object.values(Category)].sort());
  });

  it('todas las claves son MAYÚSCULAS sin tildes ni espacios', () => {
    const all = [...BUSINESS_CATEGORIES, ...EVENT_CATEGORIES, ...JOB_CATEGORIES];
    for (const { value } of all) {
      expect(value).toMatch(/^[A-Z]+$/);
    }
  });

  it('no hay valores duplicados dentro de cada vertical', () => {
    for (const list of [BUSINESS_CATEGORIES, EVENT_CATEGORIES, JOB_CATEGORIES]) {
      const values = list.map((c) => c.value);
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it('isValidCategory distingue claves válidas e inválidas', () => {
    expect(isValidCategory(EVENT_CATEGORIES, 'CONCIERTO')).toBe(true);
    expect(isValidCategory(EVENT_CATEGORIES, 'Concierto')).toBe(false);
    expect(isValidCategory(JOB_CATEGORIES, 'PIZZA')).toBe(false);
  });

  it('categoryLabel devuelve la etiqueta legible y cae al value si no existe', () => {
    expect(categoryLabel(BUSINESS_CATEGORIES, 'GASTRONOMIA')).toBe('Gastronomía');
    expect(categoryLabel(BUSINESS_CATEGORIES, 'NO_EXISTE')).toBe('NO_EXISTE');
  });
});
