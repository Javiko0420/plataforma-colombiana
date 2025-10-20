/**
 * Password Security utilities using bcrypt
 * For use in API routes (Node.js runtime)
 */

import bcrypt from 'bcryptjs'

export class PasswordSecurity {
  /**
   * Hash a password using bcrypt
   * @param password - Plain text password
   * @returns Hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }

    // Get bcrypt rounds from environment or use default of 12
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10)
    
    // Validate saltRounds is a reasonable number
    if (saltRounds < 10 || saltRounds > 15) {
      throw new Error('BCRYPT_ROUNDS must be between 10 and 15')
    }

    try {
      const salt = await bcrypt.genSalt(saltRounds)
      const hashedPassword = await bcrypt.hash(password, salt)
      return hashedPassword
    } catch (error) {
      console.error('Error hashing password:', error)
      throw new Error('Failed to hash password')
    }
  }

  /**
   * Verify a password against its hash
   * @param password - Plain text password
   * @param hash - Hashed password (bcrypt hash)
   * @returns Boolean indicating if password matches
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      return false
    }

    try {
      const isValid = await bcrypt.compare(password, hash)
      return isValid
    } catch (error) {
      console.error('Error verifying password:', error)
      return false
    }
  }

  /**
   * Check password strength
   * @param password - Password to check
   * @returns Object with strength score and feedback
   */
  static checkPasswordStrength(password: string): {
    score: number
    feedback: string[]
    isStrong: boolean
  } {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) score += 1
    else feedback.push('Use at least 8 characters')

    if (password.length >= 12) score += 1
    else feedback.push('Consider using 12+ characters for better security')

    if (/[a-z]/.test(password)) score += 1
    else feedback.push('Include lowercase letters')

    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('Include uppercase letters')

    if (/\d/.test(password)) score += 1
    else feedback.push('Include numbers')

    if (/[@$!%*?&]/.test(password)) score += 1
    else feedback.push('Include special characters (@$!%*?&)')

    return {
      score,
      feedback,
      isStrong: score >= 5
    }
  }

  /**
   * Generate a secure random password
   * @param length - Length of password (default 16)
   * @returns Generated password
   */
  static generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = '@$!%*?&'
    const allChars = lowercase + uppercase + numbers + symbols

    let password = ''
    
    // Ensure at least one of each type
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += symbols[Math.floor(Math.random() * symbols.length)]

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }
}

