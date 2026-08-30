export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOwner } from '@/lib/auth-helpers'
import { getBusinessIdForUser, logAudit } from '@/lib/auth-helpers'
import { updateBusinessSchema } from '@/lib/validation'
import { getClientIP } from '@/lib/rate-limit'

/**
 * GET /api/dashboard/settings
 * Returns the business settings + SEO (OWNER only)
 */
export async function GET(req: NextRequest) {
  const auth = await requireOwner()
  if (!auth.success) return auth.response

  try {
    const businessId = await getBusinessIdForUser(auth.user)
    const [business, seo] = await Promise.all([
      prisma.business.findUnique({ where: { id: businessId } }),
      prisma.businessSEO.findUnique({ where: { businessId } }),
    ])

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json({ business, seo })
  } catch (error: any) {
    console.error('[settings] request failed', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

/**
 * PATCH /api/dashboard/settings
 * Update business settings + SEO (OWNER only)
 *
 * Body: {
 *   ...businessFields,
 *   seo?: { siteTitle, siteDescription, keywords, ogTitle, ogDescription, ogImage, canonicalUrl, robotsIndex, robotsFollow, googleVerification }
 * }
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireOwner()
  if (!auth.success) return auth.response

  try {
    const businessId = await getBusinessIdForUser(auth.user)

    const body = await req.json()

    // Extract SEO fields — they go to a separate table
    const { seo, ...businessFields } = body

    // Validate business fields
    const parseResult = updateBusinessSchema.safeParse(businessFields)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid settings data', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Capture old values for audit
    const oldBusiness = await prisma.business.findUnique({ where: { id: businessId } })
    const oldSeo = await prisma.businessSEO.findUnique({ where: { businessId } })

    // Update business
    const updated = await prisma.business.update({
      where: { id: businessId },
      data: parseResult.data,
    })

    // Update SEO if provided
    let updatedSeo = null
    if (seo && typeof seo === 'object') {
      const seoData: any = {}
      const allowedSeoFields = [
        'siteTitle', 'siteDescription', 'keywords', 'ogTitle', 'ogDescription',
        'ogImage', 'canonicalUrl', 'robotsIndex', 'robotsFollow', 'googleVerification'
      ]
      for (const field of allowedSeoFields) {
        if (field in seo) seoData[field] = seo[field]
      }

      if (Object.keys(seoData).length > 0) {
        updatedSeo = await prisma.businessSEO.upsert({
          where: { businessId },
          create: { businessId, ...seoData },
          update: seoData,
        })
      }
    }

    await logAudit({
      userId: auth.user.id,
      businessId,
      action: 'SETTINGS_UPDATED',
      entityType: 'Business',
      entityId: businessId,
      oldValues: { business: oldBusiness, seo: oldSeo },
      newValues: { business: parseResult.data, seo: seo || null },
      ipAddress: getClientIP(req),
      userAgent: req.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({ business: updated, seo: updatedSeo })
  } catch (error: any) {
    console.error('[settings] request failed', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
