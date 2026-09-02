export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  const isOwner = (session?.user as any)?.role === 'OWNER'

  const checks: Record<string, { status: string; message?: string }> = {}
  checks.auth = { status: 'ok', message: session ? 'Authenticated' : 'Anonymous' }

  try {
    const businessCount = await prisma.business.count()
    checks.database = {
      status: 'ok',
      message: `${businessCount} business(es) registered.`,
    }
  } catch (error: any) {
    checks.database = { status: 'error', message: error.message }
  }

  if (isOwner) {
    try {
      const userCount = await prisma.user.count()
      checks.users = { status: 'ok', message: `${userCount} users` }
    } catch (error: any) {
      checks.users = { status: 'error', message: error.message }
    }
  }

  const allOk = Object.values(checks).every((c) => c.status === 'ok')
  return NextResponse.json(
    { status: allOk ? 'healthy' : 'degraded', checks, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 503 }
  )
}
