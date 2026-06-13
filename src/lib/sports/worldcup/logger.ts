// Namespace wrapper over the project's existing console logger.
// All worldcup module logs are prefixed with [worldcup] for easy filtering.
import { logger } from '@/lib/logger'

const NS = '[worldcup]'

export const wcLogger = {
  debug: (msg: string, data?: unknown) => logger.debug(`${NS} ${msg}`, data),
  info: (msg: string, data?: unknown) => logger.info(`${NS} ${msg}`, data),
  warn: (msg: string, data?: unknown) => logger.warn(`${NS} ${msg}`, data),
  error: (msg: string, data?: unknown) => logger.error(`${NS} ${msg}`, data),
}
