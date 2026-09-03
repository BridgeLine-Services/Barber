export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDemoSession } from '@/lib/demo-auth'
import { getRebookingTasks } from '@/lib/rebooking-engine'

// GET /api/dashboard/rebooking/tasks
// Returns all customers due for rebooking
export async function GET() {
  const session = await getDemoSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const businessId = (session.user as any)?.businessId

  const tasks = await getRebookingTasks(businessId)

  return NextResponse.json({
    tasks,
    totalDue: tasks.length,
  })
}
