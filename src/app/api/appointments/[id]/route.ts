export const dynamic = 'force-dynamic'

/**
 * REMOVED: Public PATCH /api/appointments/[id]
 *
 * Previously allowed unauthenticated appointment modification by internal
 * database ID — a critical BOLA vulnerability per OWASP.
 *
 * Customer actions now use secure access tokens:
 * - GET  /api/public/appointments/[token]       (view)
 * - POST /api/public/appointments/[token]/cancel  (cancel)
 *
 * Staff actions use authenticated dashboard routes:
 * - PATCH /api/dashboard/appointments/[id] (requires auth + role check)
 */

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint has been removed. Use /api/public/appointments/[token] or /api/dashboard/appointments/[id].' },
    { status: 410 }
  )
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'This endpoint has been removed. Use /api/public/appointments/[token]/cancel or /api/dashboard/appointments/[id].' },
    { status: 410 }
  )
}
