import { randomBytes } from 'crypto'
import { PrismaClient, UserRole, AppointmentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ============================================================================
// Template Seed Script
// Creates a minimal starter dataset for a new barber shop.
// All values are driven by environment variables with generic defaults.
//
// Environment variables (optional — all have sensible defaults):
//   SEED_BUSINESS_NAME   — Shop display name (default: "Your Barber Shop")
//   SEED_BUSINESS_EMAIL  — Contact email (default: "info@yourbarbershop.com")
//   SEED_BUSINESS_PHONE  — Phone number (default: "(555) 555-0100")
//   SEED_BUSINESS_CITY   — City (default: "Your City")
//   SEED_BUSINESS_STATE  — State (default: "ST")
//   SEED_BUSINESS_SLUG   — URL slug (default: "your-barber-shop")
//   SEED_OWNER_EMAIL     — Owner login email (default: "owner@yourbarbershop.com")
//   SEED_OWNER_PASSWORD  — Owner password (default: auto-generated, printed below)
//   SEED_TIMEZONE        — Business timezone (default: "America/New_York")
//
// Usage:
//   npm run db:seed
//   SEED_BUSINESS_NAME="Mike's Cuts" SEED_OWNER_EMAIL="mike@mikescuts.com" npm run db:seed
// ============================================================================

async function main() {
  const businessName = process.env.SEED_BUSINESS_NAME || 'Your Barber Shop'
  const businessEmail = process.env.SEED_BUSINESS_EMAIL || `info@${(businessName || 'yourbarbershop').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
  const businessPhone = process.env.SEED_BUSINESS_PHONE || '(555) 555-0100'
  const businessCity = process.env.SEED_BUSINESS_CITY || 'Your City'
  const businessState = process.env.SEED_BUSINESS_STATE || 'ST'
  const businessSlug = process.env.SEED_BUSINESS_SLUG || businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')
  const ownerEmail = process.env.SEED_OWNER_EMAIL || `owner@${(businessName || 'yourbarbershop').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
  const timezone = process.env.SEED_TIMEZONE || 'America/New_York'
  const ownerPassword = process.env.SEED_OWNER_PASSWORD || randomBytes(12).toString('base64url').slice(0, 16)

  console.log(`🌱 Starting database seed for ${businessName}...`)

  // Clean existing data in correct deletion order
  await prisma.review.deleteMany()
  await prisma.blockedTime.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.barberService.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.service.deleteMany()
  await prisma.user.deleteMany()
  await prisma.barber.deleteMany()
  await prisma.business.deleteMany()

  console.log('🧹 Cleaned existing database records.')

  // Hash password for all default users
  const passwordHash = await bcrypt.hash(ownerPassword, 10)

  // 1. Create Business
  const business = await prisma.business.create({
    data: {
      name: businessName,
      slug: businessSlug,
      logo: null, // Upload your logo in Dashboard > Settings
      primaryColor: '#121212',
      accentColor: '#d4af37',
      phone: businessPhone,
      email: businessEmail,
      address: '123 Main Street',
      city: businessCity,
      state: businessState,
      zipCode: '00000',
      timezone,
      hours: {
        monday: { open: '09:00', close: '18:00', isOff: false },
        tuesday: { open: '09:00', close: '18:00', isOff: false },
        wednesday: { open: '09:00', close: '18:00', isOff: false },
        thursday: { open: '09:00', close: '18:00', isOff: false },
        friday: { open: '09:00', close: '18:00', isOff: false },
        saturday: { open: '09:00', close: '16:00', isOff: false },
        sunday: { open: '10:00', close: '15:00', isOff: true },
      },
      aboutText: `Welcome to ${businessName}! Update this text in Dashboard > Settings to tell customers about your shop, your style, and what makes you special.`,
      bookingPolicy: 'Appointments can be booked online up to 30 days in advance. No deposit required. Payment is collected in person after your service.',
      cancellationPolicy: 'Cancellations or modifications must be made at least 2 hours in advance of your scheduled slot.',
    },
  })

  // 1b. Create Business SEO record
  await prisma.businessSEO.create({
    data: {
      businessId: business.id,
      siteTitle: businessName,
      siteDescription: `Book your appointment online at ${businessName}. Professional barbering services in ${businessCity}.`,
      robotsIndex: true,
      robotsFollow: true,
    },
  })

  console.log(`💈 Created Business: ${business.name} (ID: ${business.id})`)

  // 2. Create Owner User
  const owner = await prisma.user.create({
    data: {
      email: ownerEmail,
      passwordHash,
      name: `${businessName} Owner`,
      role: UserRole.OWNER,
      businessId: business.id,
    },
  })

  console.log(`👑 Created Owner User: ${owner.email}`)

  // 3. Create Barbers (generic placeholder names — customize in Dashboard)
  const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const barberData = [
    {
      name: 'Barber One',
      slug: 'barber-one',
      specialty: 'Fades • Tapers • Beard Work',
      bio: 'Master barber. Update this bio in the Dashboard.',
      order: 1,
    },
    {
      name: 'Barber Two',
      slug: 'barber-two',
      specialty: 'Classic Cuts • Hot Towel Shaves',
      bio: 'Skilled stylist. Update this bio in the Dashboard.',
      order: 2,
    },
    {
      name: 'Barber Three',
      slug: 'barber-three',
      specialty: 'Modern Styles • Kids Cuts',
      bio: 'Creative barber. Update this bio in the Dashboard.',
      order: 3,
    },
  ]

  const barbers = []
  for (const b of barberData) {
    const barber = await prisma.barber.create({
      data: {
        businessId: business.id,
        name: b.name,
        slug: b.slug,
        specialty: b.specialty,
        bio: b.bio,
        photo: null, // Upload barber photos in Dashboard > Staff
        order: b.order,
      },
    })

    // Create corresponding Barber User (same generated password)
    await prisma.user.create({
      data: {
        email: `barber${b.order}@${businessEmail.split('@')[1]}`,
        passwordHash,
        name: b.name,
        role: UserRole.BARBER,
        businessId: business.id,
        barberId: barber.id,
      },
    })

    barbers.push(barber)

    // Setup Weekly Schedules (0=Sun, 1=Mon, ..., 6=Sat)
    for (let day = 0; day <= 6; day++) {
      const isSunday = day === 0
      const isSaturday = day === 6
      await prisma.schedule.create({
        data: {
          barberId: barber.id,
          dayOfWeek: day,
          startTime: isSunday ? '10:00' : '09:00',
          endTime: isSunday ? '15:00' : isSaturday ? '16:00' : '18:00',
          isOff: isSunday,
          breaks: isSunday ? [] : [{ start: '12:00', end: '13:00' }],
        },
      })
    }
  }

  console.log(`✂️ Created ${barbers.length} Barbers & Schedules.`)

  // 4. Create Services (generic — customize pricing/names in Dashboard)
  const servicesData = [
    { name: 'Haircut', description: 'Precision haircut including consultation and styling.', duration: 30, price: 35.0, order: 1 },
    { name: 'Haircut + Beard', description: 'Full haircut combined with beard trim and shaping.', duration: 45, price: 50.0, order: 2 },
    { name: 'Beard Trim', description: 'Beard sculpting with razor edge-up and hot towel.', duration: 20, price: 25.0, order: 3 },
    { name: 'Kids Haircut', description: 'Quality haircut for children 12 and under.', duration: 30, price: 30.0, order: 4 },
    { name: 'Premium Cut', description: 'Full service with scalp massage, haircut, and premium styling.', duration: 60, price: 65.0, order: 5 },
  ]

  const services = []
  for (const s of servicesData) {
    const service = await prisma.service.create({
      data: {
        businessId: business.id,
        name: s.name,
        description: s.description,
        duration: s.duration,
        price: s.price,
        order: s.order,
      },
    })
    services.push(service)

    // Assign service to all barbers
    for (const barber of barbers) {
      await prisma.barberService.create({
        data: { barberId: barber.id, serviceId: service.id },
      })
    }
  }

  console.log(`💈 Created ${services.length} Services and assigned to barbers.`)

  // 5. Create a few sample customers (optional — remove in production)
  const customersData = [
    { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '(555) 234-5678', notes: '', smsConsent: true },
    { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '(555) 345-6789', notes: '', smsConsent: false },
  ]

  const customers = []
  for (const c of customersData) {
    const customer = await prisma.customer.create({
      data: {
        businessId: business.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        notes: c.notes,
        smsConsent: c.smsConsent,
      },
    })
    customers.push(customer)
  }

  console.log(`👥 Created ${customers.length} Sample Customers.`)

  // 6. Create a few sample appointments (relative to today)
  const now = new Date()
  const buildDate = (dayOffset: number, hour: number, minute: number = 0) => {
    const d = new Date(now)
    d.setDate(d.getDate() + dayOffset)
    d.setHours(hour, minute, 0, 0)
    return d
  }

  const appointmentData = [
    { customerIdx: 0, barberIdx: 0, serviceIdx: 0, start: buildDate(1, 10, 0), status: AppointmentStatus.CONFIRMED },
    { customerIdx: 1, barberIdx: 1, serviceIdx: 1, start: buildDate(1, 11, 0), status: AppointmentStatus.CONFIRMED },
    { customerIdx: 0, barberIdx: 2, serviceIdx: 2, start: buildDate(2, 14, 0), status: AppointmentStatus.PENDING },
  ]

  for (const a of appointmentData) {
    const service = services[a.serviceIdx]
    const endTime = new Date(a.start.getTime() + service.duration * 60000)

    await prisma.appointment.create({
      data: {
        businessId: business.id,
        barberId: barbers[a.barberIdx].id,
        customerId: customers[a.customerIdx].id,
        serviceId: service.id,
        startTime: a.start,
        endTime,
        status: a.status,
        confirmationNumber: `BRB-${randomBytes(3).toString('hex').toUpperCase()}`,
        customerAccessToken: randomBytes(32).toString('hex'),
      },
    })
  }

  console.log(`📅 Created ${appointmentData.length} Sample Appointments.`)

  // 7. Create sample reviews (generic — replace with real Google reviews)
  const reviewData = [
    { authorName: 'Happy Client', rating: 5, comment: 'Great experience! Easy online booking and excellent service.', isFeatured: true },
    { authorName: 'Satisfied Customer', rating: 5, comment: 'Best haircut I have had in years. Highly recommend!', isFeatured: true },
    { authorName: 'Local Resident', rating: 5, comment: 'Clean shop, friendly staff, and quality work. Will be back.', isFeatured: false },
  ]

  for (const r of reviewData) {
    await prisma.review.create({
      data: {
        businessId: business.id,
        authorName: r.authorName,
        rating: r.rating,
        comment: r.comment,
        isFeatured: r.isFeatured,
        isGoogleReview: false,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    })
  }

  console.log(`⭐ Created ${reviewData.length} Sample Reviews.`)

  console.log('\n' + '='.repeat(60))
  console.log('✅ Seed complete!')
  console.log('='.repeat(60))
  console.log(`   Business: ${businessName}`)
  console.log(`   Owner:    ${ownerEmail}`)
  console.log(`   Password:  ${ownerPassword}`)
  console.log(`   Barbers:   barber1@${businessEmail.split('@')[1]} / barber2@${businessEmail.split('@')[1]} / barber3@${businessEmail.split('@')[1]}`)
  console.log(`   (Barber passwords are the same as the owner password)`)
  console.log('')
  console.log('⚠️  Change the owner password immediately after first login!')
  console.log('='.repeat(60))
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
