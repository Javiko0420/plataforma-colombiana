import bcrypt from 'bcryptjs'
import sanitizeHtml from 'sanitize-html'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

/**
 * Security utilities for the application
 * Includes password hashing, input sanitization, and security headers
 */

// Password security
export class PasswordSecurity {
  private static readonly SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12')

  /**
   * Hash a password using bcrypt
   * @param password - Plain text password
   * @returns Hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }
    return bcrypt.hash(password, this.SALT_ROUNDS)
  }

  /**
   * Verify a password against its hash
   * @param password - Plain text password
   * @param hash - Hashed password
   * @returns Boolean indicating if password matches
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      return false
    }
    return bcrypt.compare(password, hash)
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
}

// Input sanitization
export class InputSanitizer {
  /**
   * Sanitize HTML content to prevent XSS attacks
   * @param html - HTML content to sanitize
   * @returns Sanitized HTML
   */
  static sanitizeHtml(html: string): string {
    return sanitizeHtml(html, {
      allowedTags: [
        'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'
      ],
      allowedAttributes: {},
      allowedSchemes: ['http', 'https', 'mailto'],
      disallowedTagsMode: 'discard',
      allowedSchemesByTag: {},
      allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
      allowProtocolRelative: false,
    })
  }

  /**
   * Sanitize text content (remove all HTML)
   * @param text - Text to sanitize
   * @returns Plain text without HTML
   */
  static sanitizeText(text: string): string {
    if (typeof window !== 'undefined') {
      // Client-side
      return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
    } else {
      // Server-side
      const window = new JSDOM('').window
      const purify = DOMPurify(window)
      return purify.sanitize(text, { ALLOWED_TAGS: [] })
    }
  }

  /**
   * Escape special characters for SQL-like queries
   * @param input - Input to escape
   * @returns Escaped input
   */
  static escapeSpecialChars(input: string): string {
    return input
      .replace(/'/g, "''")
      .replace(/"/g, '""')
      .replace(/\\/g, '\\\\')
      .replace(/%/g, '\\%')
      .replace(/_/g, '\\_')
  }

  /**
   * Remove potentially dangerous characters from filenames
   * @param filename - Original filename
   * @returns Safe filename
   */
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase()
  }
}

// Rate limiting utilities
export class RateLimiter {
  private static attempts = new Map<string, { count: number; resetTime: number }>()

  /**
   * Check if an IP/user has exceeded rate limits
   * @param identifier - IP address or user ID
   * @param maxAttempts - Maximum attempts allowed
   * @param windowMs - Time window in milliseconds
   * @returns Boolean indicating if request should be allowed
   */
  static checkRateLimit(
    identifier: string,
    maxAttempts: number = 100,
    windowMs: number = 15 * 60 * 1000 // 15 minutes
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const record = this.attempts.get(identifier)

    if (!record || now > record.resetTime) {
      // First attempt or window expired
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      })
      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetTime: now + windowMs
      }
    }

    if (record.count >= maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime
      }
    }

    // Increment count
    record.count++
    this.attempts.set(identifier, record)

    return {
      allowed: true,
      remaining: maxAttempts - record.count,
      resetTime: record.resetTime
    }
  }

  /**
   * Reset rate limit for an identifier
   * @param identifier - IP address or user ID
   */
  static resetRateLimit(identifier: string): void {
    this.attempts.delete(identifier)
  }
}

// Security headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https:",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
}

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
}

// Utility functions for security checks
export const SecurityUtils = {
  /**
   * Check if a string contains potentially malicious content
   * @param input - Input to check
   * @returns Boolean indicating if input is suspicious
   */
  isSuspiciousInput(input: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i,
      /vbscript:/i,
      /data:text\/html/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /document\.cookie/i,
      /document\.write/i,
      /window\.location/i
    ]

    return suspiciousPatterns.some(pattern => pattern.test(input))
  },

  /**
   * Generate a secure random token
   * @param length - Length of the token
   * @returns Random token string
   */
  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },

  /**
   * Validate and sanitize email address
   * @param email - Email to validate
   * @returns Sanitized email or null if invalid
   */
  sanitizeEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const sanitized = email.trim().toLowerCase()
    
    if (!emailRegex.test(sanitized) || sanitized.length > 255) {
      return null
    }
    
    return sanitized
  }
}
