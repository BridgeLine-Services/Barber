// ============================================================================
// Tenant Resolution — resolves the correct Business for the current request.
//
// Production model (Option A): One deployment per barber shop.
// The business is resolved from NEXT_PUBLIC_SITE_URL env var matching the
// business slug, or falls back to the first business (single-tenant deployment).
//
// Future: Option B/C would use hostname → businessId mapping for multi-tenant.
// ============================================================================

import { prisma } from './prisma'

/**
 * Resolves the business for the current request.
 *
 * Resolution order:
 * 1. NEXT_PUBLIC_SITE_URL matches a business slug
 * 2. Falls back to first business (single-tenant deployment model)
 * 3. Returns null if no business exists
 */
export async function resolveBusiness() {
  // Try to resolve by site URL → slug match
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (siteUrl) {
    // Extract hostname and try to match it against business slugs
    try {
      const hostname = new URL(siteUrl).hostname
      // Try matching the hostname directly or extracting a slug from subdomain
      const bySlug = await prisma.business.findFirst({
        where: { slug: hostname },
      })
      if (bySlug) return bySlug

      // Try subdomain extraction (for future multi-tenant)
      const parts = hostname.split('.')
      if (parts.length > 2) {
        const subdomain = parts[0]
        const bySubdomain = await prisma.business.findFirst({
          where: { slug: subdomain },
        })
        if (bySubdomain) return bySubdomain
      }
    } catch {
      // URL parsing failed — fall through
    }
  }

  // Single-tenant deployment: return the first (and likely only) business
  return prisma.business.findFirst({ orderBy: { createdAt: 'asc' } })
}

/**
 * Resolves the business ID for the current request.
 * Returns the businessId string, or throws if no business is configured.
 */
export async function resolveBusinessId(): Promise<string> {
  const business = await resolveBusiness()
  if (!business) {
    throw new Error('No business configured. Run the seed script or setup wizard.')
  }
  return business.id
}
