export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const setupSchema = z.object({
  businessName: z.string().min(2).max(100),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(50),
  zipCode: z.string().min(3).max(20),
  timezone: z.string().default('America/New_York'),
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(8, 'Password must be at least 8 characters'),
  ownerName: z.string().min(2).max(100),
})

/**
 * GET /api/setup
 * Returns whether initial setup has been completed (i.e., any business exists).
 */
export async function GET() {
  try {
    const businessCount = await prisma.business.count()
    const userCount = await prisma.user.count()
    return NextResponse.json({
      needsSetup: businessCount === 0 || userCount === 0,
      hasBusiness: businessCount > 0,
      hasUsers: userCount > 0,
    })
  } catch (error: any) {
    // If DB isn't connected yet, report that setup can't run
    return NextResponse.json({
      needsSetup: true,
      hasBusiness: false,
      hasUsers: false,
      dbError: 'Database not connected. Create a Postgres database in Vercel Storage first.',
    }, { status: 503 })
  }
}

/**
 * POST /api/setup
 * Creates the initial business + owner account. Only works if no business exists yet.
 * This is the "first-run" endpoint — once a business is created, this route refuses.
 */
export async function POST(req: NextRequest) {
  try {
    // Guard: refuse if a business already exists
    const existing = await prisma.business.count()
    if (existing > 0) {
      return NextResponse.json(
        { error: 'Setup already completed. A business exists. Use the dashboard to manage settings.' },
        { status: 409 }
      )
    }

    const body = await req.json()
    const parsed = setupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const d = parsed.data
    const passwordHash = await bcrypt.hash(d.ownerPassword, 10)

    // Create business + owner user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
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
          aboutText: `Welcome to ${d.businessName}! Update this text in Dashboard > Settings to tell customers about your shop.`,
          bookingPolicy: 'Appointments can be booked online up to 30 days in advance. No deposit required. Payment is collected in person after your service.',
          cancellationPolicy: 'Cancellations or modifications must be made at least 2 hours in advance of your scheduled slot.',
        },
      })

      const owner = await tx.user.create({
        data: {
          email: d.ownerEmail,
          name: d.ownerName,
          passwordHash,
          role: 'OWNER',
          businessId: business.id,
        },
      })

      return { business, owner }
    })

    return NextResponse.json({
      success: true,
      business: { id: result.business.id, name: result.business.name, slug: result.business.slug },
      owner: { id: result.owner.id, email: result.owner.email, name: result.owner.name },
      message: 'Setup complete! You can now log in at /login with your owner email and password.',
    }, { status: 201 })

  } catch (error: any) {
    console.error('Setup error:', error)

    // Handle Prisma connection errors specifically
    if (error.message?.includes('database') || error.message?.includes('connect') || error.message?.includes('P1001')) {
      return NextResponse.json(
        { error: 'Database not connected. Create a Postgres database in Vercel Storage first, then redeploy.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Setup failed', detail: error.message },
      { status: 500 }
    )
  }
}
