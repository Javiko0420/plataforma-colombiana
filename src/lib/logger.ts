/**
 * Centralized logging system for the application
 * Edge Runtime compatible version - uses console for logging
 */

// Simple logger for Edge Runtime compatibility
const logger = {
  debug: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data || '')
    }
  },
  info: (message: string, data?: unknown) => {
    console.info(`[INFO] ${message}`, data || '')
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${message}`, data || '')
  },
  error: (message: string, data?: unknown) => {
    console.error(`[ERROR] ${message}`, data || '')
  },
  http: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[HTTP] ${message}`, data || '')
    }
  }
}

// Security event logger
class SecurityLogger {
  /**
   * Log authentication events
   */
  static logAuthEvent(event: {
    type: 'login' | 'logout' | 'register' | 'failed_login' | 'password_reset'
    userId?: string
    email?: string
    ip?: string
    userAgent?: string
    success: boolean
    reason?: string
  }) {
    const logData = {
      event: 'AUTH_EVENT',
      type: event.type,
      userId: event.userId,
      email: event.email?.replace(/(.{2}).*(@.*)/, '$1***$2'), // Partially mask email
      ip: event.ip,
      userAgent: event.userAgent,
      success: event.success,
      reason: event.reason,
      timestamp: new Date().toISOString(),
    }

    if (event.success) {
      logger.info('Authentication event', logData)
    } else {
      logger.warn('Failed authentication event', logData)
    }
  }

  /**
   * Log security violations
   */
  static logSecurityViolation(violation: {
    type: 'rate_limit' | 'suspicious_input' | 'unauthorized_access' | 'csrf' | 'xss_attempt'
    ip?: string
    userAgent?: string
    userId?: string
    details?: string
    severity: 'low' | 'medium' | 'high' | 'critical'
  }) {
    const logData = {
      event: 'SECURITY_VIOLATION',
      type: violation.type,
      ip: violation.ip,
      userAgent: violation.userAgent,
      userId: violation.userId,
      details: violation.details,
      severity: violation.severity,
      timestamp: new Date().toISOString(),
    }

    if (violation.severity === 'critical' || violation.severity === 'high') {
      logger.error('Security violation detected', logData)
    } else {
      logger.warn('Security violation detected', logData)
    }
  }

  /**
   * Log data access events
   */
  static logDataAccess(access: {
    type: 'read' | 'write' | 'delete' | 'export'
    resource: string
    userId?: string
    ip?: string
    success: boolean
    reason?: string
  }) {
    const logData = {
      event: 'DATA_ACCESS',
      type: access.type,
      resource: access.resource,
      userId: access.userId,
      ip: access.ip,
      success: access.success,
      reason: access.reason,
      timestamp: new Date().toISOString(),
    }

    logger.info('Data access event', logData)
  }
}

// Application event logger
class AppLogger {
  /**
   * Log API requests
   */
  static logApiRequest(request: {
    method: string
    url: string
    statusCode: number
    responseTime: number
    ip?: string
    userAgent?: string
    userId?: string
  }) {
    const logData = {
      event: 'API_REQUEST',
      method: request.method,
      url: request.url,
      statusCode: request.statusCode,
      responseTime: request.responseTime,
      ip: request.ip,
      userAgent: request.userAgent,
      userId: request.userId,
      timestamp: new Date().toISOString(),
    }

    if (request.statusCode >= 400) {
      logger.warn('API request with error', logData)
    } else {
      logger.http('API request', logData)
    }
  }

  /**
   * Log business events
   */
  static logBusinessEvent(event: {
    type: 'business_created' | 'business_updated' | 'business_deleted' | 'product_added' | 'forum_post_created'
    userId?: string
    resourceId?: string
    details?: Record<string, unknown>
  }) {
    const logData = {
      event: 'BUSINESS_EVENT',
      type: event.type,
      userId: event.userId,
      resourceId: event.resourceId,
      details: event.details,
      timestamp: new Date().toISOString(),
    }

    logger.info('Business event', logData)
  }

  /**
   * Log system events
   */
  static logSystemEvent(event: {
    type: 'startup' | 'shutdown' | 'database_connection' | 'external_api_call' | 'email_sent'
    details?: Record<string, unknown>
    success: boolean
    error?: string
  }) {
    const logData = {
      event: 'SYSTEM_EVENT',
      type: event.type,
      details: event.details,
      success: event.success,
      error: event.error,
      timestamp: new Date().toISOString(),
    }

    if (event.success) {
      logger.info('System event', logData)
    } else {
      logger.error('System event failed', logData)
    }
  }
}

// Error logger with context
class ErrorLogger {
  /**
   * Log application errors with context
   */
  static logError(error: Error, context?: {
    userId?: string
    ip?: string
    userAgent?: string
    url?: string
    method?: string
    body?: unknown
  }) {
    const logData = {
      event: 'APPLICATION_ERROR',
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      timestamp: new Date().toISOString(),
    }

    logger.error('Application error', logData)
  }

  /**
   * Log database errors
   */
  static logDatabaseError(error: Error, operation: string, query?: string) {
    const logData = {
      event: 'DATABASE_ERROR',
      message: error.message,
      operation,
      query: query?.substring(0, 200), // Limit query length in logs
      timestamp: new Date().toISOString(),
    }

    logger.error('Database error', logData)
  }

  /**
   * Log external API errors
   */
  static logExternalApiError(error: Error, apiName: string, endpoint: string) {
    const logData = {
      event: 'EXTERNAL_API_ERROR',
      message: error.message,
      apiName,
      endpoint,
      timestamp: new Date().toISOString(),
    }

    logger.error('External API error', logData)
  }
}

// Performance logger
class PerformanceLogger {
  /**
   * Log performance metrics
   */
  static logPerformance(metric: {
    operation: string
    duration: number
    memoryUsage?: NodeJS.MemoryUsage
    details?: Record<string, unknown>
  }) {
    const logData = {
      event: 'PERFORMANCE_METRIC',
      operation: metric.operation,
      duration: metric.duration,
      memoryUsage: metric.memoryUsage,
      details: metric.details,
      timestamp: new Date().toISOString(),
    }

    if (metric.duration > 5000) { // Log slow operations (>5s)
      logger.warn('Slow operation detected', logData)
    } else {
      logger.debug('Performance metric', logData)
    }
  }

  /**
   * Create a performance timer (Edge Runtime compatible)
   */
  static createTimer(operation: string) {
    const startTime = Date.now()

    return {
      end: (details?: Record<string, unknown>) => {
        const duration = Date.now() - startTime
        
        this.logPerformance({
          operation,
          duration,
          memoryUsage: undefined, // Not available in Edge Runtime
          details,
        })
      }
    }
  }
}

// Export the main logger instance
export default logger
export { logger, SecurityLogger, AppLogger, ErrorLogger, PerformanceLogger }
