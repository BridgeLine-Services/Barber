import { z } from 'zod'

const appModeSchema = z.enum(['production'])

/** Runtime configuration — production only. Demo mode has been removed. */
export const appConfig = {
  mode: appModeSchema.parse(process.env.APP_MODE ?? 'production'),
  isDemo: false,
  isProduction: true,
} as const

export function assertProductionConfiguration() {
  if (!process.env.DATABASE_URL || !process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_URL) {
    throw new Error('Production configuration is incomplete — set DATABASE_URL, NEXTAUTH_SECRET, and NEXTAUTH_URL')
  }
}

export function isProductionMode() {
  return true
}

export function isDemoMode() {
  return false
}
