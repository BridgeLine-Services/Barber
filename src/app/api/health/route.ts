export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.business.count()
    return NextResponse.json({ status: 'healthy' })
  } catch (error) {
    console.error('[health] Database check failed', error)
    return NextResponse.json({ status: 'degraded' }, { status: 503 })
  }
}
