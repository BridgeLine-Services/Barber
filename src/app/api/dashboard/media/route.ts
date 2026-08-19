export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/auth-helpers'
import { getClientIP } from '@/lib/rate-limit'
import { AuditAction, MediaType } from '@prisma/client'
import { z } from 'zod'

const createMediaSchema = z.object({
  url: z.string().url(),
  type: z.nativeEnum(MediaType),
  barberId: z.string().optional().nullable(),
  altText: z.string().max(300).optional().nullable(),
  caption: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
})

const updateMediaSchema = z.object({
  id: z.string().min(1),
  altText: z.string().max(300).optional().nullable(),
  caption: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
})

/**
 * GET /api/dashboard/media?type=GALLERY&barberId=xxx
 * OWNER: list all media for business, optionally filtered by type/barber
 * BARBER: list only their own media (barberId forced from session)
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any)?.role
  const businessId = (session.user as any)?.businessId
  const sessionBarberId = (session.user as any)?.barberId
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') as MediaType | null
  const urlBarberId = searchParams.get('barberId')

  const where: any = { businessId }
  if (type) where.type = type
  if (role === 'BARBER') {
    where.barberId = sessionBarberId
  } else if (urlBarberId) {
    where.barberId = urlBarberId
  }

  const media = await prisma.mediaAsset.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json({ media })
}

/**
 * POST /api/dashboard/media
 * Create a new media asset record.
 * OWNER: can create any type of media (shop or barber-specific)
 * BARBER: can only create BARBER_PHOTO or BARBER_PORTFOLIO for themselves
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any)?.role
  const businessId = (session.user as any)?.businessId
  const userId = (session.user as any)?.id
  const sessionBarberId = (session.user as any)?.barberId

  const body = await req.json()
  const parseResult = createMediaSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid media data', details: parseResult.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const data = parseResult.data

  // BARBER role restrictions: can only upload portfolio/photos for themselves
  if (role === 'BARBER') {
    if (!sessionBarberId) return NextResponse.json({ error: 'No barber profile' }, { status: 400 })
    if (data.type !== MediaType.BARBER_PHOTO && data.type !== MediaType.BARBER_PORTFOLIO) {
      return NextResponse.json({ error: 'Barbers can only upload photos for themselves' }, { status: 403 })
    }
    data.barberId = sessionBarberId
  } else {
    // OWNER: if barberId specified, verify barber belongs to this business
    if (data.barberId) {
      const barber = await prisma.barber.findFirst({
        where: { id: data.barberId, businessId },
      })
      if (!barber) return NextResponse.json({ error: 'Barber not found' }, { status: 404 })
    }
  }

  // If type is LOGO or HERO, unpublish previous assets of that type (only one active)
  if (data.type === MediaType.LOGO || data.type === MediaType.HERO || data.type === MediaType.FAVICON || data.type === MediaType.OG_IMAGE) {
    await prisma.mediaAsset.updateMany({
      where: { businessId, type: data.type },
      data: { isPublished: false },
    })
  }

  const media = await prisma.mediaAsset.create({
    data: {
      businessId,
      barberId: data.barberId || null,
      type: data.type,
      url: data.url,
      altText: data.altText || null,
      caption: data.caption || null,
      sortOrder: data.sortOrder,
      isPublished: data.isPublished,
    },
  })

  await logAudit({
    userId,
    businessId,
    action: AuditAction.SETTINGS_UPDATED,
    entityType: 'MediaAsset',
    entityId: media.id,
    newValues: data,
    ipAddress: getClientIP(req),
    userAgent: req.headers.get('user-agent') || undefined,
  })

  return NextResponse.json(media, { status: 201 })
}

/**
 * PATCH /api/dashboard/media
 * Update a media asset (alt text, caption, sort order, published status)
 */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any)?.role
  const businessId = (session.user as any)?.businessId
  const userId = (session.user as any)?.id
  const sessionBarberId = (session.user as any)?.barberId

  const body = await req.json()
  const parseResult = updateMediaSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parseResult.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { id, ...updateData } = parseResult.data

  const media = await prisma.mediaAsset.findUnique({ where: { id } })
  if (!media) return NextResponse.json({ error: 'Media not found' }, { status: 404 })
  if (media.businessId !== businessId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // BARBER can only update their own media
  if (role === 'BARBER' && media.barberId !== sessionBarberId) {
    return NextResponse.json({ error: 'You can only update your own media' }, { status: 403 })
  }

  const updated = await prisma.mediaAsset.update({
    where: { id },
    data: updateData,
  })

  await logAudit({
    userId,
    businessId,
    action: AuditAction.SETTINGS_UPDATED,
    entityType: 'MediaAsset',
    entityId: id,
    oldValues: media,
    newValues: updateData,
    ipAddress: getClientIP(req),
    userAgent: req.headers.get('user-agent') || undefined,
  })

  return NextResponse.json(updated)
}

/**
 * DELETE /api/dashboard/media?id=xxx
 * Delete a media asset.
 * BARBER: can only delete their own media
 * OWNER: can delete any media in their business
 */
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any)?.role
  const businessId = (session.user as any)?.businessId
  const userId = (session.user as any)?.id
  const sessionBarberId = (session.user as any)?.barberId
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const media = await prisma.mediaAsset.findUnique({ where: { id } })
  if (!media) return NextResponse.json({ error: 'Media not found' }, { status: 404 })
  if (media.businessId !== businessId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (role === 'BARBER' && media.barberId !== sessionBarberId) {
    return NextResponse.json({ error: 'You can only delete your own media' }, { status: 403 })
  }

  await prisma.mediaAsset.delete({ where: { id } })

  await logAudit({
    userId,
    businessId,
    action: AuditAction.SETTINGS_UPDATED,
    entityType: 'MediaAsset',
    entityId: id,
    oldValues: media,
    ipAddress: getClientIP(req),
    userAgent: req.headers.get('user-agent') || undefined,
  })

  return NextResponse.json({ success: true })
}
