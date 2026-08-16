export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendCampaign } from '@/lib/marketing'

// POST /api/dashboard/marketing/campaigns/[id]/send
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const businessId = (session.user as any)?.businessId
  const userRole = (session.user as any)?.role

  if (userRole !== 'OWNER') {
    return NextResponse.json({ error: 'Only owners can send campaigns' }, { status: 403 })
  }

  try {
    const result = await sendCampaign(businessId, params.id)
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to send campaign' }, { status: 400 })
  }
}
