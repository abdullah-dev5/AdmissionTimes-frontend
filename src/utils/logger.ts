/**
 * Browser logger. `debug` output appears only in development builds;
 * warnings and errors are always reported. Never log tokens or personal data.
 */

const isDev = import.meta.env.DEV

export const createLogger = (scope: string) => ({
  debug: (message: string, ...details: unknown[]) => {
    if (isDev) console.debug(`[${scope}] ${message}`, ...details)
  },
  warn: (message: string, ...details: unknown[]) => console.warn(`[${scope}] ${message}`, ...details),
  error: (message: string, ...details: unknown[]) => console.error(`[${scope}] ${message}`, ...details),
})
