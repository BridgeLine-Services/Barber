export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getRebookingTasks } from '@/lib/rebooking-engine'

// GET /api/dashboard/rebooking/tasks
// Returns all customers due for rebooking
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const businessId = (session.user as any)?.businessId

  const tasks = await getRebookingTasks(businessId)

  return NextResponse.json({
    tasks,
    totalDue: tasks.length,
  })
}
