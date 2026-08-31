import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashValue, PORTAL_SESSION_COOKIE } from '@/lib/portal-security'

export async function POST(req: NextRequest) {
  const token = req.cookies.get(PORTAL_SESSION_COOKIE)?.value
  if (token) await prisma.portalSession.updateMany({ where: { tokenHash: hashValue(token), revokedAt: null }, data: { revokedAt: new Date() } })
  const response = NextResponse.json({ ok: true })
  response.cookies.set(PORTAL_SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 })
  return response
}
