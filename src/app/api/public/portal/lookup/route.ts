import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { resolveBusiness } from '@/lib/tenant'
import { hashValue, normalizeContact, PORTAL_SESSION_COOKIE } from '@/lib/portal-security'

export const dynamic = 'force-dynamic'
const UNAUTHORIZED = 'Please verify your email or phone before accessing your appointments.'

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, 'portal-lookup', RATE_LIMITS.PORTAL_LOOKUP)
  if (limited) return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 })
  try {
    const body = await req.json()
    const contact = normalizeContact(body.email, body.phone)
    if (!contact) return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 })
    const business = await resolveBusiness()
    const sessionToken = req.cookies.get(PORTAL_SESSION_COOKIE)?.value
    const session = sessionToken ? await prisma.portalSession.findFirst({ where: { businessId: business.id, tokenHash: hashValue(sessionToken), revokedAt: null, expiresAt: { gt: new Date() } } }) : null
    if (!session) return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 })
    const customer = await prisma.customer.findFirst({ where: { id: session.customerId, businessId: business.id } })
    if (!customer) return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 })
    const contactMatches = contact.channel === 'EMAIL'
      ? customer.email.toLowerCase() === contact.value
      : customer.phone.replace(/\D/g, '') === contact.value
    if (!contactMatches) return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 })
    const appointments = await prisma.appointment.findMany({ where: { customerId: customer.id, businessId: business.id }, include: { barber: { select: { name: true, photo: true } }, service: { select: { name: true, price: true, duration: true } } }, orderBy: { startTime: 'desc' }, take: 50 })
    const now = new Date()
    const safe = appointments.map((a: any) => ({ confirmationNumber: a.confirmationNumber, customerAccessToken: a.customerAccessToken, status: a.status, startTime: a.startTime.toISOString(), endTime: a.endTime.toISOString(), barber: a.barber, service: a.service }))
    const upcoming = safe.filter((a: any) => new Date(a.startTime) >= now && !['CANCELLED', 'NO_SHOW'].includes(a.status))
    const past = safe.filter((a: any) => new Date(a.startTime) < now || ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(a.status))
    const rewardProgram = await prisma.businessRewardProgram.findFirst({ where: { businessId: business.id, isActive: true } })
    const completedCount = appointments.filter((a: any) => a.status === 'COMPLETED').length
    return NextResponse.json({ customer: { firstName: customer.firstName, lastName: customer.lastName, email: customer.email, phone: customer.phone, smsConsent: customer.smsConsent }, upcoming, past, loyalty: rewardProgram ? { programName: rewardProgram.name, type: rewardProgram.type, visits: completedCount } : null })
  } catch { return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 }) }
}
