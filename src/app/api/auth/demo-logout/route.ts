import { NextResponse } from 'next/server'
import { createDemoLogoutResponse } from '@/lib/demo-auth'

export async function POST() {
  return createDemoLogoutResponse()
}
