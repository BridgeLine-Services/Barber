import { NextRequest, NextResponse } from 'next/server'
import { demoLogin, createDemoLoginResponse } from '@/lib/demo-auth'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: 'Email and password are required.' },
      { status: 400 }
    )
  }

  const result = await demoLogin(email, password)

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 401 }
    )
  }

  return createDemoLoginResponse(result.session!)
}
