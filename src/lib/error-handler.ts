import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { ErrorLogger } from './logger'

/**
 * Centralized error handling system
 * Provides consistent error responses and logging
 */

// Custom error classes
class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly code?: string

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, true, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, true, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, true, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, true, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true, 'CONFLICT_ERROR')
    this.name = 'ConflictError'
  }
}

class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, true, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
  }
}

// Error response interface
interface ErrorResponse {
  success: false
  error: {
    message: string
    code?: string
    details?: any
    timestamp: string
    requestId?: string
  }
}

// Error handler class
export class ErrorHandler {
  /**
   * Handle and format errors for API responses
   */
  static handleError(error: unknown, context?: {
    userId?: string
    ip?: string
    userAgent?: string
    url?: string
    method?: string
  }): NextResponse<ErrorResponse> {
    let statusCode = 500
    let message = 'Internal server error'
    let code = 'INTERNAL_ERROR'
    let details: any = undefined

    // Handle different error types
    if (error instanceof AppError) {
      statusCode = error.statusCode
      message = error.message
      code = error.code || 'APP_ERROR'
    } else if (error instanceof ZodError) {
      statusCode = 400
      message = 'Validation failed'
      code = 'VALIDATION_ERROR'
      details = this.formatZodError(error)
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = this.handlePrismaError(error)
      statusCode = prismaError.statusCode
      message = prismaError.message
      code = prismaError.code
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      statusCode = 400
      message = 'Invalid data provided'
      code = 'VALIDATION_ERROR'
    } else if (error instanceof Error) {
      message = error.message
      
      // Log unexpected errors
      ErrorLogger.logError(error, context)
    } else {
      // Handle non-Error objects
      message = String(error)
      ErrorLogger.logError(new Error(message), context)
    }

    // Create error response
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        message,
        code,
        details,
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
      }
    }

    // Log error if it's not operational or is server error
    if (!(error instanceof AppError) || !error.isOperational || statusCode >= 500) {
      ErrorLogger.logError(
        error instanceof Error ? error : new Error(String(error)),
        context
      )
    }

    return NextResponse.json(errorResponse, { status: statusCode })
  }

  /**
   * Format Zod validation errors
   */
  private static formatZodError(error: ZodError): any {
    return {
      issues: error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }))
    }
  }

  /**
   * Handle Prisma database errors
   */
  private static handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
    statusCode: number
    message: string
    code: string
  } {
    switch (error.code) {
      case 'P2002':
        return {
          statusCode: 409,
          message: 'A record with this information already exists',
          code: 'DUPLICATE_ERROR'
        }
      case 'P2025':
        return {
          statusCode: 404,
          message: 'Record not found',
          code: 'NOT_FOUND_ERROR'
        }
      case 'P2003':
        return {
          statusCode: 400,
          message: 'Invalid reference to related record',
          code: 'FOREIGN_KEY_ERROR'
        }
      case 'P2014':
        return {
          statusCode: 400,
          message: 'Invalid ID provided',
          code: 'INVALID_ID_ERROR'
        }
      default:
        return {
          statusCode: 500,
          message: 'Database error occurred',
          code: 'DATABASE_ERROR'
        }
    }
  }

  /**
   * Generate unique request ID for tracking
   */
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Async error wrapper for API routes
   */
  static asyncHandler(
    handler: (req: Request, context?: any) => Promise<NextResponse>
  ) {
    return async (req: Request, context?: any): Promise<NextResponse> => {
      try {
        return await handler(req, context)
      } catch (error) {
        return this.handleError(error, {
          url: req.url,
          method: req.method,
        })
      }
    }
  }

  /**
   * Validate request data with Zod schema
   */
  static async validateRequest<T>(
    request: Request,
    schema: any,
    source: 'body' | 'query' | 'params' = 'body'
  ): Promise<T> {
    try {
      let data: any

      switch (source) {
        case 'body':
          const contentType = request.headers.get('content-type') || ''
          if (contentType.includes('application/json')) {
            data = await request.json()
          } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await request.formData()
            data = Object.fromEntries(formData.entries())
          } else {
            throw new ValidationError('Unsupported content type')
          }
          break
        case 'query':
          const url = new URL(request.url)
          data = Object.fromEntries(url.searchParams.entries())
          break
        case 'params':
          // This would be handled by Next.js routing
          data = {}
          break
      }

      return schema.parse(data)
    } catch (error) {
      if (error instanceof ZodError) {
        throw error
      }
      throw new ValidationError('Invalid request data')
    }
  }
}

// Success response helper
function createSuccessResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  )
}

// Global error boundary for React components
export class ErrorBoundary extends Error {
  constructor(
    public readonly originalError: Error,
    public readonly errorInfo: any
  ) {
    super(originalError.message)
    this.name = 'ErrorBoundary'
  }
}

// Client-side error handler
const ClientErrorHandler = {
  /**
   * Handle client-side errors
   */
  handleClientError(error: Error, errorInfo?: any) {
    console.error('Client error:', error, errorInfo)
    
    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service (e.g., Sentry)
      // Sentry.captureException(error, { extra: errorInfo })
    }
  },

  /**
   * Handle API call errors
   */
  handleApiError(response: Response, data?: any) {
    const error = new Error(
      data?.error?.message || `API Error: ${response.status} ${response.statusText}`
    )
    
    console.error('API error:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      data
    })
    
    return error
  },

  /**
   * Show user-friendly error messages
   */
  getUserFriendlyMessage(error: Error): string {
    // Map technical errors to user-friendly messages
    const errorMessages: Record<string, string> = {
      'VALIDATION_ERROR': 'Por favor, verifica los datos ingresados',
      'AUTHENTICATION_ERROR': 'Debes iniciar sesión para continuar',
      'AUTHORIZATION_ERROR': 'No tienes permisos para realizar esta acción',
      'NOT_FOUND_ERROR': 'El recurso solicitado no fue encontrado',
      'DUPLICATE_ERROR': 'Ya existe un registro con esta información',
      'RATE_LIMIT_ERROR': 'Has realizado demasiadas solicitudes. Intenta más tarde',
      'NETWORK_ERROR': 'Error de conexión. Verifica tu internet',
    }

    // Try to extract error code from message or use default
    const errorCode = Object.keys(errorMessages).find(code => 
      error.message.includes(code)
    )

    return errorCode ? errorMessages[errorCode] : 'Ocurrió un error inesperado'
  }
}

// Export all error classes and handlers
export default ErrorHandler
export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  createSuccessResponse,
  ClientErrorHandler
}
