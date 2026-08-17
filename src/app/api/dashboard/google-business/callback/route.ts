// ============================================================================
// Google Business Profile — OAuth Callback
// Handles the OAuth redirect from Google, exchanges the auth code for
// access + refresh tokens, and stores them as env secrets.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state') // businessId
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/settings?gbp_error=${encodeURIComponent(error)}`, req.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard/settings?gbp_error=no_code', req.url)
    )
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = `${new URL(req.url).origin}/api/dashboard/google-business/callback`

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/dashboard/settings?gbp_error=not_configured', req.url)
    )
  }

  try {
    // Exchange auth code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    })

    const tokens = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('GBP token exchange error:', tokens)
      return NextResponse.redirect(
        new URL(`/dashboard/settings?gbp_error=${encodeURIComponent(tokens.error || 'token_exchange_failed')}`, req.url)
      )
    }

    // Store tokens — in production, write to database or secrets manager.
    // For now, we return them to the dashboard where the user can set them
    // in their environment variables.
    const accessToken = tokens.access_token
    const refreshToken = tokens.refresh_token

    // List GBP accounts to find the right one
    const accountsResponse = await fetch(
      'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
    const accountsData = await accountsResponse.json()

    const accounts = accountsData.accounts || []
    const accountNames = accounts.map((a: any) => ({
      name: a.name,
      displayName: a.accountName || a.name,
      type: a.type,
    }))

    // Redirect to settings with token info (encoded for the frontend to display)
    const params = new URLSearchParams({
      gbp_connected: 'true',
      gbp_access_token: accessToken,
      ...(refreshToken ? { gbp_refresh_token: refreshToken } : {}),
      gbp_accounts: JSON.stringify(accountNames),
    })

    return NextResponse.redirect(
      new URL(`/dashboard/settings?${params.toString()}`, req.url)
    )
  } catch (error: any) {
    console.error('GBP callback error:', error)
    return NextResponse.redirect(
      new URL(`/dashboard/settings?gbp_error=${encodeURIComponent(error.message || 'callback_failed')}`, req.url)
    )
  }
}
