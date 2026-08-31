import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { resolveBusiness } from '@/lib/tenant'
import { createToken, hashValue, normalizeContact, PORTAL_MAX_ATTEMPTS, PORTAL_SESSION_COOKIE, PORTAL_SESSION_TTL_MS } from '@/lib/portal-security'

export const dynamic = 'force-dynamic'
const INVALID = 'The verification code is invalid or expired. Please request a new code.'

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, 'portal-verification-attempt', RATE_LIMITS.PORTAL_LOOKUP)
  if (limited) return NextResponse.json({ error: INVALID }, { status: 429 })
  try {
    const body = await req.json()
    const contact = normalizeContact(body.email, body.phone)
    const code = typeof body.code === 'string' ? body.code.trim() : ''
    if (!contact || !/^\d{6}$/.test(code)) return NextResponse.json({ error: INVALID }, { status: 400 })
    const business = await resolveBusiness()
    const challenge = await prisma.portalVerificationChallenge.findFirst({ where: { businessId: business.id, contactHash: hashValue(contact.value), channel: contact.channel, consumedAt: null, expiresAt: { gt: new Date() }, attempts: { lt: PORTAL_MAX_ATTEMPTS } }, orderBy: { createdAt: 'desc' } })
    if (!challenge || hashValue(code) !== challenge.codeHash) {
      if (challenge) await prisma.portalVerificationChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } })
      return NextResponse.json({ error: INVALID }, { status: 400 })
    }
    const customer = await prisma.customer.findFirst({ where: { businessId: business.id, ...(contact.channel === 'EMAIL' ? { email: contact.value } : { phone: body.phone.trim() }) } })
    if (!customer) return NextResponse.json({ error: INVALID }, { status: 400 })
    await prisma.portalVerificationChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } })
    const token = createToken()
    await prisma.portalSession.create({ data: { businessId: business.id, customerId: customer.id, tokenHash: hashValue(token), expiresAt: new Date(Date.now() + PORTAL_SESSION_TTL_MS) } })
    const response = NextResponse.json({ message: 'Verified' })
    response.cookies.set(PORTAL_SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: PORTAL_SESSION_TTL_MS / 1000 })
    return response
  } catch { return NextResponse.json({ error: INVALID }, { status: 400 }) }
}
