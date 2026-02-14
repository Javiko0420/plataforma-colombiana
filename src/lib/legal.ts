/**
 * Shared legal constants and utilities.
 * Single source of truth for document versions, age validation,
 * and legal contract text used across registration and profile completion flows.
 */

// Document versions — update these when legal documents change
export const LEGAL_VERSIONS = {
  contract: '2026-02-03',
  terms: '2026-01-31',
  privacy: '2026-01-31',
} as const

// Minimum age requirement (Australian law)
export const MIN_AGE = 16
export const MAX_AGE = 120

/**
 * Calculate age from date of birth.
 * Accounts for month/day to avoid off-by-one errors.
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--
  }

  return age
}

/**
 * Validate date of birth for registration eligibility.
 * Returns an error message if invalid, or null if valid.
 */
export function validateDateOfBirth(dateString: string): string | null {
  if (!dateString) {
    return 'La fecha de nacimiento es requerida'
  }

  const birthDate = new Date(dateString)

  if (isNaN(birthDate.getTime())) {
    return 'Fecha de nacimiento inválida'
  }

  if (birthDate > new Date()) {
    return 'La fecha de nacimiento no puede ser en el futuro'
  }

  const age = calculateAge(birthDate)

  if (age < MIN_AGE) {
    return `Debes tener al menos ${MIN_AGE} años para registrarte`
  }

  if (age > MAX_AGE) {
    return 'Fecha de nacimiento inválida'
  }

  return null
}
