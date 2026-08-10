/**
 * Rate limiting con Upstash Redis.
 *
 * Un limitador en memoria no sirve en serverless: cada invocación tiene su
 * propio estado, así que el contador se reinicia constantemente. Redis da el
 * estado compartido que hace falta.
 *
 * Credenciales: la integración del Marketplace de Vercel inyecta las variables
 * con prefijo `KV_REST_API_*` (no `UPSTASH_REDIS_REST_*`), por eso se
 * construye el cliente explícitamente en vez de usar `Redis.fromEnv()`.
 *
 * Degradación segura: si Redis no está configurado (p. ej. un dev sin las
 * env vars) los límites se desactivan y se permite la petición. Es preferible
 * a tumbar el login por un problema de infraestructura; en producción las
 * variables siempre están presentes.
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { NextRequest } from 'next/server'
import { logger } from '@/lib/logger'

const url = process.env.KV_REST_API_URL
const token = process.env.KV_REST_API_TOKEN

const redis = url && token ? new Redis({ url, token }) : null

if (!redis && process.env.NODE_ENV === 'production') {
  // No lanzamos: preferimos servir sin límites antes que caerse entera.
  logger.error('Rate limiting deshabilitado: faltan KV_REST_API_URL/TOKEN en producción')
}

/** Crea un limitador de ventana deslizante, o null si no hay Redis. */
function createLimiter(tokens: number, window: Parameters<typeof Ratelimit.slidingWindow>[1], prefix: string) {
  if (!redis) return null
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    prefix,
    analytics: false,
  })
}

/**
 * Límites por caso de uso. Las ventanas son deliberadamente cortas en los
 * flujos de credenciales (frenar credential stuffing sin castigar al usuario
 * que se equivoca un par de veces) y más largas donde el abuso cuesta dinero.
 */
export const limiters = {
  /** Login web y mobile: 5 intentos / 15 min por email+IP. */
  login: createLimiter(5, '15 m', 'rl:login'),
  /** Registro: 3 cuentas / hora por IP. */
  register: createLimiter(3, '1 h', 'rl:register'),
  /** Traducción: consume cuota de DeepL (dinero real). 20 / hora por identidad. */
  translate: createLimiter(20, '1 h', 'rl:translate'),
  /** Creación de contenido (empleos, eventos, posts): 10 / hora por usuario. */
  content: createLimiter(10, '1 h', 'rl:content'),
}

export type LimiterName = keyof typeof limiters

/**
 * IP del cliente. En Vercel, `x-forwarded-for` lo escribe la plataforma y su
 * primer elemento es la IP real del visitante (no es spoofeable desde fuera).
 */
export function getClientIp(request: NextRequest | Request): string {
  const headers = request.headers
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return headers.get('x-real-ip')?.trim() || 'unknown'
}

export interface RateLimitResult {
  /** true = la petición puede continuar. */
  success: boolean
  /** Segundos que debe esperar el cliente (para `Retry-After`). */
  retryAfter: number
  limit: number
  remaining: number
}

/**
 * Consume una unidad del limitador indicado.
 *
 * @param name       limitador a aplicar
 * @param identifier clave de agrupación (email+ip, userId, ip…)
 *
 * Si Redis falla, se permite la petición (fail-open) y se registra el error:
 * una caída de Redis no debe dejar a los usuarios fuera de la plataforma.
 */
export async function checkRateLimit(
  name: LimiterName,
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = limiters[name]
  if (!limiter) {
    return { success: true, retryAfter: 0, limit: 0, remaining: 0 }
  }

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier)
    return {
      success,
      // `reset` es un timestamp en ms; mínimo 1s para no devolver Retry-After: 0.
      retryAfter: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
      limit,
      remaining,
    }
  } catch (error) {
    logger.error('Rate limit check failed; allowing request', { error, limiter: name })
    return { success: true, retryAfter: 0, limit: 0, remaining: 0 }
  }
}

/** Headers estándar para una respuesta 429. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'Retry-After': String(result.retryAfter),
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
  }
}
