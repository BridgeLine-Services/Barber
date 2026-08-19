export const dynamic = 'force-dynamic'

import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  // Check if the requester is an authenticated admin
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isAdmin = token?.role === 'OWNER'

  // ── Public response: minimal status only ──
  // Don't expose environment variables, database details, counts, or errors
  if (!isAdmin) {
    try {
      // Quick DB ping — if it fails, we still return 503 but with no details
      await prisma.business.count()
      return NextResponse.json({ status: 'healthy' }, { status: 200 })
    } catch {
      return NextResponse.json({ status: 'degraded' }, { status: 503 })
    }
  }

  // ── Admin response: full diagnostic details ──
  const checks: Record<string, { status: string; message?: string }> = {}

  // Check environment variables
  const envVars = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    SMTP_HOST: !!process.env.SMTP_HOST,
    SMTP_PORT: !!process.env.SMTP_PORT,
    SMTP_USER: !!process.env.SMTP_USER,
    SMTP_PASS: !!process.env.SMTP_PASS,
    SMTP_FROM: !!process.env.SMTP_FROM,
  }

  checks.environment = {
    status: Object.values(envVars).every(Boolean) ? 'ok' : 'missing',
    message: Object.entries(envVars)
      .filter(([, v]) => !v)
      .map(([k]) => k)
      .join(', ') + ' not set',
  }

  // Check database connection
  if (!process.env.DATABASE_URL) {
    checks.database = { status: 'error', message: 'DATABASE_URL is not set' }
  } else {
    try {
      const businessCount = await prisma.business.count()
      checks.database = {
        status: 'ok',
        message: `Connected. ${businessCount} business(es) found.`,
      }
    } catch (error: any) {
      checks.database = {
        status: 'error',
        message: error.message || 'Failed to connect to database',
      }
    }
  }

  // Check if database is seeded
  if (checks.database.status === 'ok') {
    try {
      const [businessCount, barberCount, serviceCount, userCount] = await Promise.all([
        prisma.business.count(),
        prisma.barber.count(),
        prisma.service.count(),
        prisma.user.count(),
      ])
      checks.seeding = {
        status: businessCount > 0 && userCount > 0 ? 'ok' : 'not_seeded',
        message: `Businesses: ${businessCount}, Barbers: ${barberCount}, Services: ${serviceCount}, Users: ${userCount}`,
      }
    } catch (error: any) {
      checks.seeding = {
        status: 'error',
        message: error.message || 'Failed to check seeding',
      }
    }
  }

  const allOk = Object.values(checks).every((c) => c.status === 'ok')
  const httpStatus = allOk ? 200 : 503

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: httpStatus }
  )
}
