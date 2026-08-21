// ============================================================================
// Tenant Resolution — Demo mode.
// Returns the demo business without querying the database.
// When you switch to production, restore the original Prisma-based resolution.
// ============================================================================

import { DEMO_BUSINESS, DEMO_BUSINESS_ID } from './demo-data'

/**
 * Resolves the business for the current request.
 * Demo mode: always returns the demo business.
 */
export async function resolveBusiness() {
  return DEMO_BUSINESS
}

/**
 * Resolves the business ID for the current request.
 */
export async function resolveBusinessId(): Promise<string> {
  return DEMO_BUSINESS_ID
}
