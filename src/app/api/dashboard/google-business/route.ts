import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isGBPConfigured, prepareBusinessSyncPayload, getGBPOAuthUrl } from '@/lib/google-business'

// GET /api/dashboard/google-business — check connection status and get OAuth URL
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = session.user as any
  if (user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const configured = isGBPConfigured()
  const redirectUri = `${new URL(request.url).origin}/api/dashboard/google-business/callback`

  let oauthUrl: string | null = null
  if (configured) {
    try {
      oauthUrl = getGBPOAuthUrl(user.businessId, redirectUri)
    } catch {
      oauthUrl = null
    }
  }

  // Prepare sync payload preview
  let syncPreview: any = null
  try {
    syncPreview = await prepareBusinessSyncPayload(user.businessId)
  } catch {
    syncPreview = null
  }

  return NextResponse.json({
    configured,
    connected: !!process.env.GBP_REFRESH_TOKEN,
    oauthUrl,
    syncPreview,
  })
}

// POST /api/dashboard/google-business — trigger a sync (preview payload)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = session.user as any
  if (user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const payload = await prepareBusinessSyncPayload(user.businessId)
    return NextResponse.json({
      success: true,
      message: 'Sync payload prepared. In production, this would push to Google Business Profile API.',
      payload,
    })
  } catch (error) {
    console.error('GBP sync error:', error)
    return NextResponse.json({ error: 'Failed to prepare sync' }, { status: 500 })
  }
}
