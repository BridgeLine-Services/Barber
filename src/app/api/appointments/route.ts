export const dynamic = 'force-dynamic'

/**
 * REMOVED: Public GET /api/appointments
 *
 * This endpoint previously listed all appointments with full customer data
 * to unauthenticated callers — a critical Broken Object Level Authorization
 * (BOLA) vulnerability per OWASP.
 *
 * Customer-facing appointment access is now handled by:
 * - POST /api/public/appointments       (create booking)
 * - GET  /api/public/appointments/[token] (view by secure token)
 * - POST /api/public/appointments/[token]/cancel (cancel by secure token)
 *
 * Staff appointment listing is at:
 * - GET /api/dashboard/appointments (requires auth, role-scoped)
 *
 * This file is kept to prevent 404s from old client code, but all methods
 * return 410 Gone.
 */

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint has been removed. Use /api/public/appointments for booking.' },
    { status: 410 }
  )
}

export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint has been moved. Use POST /api/public/appointments for booking.' },
    { status: 410 }
  )
}
