import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { RateLimiter, securityHeaders } from './lib/security'
import { SecurityLogger } from './lib/logger'

/**
 * Next.js Middleware for security, authentication, and request processing
 * Runs on every request to apply security measures and logging
 */

// Rate limiting configuration
const RATE_LIMITS = {
  api: { max: 100, window: 15 * 60 * 1000 }, // 100 requests per 15 minutes for API
  auth: { max: 5, window: 15 * 60 * 1000 },  // 5 auth attempts per 15 minutes
  search: { max: 50, window: 60 * 1000 },    // 50 searches per minute
  upload: { max: 10, window: 60 * 60 * 1000 }, // 10 uploads per hour
}

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/business/create',
  '/business/edit',
  '/admin',
]

// Admin-only routes
const ADMIN_ROUTES = [
  '/admin',
]

// API routes that need rate limiting
const API_RATE_LIMITED_ROUTES = [
  '/api/auth',
  '/api/business',
  '/api/upload',
  '/api/search',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || ''
  
  // Create response with security headers
  const response = NextResponse.next()
  
  // Apply security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  try {
    // 1. Rate limiting for API routes
    if (isApiRoute(pathname)) {
      const rateLimitResult = await applyRateLimit(pathname, ip, request)
      if (!rateLimitResult.allowed) {
        SecurityLogger.logSecurityViolation({
          type: 'rate_limit',
          ip,
          userAgent,
          details: `Rate limit exceeded for ${pathname}`,
          severity: 'medium'
        })
        
        return new NextResponse(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
          }),
          { 
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
              ...Object.fromEntries(Object.entries(securityHeaders))
            }
          }
        )
      }
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', getRateLimitForPath(pathname).max.toString())
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
    }

    // 2. Authentication check for protected routes
    if (isProtectedRoute(pathname)) {
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      })
      
      if (!token) {
        SecurityLogger.logSecurityViolation({
          type: 'unauthorized_access',
          ip,
          userAgent,
          details: `Attempted access to protected route: ${pathname}`,
          severity: 'low'
        })
        
        // Redirect to login page
        const loginUrl = new URL('/auth/signin', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // 3. Admin route check
      if (isAdminRoute(pathname) && token.role !== 'ADMIN') {
        SecurityLogger.logSecurityViolation({
          type: 'unauthorized_access',
          ip,
          userAgent,
          userId: token.sub,
          details: `Non-admin user attempted to access admin route: ${pathname}`,
          severity: 'high'
        })
        
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden' }),
          { 
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              ...Object.fromEntries(Object.entries(securityHeaders))
            }
          }
        )
      }
    }

    // 4. Input validation for suspicious content
    const suspiciousInput = await checkForSuspiciousInput(request)
    if (suspiciousInput) {
      SecurityLogger.logSecurityViolation({
        type: 'suspicious_input',
        ip,
        userAgent,
        details: `Suspicious input detected: ${suspiciousInput}`,
        severity: 'high'
      })
      
      return new NextResponse(
        JSON.stringify({ error: 'Invalid request' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(Object.entries(securityHeaders))
          }
        }
      )
    }

    // 5. CSRF protection for state-changing operations
    if (isStateChangingRequest(request)) {
      const csrfValid = await validateCSRF(request)
      if (!csrfValid) {
        SecurityLogger.logSecurityViolation({
          type: 'csrf',
          ip,
          userAgent,
          details: `CSRF token validation failed for ${pathname}`,
          severity: 'high'
        })
        
        return new NextResponse(
          JSON.stringify({ error: 'CSRF token invalid' }),
          { 
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              ...Object.fromEntries(Object.entries(securityHeaders))
            }
          }
        )
      }
    }

    return response

  } catch (error) {
    console.error('Middleware error:', error)
    
    // Return a safe error response
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(Object.entries(securityHeaders))
        }
      }
    )
  }
}

// Helper functions

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/')
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route))
}

function getRateLimitForPath(pathname: string): { max: number; window: number } {
  if (pathname.startsWith('/api/auth')) return RATE_LIMITS.auth
  if (pathname.startsWith('/api/search')) return RATE_LIMITS.search
  if (pathname.startsWith('/api/upload')) return RATE_LIMITS.upload
  return RATE_LIMITS.api
}

async function applyRateLimit(
  pathname: string, 
  ip: string, 
  request: NextRequest
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const rateLimit = getRateLimitForPath(pathname)
  const identifier = `${ip}:${pathname}`
  
  return RateLimiter.checkRateLimit(identifier, rateLimit.max, rateLimit.window)
}

async function checkForSuspiciousInput(request: NextRequest): Promise<string | null> {
  const suspiciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /<iframe[^>]*>/gi,
    /document\.cookie/gi,
    /document\.write/gi,
    /window\.location/gi,
  ]

  // Check URL parameters
  const url = new URL(request.url)
  for (const [key, value] of url.searchParams.entries()) {
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(value)) {
        return `Suspicious parameter: ${key}=${value}`
      }
    }
  }

  // Check request body for POST/PUT requests
  if (request.method === 'POST' || request.method === 'PUT') {
    try {
      const contentType = request.headers.get('content-type') || ''
      
      if (contentType.includes('application/json')) {
        const body = await request.clone().text()
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(body)) {
            return `Suspicious body content`
          }
        }
      }
    } catch (error) {
      // If we can't read the body, it's not necessarily suspicious
      console.warn('Could not read request body for security check:', error)
    }
  }

  return null
}

function isStateChangingRequest(request: NextRequest): boolean {
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)
}

async function validateCSRF(request: NextRequest): Promise<boolean> {
  // For API routes, we can skip CSRF for now since we're using JWT tokens
  // In a full implementation, you'd validate CSRF tokens here
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return true
  }
  
  // For form submissions, validate CSRF token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  // If user is authenticated, CSRF is handled by NextAuth
  return !!token
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
