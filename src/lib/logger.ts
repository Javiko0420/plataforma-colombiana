import winston from 'winston'

/**
 * Centralized logging system for the application
 * Provides structured logging with different levels and formats
 */

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Define colors for each log level
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

// Add colors to winston
winston.addColors(logColors)

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
)

// Define transports
const transports = [
  // Console transport for development
  new winston.transports.Console({
    format: logFormat,
  }),
  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  // File transport for all logs
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
]

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  transports,
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
})

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
    details?: Record<string, any>
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
    details?: Record<string, any>
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
    body?: any
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
    details?: Record<string, any>
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
      end: (details?: Record<string, any>) => {
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
export { SecurityLogger, AppLogger, ErrorLogger, PerformanceLogger }
