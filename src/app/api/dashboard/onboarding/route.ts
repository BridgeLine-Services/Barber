export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { completeOnboarding } from '@/lib/onboarding'

const onboardingSchema = z.object({
  businessName: z.string().min(2).max(100),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(50),
  zipCode: z.string().min(3).max(20),
  timezone: z.string().default('America/New_York'),
})

/**
 * POST /api/dashboard/onboarding
 * Creates a business for the authenticated owner and links it to their account.
 * Only works if the owner doesn't already have a business linked.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = session.user as any

  // Only owners can create a business
  if (user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Only owners can set up a shop' }, { status: 403 })
  }

  // If already has a business, refuse
  if (user.businessId) {
    return NextResponse.json({ error: 'Your shop is already set up' }, { status: 409 })
  }

  try {
    const body = await req.json()
    const parsed = onboardingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const d = parsed.data

    // Check slug uniqueness
    const existingSlug = await prisma.business.findUnique({ where: { slug: d.slug } })
    if (existingSlug) {
      return NextResponse.json({ error: 'That URL slug is already taken' }, { status: 409 })
    }

    // Create business + link to existing owner user
    const business = await prisma.business.create({
      data: {
        name: d.businessName,
        slug: d.slug,
        phone: d.phone,
        email: d.email,
        address: d.address,
        city: d.city,
        state: d.state,
        zipCode: d.zipCode,
        timezone: d.timezone,
        primaryColor: '#121212',
        accentColor: '#d4af37',
        hours: {
          monday: { open: '09:00', close: '18:00', isOff: false },
          tuesday: { open: '09:00', close: '18:00', isOff: false },
          wednesday: { open: '09:00', close: '18:00', isOff: false },
          thursday: { open: '09:00', close: '18:00', isOff: false },
          friday: { open: '09:00', close: '18:00', isOff: false },
          saturday: { open: '09:00', close: '16:00', isOff: false },
          sunday: { open: '10:00', close: '15:00', isOff: true },
        },
        aboutText: `Welcome to ${d.businessName}! Update this text in Settings to tell customers about your shop.`,
        bookingPolicy: 'Appointments can be booked online up to 30 days in advance. No deposit required. Payment is collected in person after your service.',
        cancellationPolicy: 'Cancellations or modifications must be made at least 2 hours in advance of your scheduled slot.',
        users: {
          connect: { id: user.id },
        },
      },
    })

    // Persist onboarding completion so the dashboard access gate opens.
    await completeOnboarding(business.id)

    return NextResponse.json({
      success: true,
      business: { id: business.id, name: business.name, slug: business.slug },
      message: 'Shop created! Redirecting to dashboard...',
    }, { status: 201 })

  } catch (error: any) {
    console.error('Onboarding error:', error)

    if (error.message?.includes('database') || error.message?.includes('connect') || error.code === 'P1001') {
      return NextResponse.json(
        { error: 'Database not connected. Set DATABASE_URL in your Vercel environment variables.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Setup failed', detail: error.message },
      { status: 500 }
    )
  }
}
