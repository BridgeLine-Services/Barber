export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getDemoSession } from '@/lib/demo-auth'
import { sendCampaign } from '@/lib/marketing'

// POST /api/dashboard/marketing/campaigns/[id]/send
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getDemoSession()
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
