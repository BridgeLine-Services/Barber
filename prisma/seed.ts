import { randomBytes } from 'crypto'
import { PrismaClient, UserRole, AppointmentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed for Fade Factory...')

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
  const passwordHash = await bcrypt.hash('password123', 10)

  // 1. Create Business
  const business = await prisma.business.create({
    data: {
      name: 'Fade Factory',
      slug: 'fade-factory',
      logo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&h=300&fit=crop&auto=format',
      primaryColor: '#121212',
      accentColor: '#d4af37',
      phone: '(555) 123-4567',
      email: 'info@fadefactory.com',
      address: '123 Main Street, Suite 100',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90012',
      latitude: 34.0522,
      longitude: -118.2437,
      instagram: '@fadefactory',
      facebook: 'fadefactorybarber',
      tiktok: '@fadefactory',
      hours: {
        monday: { open: '09:00', close: '18:00', isOff: false },
        tuesday: { open: '09:00', close: '18:00', isOff: false },
        wednesday: { open: '09:00', close: '18:00', isOff: false },
        thursday: { open: '09:00', close: '18:00', isOff: false },
        friday: { open: '09:00', close: '18:00', isOff: false },
        saturday: { open: '09:00', close: '16:00', isOff: false },
        sunday: { open: '10:00', close: '15:00', isOff: true },
      },
      aboutText:
        'Fade Factory is a premier barbershop located in heart of Los Angeles. Specializing in precision fades, classic tapers, beard sculpting, and luxury grooming treatments.',
      bookingPolicy:
        'Appointments can be booked online up to 30 days in advance. No deposit required. Payment is collected in person after your cut.',
      cancellationPolicy:
        'Cancellations or modifications must be made at least 2 hours in advance of your scheduled slot.',
    },
  })

  console.log(`💈 Created Business: ${business.name} (ID: ${business.id})`)

  // 2. Create Owner User
  const owner = await prisma.user.create({
    data: {
      email: 'owner@fadefactory.com',
      passwordHash,
      name: 'Fade Factory Owner',
      role: UserRole.OWNER,
      businessId: business.id,
    },
  })

  console.log(`👑 Created Owner User: ${owner.email}`)

  // 3. Create Barbers
  const barberData = [
    {
      name: 'Marcus Vance',
      email: 'marcus@fadefactory.com',
      specialty: 'Fades • Tapers • Beard Work',
      bio: 'Master barber with over 10 years experience specializing in precision skin fades, sharp line-ups, and custom beard shaping.',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
      order: 1,
    },
    {
      name: 'Derrick Reed',
      email: 'derrick@fadefactory.com',
      specialty: 'Fades • Locs • Haircuts',
      bio: 'Stylist turned barber with expertise in modern texturized cuts, loc maintenance, burst fades, and intricate hair designs.',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      order: 2,
    },
    {
      name: 'Jay Miller',
      email: 'jay@fadefactory.com',
      specialty: 'Classic Cuts • Beard Styling',
      bio: 'Traditional barbershop craft meets contemporary style. Expert in hot towel razor shaves, classic scissor cuts, and beard treatments.',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      order: 3,
    },
  ]

  const barbers = []
  for (const b of barberData) {
    const barber = await prisma.barber.create({
      data: {
        businessId: business.id,
        name: b.name,
        specialty: b.specialty,
        bio: b.bio,
        photo: b.photo,
        order: b.order,
      },
    })

    // Create corresponding Barber User
    await prisma.user.create({
      data: {
        email: b.email,
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

  // 4. Create Services
  const servicesData = [
    {
      name: 'Haircut',
      description: 'Precision haircut including shampoo, hot towel neck shave, and clean style finish.',
      duration: 30,
      price: 35.0,
      order: 1,
    },
    {
      name: 'Haircut + Beard',
      description: 'Full haircut service combined with complete beard trim, shaping, razor lineup, and beard oil application.',
      duration: 45,
      price: 50.0,
      order: 2,
    },
    {
      name: 'Beard Trim',
      description: 'Beard sculpting, length reduction, straight razor edge-up, and hot towel treatment.',
      duration: 20,
      price: 25.0,
      order: 3,
    },
    {
      name: 'Kids Haircut',
      description: 'Quality haircut for children aged 12 and under. Patient, precise service with styled finish.',
      duration: 30,
      price: 30.0,
      order: 4,
    },
    {
      name: 'Premium Cut',
      description: 'Ultimate pampering cut with scalp massage, facial hot towel treatment, haircut, beard trim, and premium styling product.',
      duration: 60,
      price: 65.0,
      order: 5,
    },
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
        data: {
          barberId: barber.id,
          serviceId: service.id,
        },
      })
    }
  }

  console.log(`💈 Created ${services.length} Services and assigned to barbers.`)

  // 5. Create Sample Customers
  const customersData = [
    { firstName: 'Alex', lastName: 'Johnson', email: 'alex.johnson@example.com', phone: '(555) 234-5678', notes: 'Prefers skin fade with mid-taper', smsConsent: true },
    { firstName: 'Michael', lastName: 'Smith', email: 'michael.smith@example.com', phone: '(555) 345-6789', notes: 'Beard sensitive to razor burn', smsConsent: true },
    { firstName: 'David', lastName: 'Brown', email: 'david.brown@example.com', phone: '(555) 456-7890', notes: 'Regular customer every 2 weeks', smsConsent: false },
    { firstName: 'Chris', lastName: 'Wilson', email: 'chris.wilson@example.com', phone: '(555) 567-8901', notes: 'Brings kid for Sunday cuts', smsConsent: true },
    { firstName: 'James', lastName: 'Davis', email: 'james.davis@example.com', phone: '(555) 678-9012', notes: 'Likes natural line up', smsConsent: true },
    { firstName: 'Robert', lastName: 'Taylor', email: 'robert.taylor@example.com', phone: '(555) 789-0123', notes: 'Prefers scissors on top', smsConsent: false },
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

  console.log(`👥 Created ${customers.length} Customers.`)

  // 6. Create Sample Appointments
  const now = new Date()
  
  const buildDate = (dayOffset: number, hour: number, minute: number = 0) => {
    const d = new Date(now)
    d.setDate(d.getDate() + dayOffset)
    d.setHours(hour, minute, 0, 0)
    return d
  }

  const appointmentData = [
    // Today appointments
    {
      confirmationNumber: 'BRB-901A',
      customerIdx: 0,
      barberIdx: 0,
      serviceIdx: 1, // Haircut + Beard (45m)
      start: buildDate(0, 10, 0),
      status: AppointmentStatus.CONFIRMED,
      customerNotes: 'Looking forward to the cut!',
    },
    {
      confirmationNumber: 'BRB-902B',
      customerIdx: 1,
      barberIdx: 1,
      serviceIdx: 0, // Haircut (30m)
      start: buildDate(0, 11, 0),
      status: AppointmentStatus.CONFIRMED,
      customerNotes: null,
    },
    {
      confirmationNumber: 'BRB-903C',
      customerIdx: 2,
      barberIdx: 2,
      serviceIdx: 2, // Beard Trim (20m)
      start: buildDate(0, 14, 0),
      status: AppointmentStatus.PENDING,
      customerNotes: 'Please clean up cheek lines',
    },
    // Future / Upcoming appointments
    {
      confirmationNumber: 'BRB-904D',
      customerIdx: 3,
      barberIdx: 0,
      serviceIdx: 3, // Kids Haircut (30m)
      start: buildDate(1, 10, 30),
      status: AppointmentStatus.CONFIRMED,
      customerNotes: 'For my 8yo son',
    },
    {
      confirmationNumber: 'BRB-905E',
      customerIdx: 4,
      barberIdx: 1,
      serviceIdx: 4, // Premium Cut (60m)
      start: buildDate(2, 15, 0),
      status: AppointmentStatus.CONFIRMED,
      customerNotes: 'Getting ready for a wedding',
    },
    {
      confirmationNumber: 'BRB-906F',
      customerIdx: 5,
      barberIdx: 2,
      serviceIdx: 0, // Haircut
      start: buildDate(3, 11, 30),
      status: AppointmentStatus.PENDING,
      customerNotes: null,
    },
    // Past appointments
    {
      confirmationNumber: 'BRB-801X',
      customerIdx: 0,
      barberIdx: 0,
      serviceIdx: 0, // Haircut
      start: buildDate(-3, 10, 0),
      status: AppointmentStatus.COMPLETED,
      customerNotes: null,
    },
    {
      confirmationNumber: 'BRB-802Y',
      customerIdx: 1,
      barberIdx: 1,
      serviceIdx: 1, // Haircut + Beard
      start: buildDate(-2, 14, 0),
      status: AppointmentStatus.COMPLETED,
      customerNotes: null,
    },
    {
      confirmationNumber: 'BRB-803Z',
      customerIdx: 2,
      barberIdx: 2,
      serviceIdx: 0, // Haircut
      start: buildDate(-1, 16, 0),
      status: AppointmentStatus.CANCELLED,
      cancellationReason: 'Work conflict',
    },
    {
      confirmationNumber: 'BRB-804W',
      customerIdx: 3,
      barberIdx: 0,
      serviceIdx: 2, // Beard Trim
      start: buildDate(-4, 13, 0),
      status: AppointmentStatus.NO_SHOW,
      customerNotes: null,
    },
  ]

  for (const appt of appointmentData) {
    const service = services[appt.serviceIdx]
    const endTime = new Date(appt.start.getTime() + service.duration * 60 * 1000)

    await prisma.appointment.create({
      data: {
        confirmationNumber: appt.confirmationNumber,
        customerAccessToken: randomBytes(32).toString('hex'),
        businessId: business.id,
        customerId: customers[appt.customerIdx].id,
        barberId: barbers[appt.barberIdx].id,
        serviceId: service.id,
        startTime: appt.start,
        endTime: endTime,
        status: appt.status,
        customerNotes: appt.customerNotes,
        cancellationReason: appt.cancellationReason || null,
        createdBy: 'ONLINE',
      },
    })
  }

  console.log(`📅 Created ${appointmentData.length} Sample Appointments.`)

  // 7. Create Blocked Times
  await prisma.blockedTime.create({
    data: {
      businessId: business.id,
      barberId: barbers[0].id,
      startTime: buildDate(5, 9, 0),
      endTime: buildDate(5, 18, 0),
      reason: 'Personal Vacation Day',
    },
  })

  await prisma.blockedTime.create({
    data: {
      businessId: business.id,
      barberId: null, // Shop-wide
      startTime: buildDate(14, 9, 0),
      endTime: buildDate(14, 18, 0),
      reason: 'Shop Renovations & Maintenance',
    },
  })

  console.log('🚫 Created Blocked Times.')

  // 8. Create Reviews
  const reviewsData = [
    { authorName: 'Carlos M.', rating: 5, comment: 'Marcus gave me the cleanest fade I have ever had in LA. Sharp line-up and great atmosphere!', isFeatured: true },
    { authorName: 'Jonathan K.', rating: 5, comment: 'Derrick is an absolute master with locs and razor work. Atmosphere is top notch, dark aesthetic is super clean.', isFeatured: true },
    { authorName: 'Sam R.', rating: 5, comment: 'Jay did a classic scissor cut and beard trim. Hot towel treatment was incredible! Highly recommend.', isFeatured: true },
    { authorName: 'Brandon T.', rating: 4, comment: 'Great service and very punctual. No waiting around like other shops.', isFeatured: true },
    { authorName: 'Ethan L.', rating: 5, comment: 'Fade Factory is the real deal. Easy online booking, quick check-in, premium results every time.', isFeatured: true },
    { authorName: 'Gregory P.', rating: 4, comment: 'Solid barbers and super convenient pay-in-person policy.', isFeatured: false },
    { authorName: 'Trevor B.', rating: 5, comment: 'Brought my son here for his kid cut. Marcus was super patient and made him look fresh!', isFeatured: false },
  ]

  for (const rev of reviewsData) {
    await prisma.review.create({
      data: {
        businessId: business.id,
        authorName: rev.authorName,
        rating: rev.rating,
        comment: rev.comment,
        isFeatured: rev.isFeatured,
      },
    })
  }

  console.log(`⭐ Created ${reviewsData.length} Sample Reviews.`)

  console.log('🎉 Seed completed successfully!')
  console.log('--------------------------------------------------')
  console.log('🔑 Default Login Credentials:')
  console.log('   Owner:  owner@fadefactory.com / password123')
  console.log('   Barber: marcus@fadefactory.com / password123')
  console.log('   Barber: derrick@fadefactory.com / password123')
  console.log('   Barber: jay@fadefactory.com / password123')
  console.log('--------------------------------------------------')
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
