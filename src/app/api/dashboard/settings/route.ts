export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOwner } from '@/lib/auth-helpers'
import { getBusinessIdForUser, logAudit } from '@/lib/auth-helpers'
import { updateBusinessSchema } from '@/lib/validation'
import { getClientIP } from '@/lib/rate-limit'

/**
 * GET /api/dashboard/settings
 * Returns the business settings (OWNER only)
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
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/dashboard/settings
 * Update business settings (OWNER only)
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireOwner()
  if (!auth.success) return auth.response

  try {
    const businessId = await getBusinessIdForUser(auth.user)

    const body = await req.json()
    const parseResult = updateBusinessSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid settings data', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Capture old values for audit
    const oldBusiness = await prisma.business.findUnique({ where: { id: businessId } })

    const updated = await prisma.business.update({
      where: { id: businessId },
      data: parseResult.data,
    })

    await logAudit({
      userId: auth.user.id,
      businessId,
      action: 'BRANDING_UPDATED',
      entityType: 'Business',
      entityId: businessId,
      oldValues: oldBusiness,
      newValues: parseResult.data,
      ipAddress: getClientIP(req),
      userAgent: req.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({ business: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
