import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
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
