import { NextResponse } from 'next/server'
import { getDemoSession } from '@/lib/demo-auth'

export async function GET() {
  const session = await getDemoSession()

  if (!session) {
    return NextResponse.json({ user: null })
  }

  return NextResponse.json({ user: session.user })
}
