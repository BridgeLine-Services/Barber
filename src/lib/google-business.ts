// ============================================================================
// Google Business Profile Integration
// Syncs business info, hours, and reviews with Google Business Profile
// Requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and OAuth refresh token
// ============================================================================

import { prisma } from '@/lib/prisma'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GBPConfig {
  connected: boolean
  accountId?: string
  locationId?: string
  lastSyncedAt?: string
}

export interface SyncResult {
  success: boolean
  syncedFields: string[]
  errors: string[]
}

// ─── Sync Functions ─────────────────────────────────────────────────────────

/**
 * Build the Google Business Profile hours JSON from the business's hours field.
 * GBP expects: { periods: [{ openDay, openTime, closeDay, closeTime }], isAlwaysOpen }
 */
function buildGBPHours(businessHours: any): any {
  if (!businessHours) return { periods: [], isAlwaysOpen: false }

  const dayMap: Record<string, string> = {
    monday: 'MONDAY', tuesday: 'TUESDAY', wednesday: 'WEDNESDAY',
    thursday: 'THURSDAY', friday: 'FRIDAY', saturday: 'SATURDAY', sunday: 'SUNDAY',
  }

  const periods: any[] = []
  for (const [day, hours] of Object.entries(businessHours)) {
    const dayName = dayMap[day.toLowerCase()]
    if (!dayName) continue
    const h = hours as any
    if (h.isOff) continue
    if (!h.open || !h.close) continue

    periods.push({
      openDay: dayName,
      openTime: { hours: parseInt(h.open.split(':')[0]), minutes: parseInt(h.open.split(':')[1] || '0') },
      closeDay: dayName,
      closeTime: { hours: parseInt(h.close.split(':')[0]), minutes: parseInt(h.close.split(':')[1] || '0') },
    })
  }

  return { periods, isAlwaysOpen: periods.length === 7 }
}

/**
 * Prepare the business data payload for GBP sync
 */
export async function prepareBusinessSyncPayload(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  })

  if (!business) throw new Error('Business not found')

  return {
    title: business.name,
    websiteUrl: `https://${business.slug}.vercel.app` || null,
    primaryPhone: business.phone || null,
    primaryCategory: { displayName: 'Barber Shop' },
    address: {
      addressLines: [business.address].filter(Boolean),
      locality: business.city || null,
      administrativeArea: business.state || null,
      postalCode: business.zipCode || null,
    },
    regularHours: buildGBPHours(business.hours),
    metadata: {
      timezone: business.timezone,
    },
  }
}

/**
 * Import reviews from Google Business Profile into the Review table.
 * This would be called by an authenticated sync endpoint.
 */
export async function importGoogleReviews(
  businessId: string,
  googleReviews: any[]
): Promise<{ imported: number; skipped: number }> {
  let imported = 0
  let skipped = 0

  for (const gr of googleReviews) {
    // Check if review already exists (by comment hash or authorName + date)
    const existing = await prisma.review.findFirst({
      where: {
        businessId,
        authorName: gr.authorName,
        createdAt: { gte: new Date(gr.createTime) },
      },
    })

    if (existing) {
      skipped++
      continue
    }

    await prisma.review.create({
      data: {
        businessId,
        authorName: gr.authorName,
        rating: gr.starRating === 'FIVE' ? 5 : gr.starRating === 'FOUR' ? 4 : gr.starRating === 'THREE' ? 3 : gr.starRating === 'TWO' ? 2 : 1,
        comment: gr.comment || null,
      },
    })
    imported++
  }

  return { imported, skipped }
}

/**
 * Check if Google Business Profile is configured
 */
export function isGBPConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
  )
}

/**
 * Build the OAuth URL for connecting Google Business Profile
 */
export function getGBPOAuthUrl(businessId: string, redirectUri: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID not configured')

  const scopes = [
    'https://www.googleapis.com/auth/business.manage',
  ].join(' ')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
    state: businessId,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}
