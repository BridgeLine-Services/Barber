import { z } from 'zod'

const appModeSchema = z.enum(['demo', 'production'])

/** Central runtime switch for the reusable template. */
export const appConfig = {
  mode: appModeSchema.catch('demo').parse(process.env.APP_MODE ?? 'demo'),
  isDemo: (process.env.APP_MODE ?? 'demo') === 'demo',
  isProduction: (process.env.APP_MODE ?? 'demo') === 'production',
} as const

export function assertProductionConfiguration() {
  if (!appConfig.isProduction) return
  if (!process.env.DATABASE_URL || !process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_URL) {
    throw new Error('Production configuration is incomplete')
  }
}

export function isProductionMode() {
  return appConfig.isProduction
}

export function isDemoMode() {
  return appConfig.isDemo
}
