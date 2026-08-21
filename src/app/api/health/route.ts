export const dynamic = 'force-dynamic'

import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDemoSessionFromRequest } from '@/lib/demo-auth'

export async function GET(req: NextRequest) {
  const session = getDemoSessionFromRequest(req)
  const isAdmin = session?.user?.role === 'OWNER'

  if (!isAdmin) {
    try {
      await prisma.business.count()
      return NextResponse.json({ status: 'healthy' }, { status: 200 })
    } catch {
      return NextResponse.json({ status: 'degraded' }, { status: 503 })
    }
  }

  const checks: Record<string, { status: string; message?: string }> = {}
  checks.mode = { status: 'ok', message: 'Demo/template mode — no database required' }

  try {
    const businessCount = await prisma.business.count()
    checks.demoData = {
      status: 'ok',
      message: `Demo mode active. ${businessCount} business(es) loaded.`,
    }
  } catch (error: any) {
    checks.demoData = { status: 'error', message: error.message }
  }

  const allOk = Object.values(checks).every((c) => c.status === 'ok')
  return NextResponse.json(
    { status: allOk ? 'healthy' : 'degraded', checks, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 503 }
  )
}
