export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStaff } from '@/lib/auth-helpers'
import { getBusinessIdForUser } from '@/lib/auth-helpers'

/**
 * GET /api/dashboard/notifications
 * Returns notification delivery logs (OWNER and BARBER)
 */
export async function GET(req: NextRequest) {
  const auth = await requireStaff()
  if (!auth.success) return auth.response

  try {
    const businessId = await getBusinessIdForUser(auth.user)
    const searchParams = req.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const status = searchParams.get('status')

    const where: any = { businessId }
    if (status) {
      where.status = status
    }

    const logs = await prisma.notificationLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ logs })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
