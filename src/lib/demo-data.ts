// ============================================================================
// DEMO / TEMPLATE DATA
// ============================================================================
// This file contains ALL the generic, editable demo data for the template.
// Change shop name, barbers, services, hours, credentials, etc. here.
// When you switch to production mode, this file is no longer used —
// real data comes from Prisma/PostgreSQL instead.
// ============================================================================

// ─── Demo Staff Credentials ──────────────────────────────────────────────
// Edit these to change who can log in during demo mode.
// Format: { email, password, role, name, barberId }

export interface DemoUser {
  id: string
  email: string
  password: string
  name: string
  role: 'OWNER' | 'BARBER'
  barberId?: string
  businessId: string
}

export const DEMO_BUSINESS_ID = 'demo-business-001'

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'demo-user-owner',
    email: 'owner@barbershop.demo',
    password: 'OwnerDemo123!',
    name: 'Shop Owner',
    role: 'OWNER',
    businessId: DEMO_BUSINESS_ID,
  },
  {
    id: 'demo-user-barber-1',
    email: 'barber1@barbershop.demo',
    password: 'BarberOne123!',
    name: 'Marcus Reed',
    role: 'BARBER',
    barberId: 'demo-barber-1',
    businessId: DEMO_BUSINESS_ID,
  },
  {
    id: 'demo-user-barber-2',
    email: 'barber2@barbershop.demo',
    password: 'BarberTwo123!',
    name: 'Diego Santos',
    role: 'BARBER',
    barberId: 'demo-barber-2',
    businessId: DEMO_BUSINESS_ID,
  },
  {
    id: 'demo-user-barber-3',
    email: 'barber3@barbershop.demo',
    password: 'BarberThree123!',
    name: 'Tyler Jackson',
    role: 'BARBER',
    barberId: 'demo-barber-3',
    businessId: DEMO_BUSINESS_ID,
  },
]

// ─── Demo Business ────────────────────────────────────────────────────────

export const DEMO_BUSINESS = {
  id: DEMO_BUSINESS_ID,
  name: 'The Classic Cut',
  slug: 'the-classic-cut',
  phone: '(555) 123-4567',
  email: 'info@theclassiccut.com',
  address: '123 Main Street',
  city: 'Springfield',
  state: 'CA',
  zipCode: '90210',
  timezone: 'America/Los_Angeles',
  aboutText: 'Experience top-tier craftsmanship at The Classic Cut. From classic razor fades to precision beard styling, walk out looking and feeling sharp.',
  logo: null,
  primaryColor: '#f59e0b',
  accentColor: '#f59e0b',
  themeMode: 'dark',
  bookingPolicy: 'Please arrive 10 minutes before your appointment. Cancellations must be made at least 2 hours in advance.',
  cancellationPolicy: 'Late cancellations (less than 2 hours) may be subject to a fee.',
  teamSectionLabel: 'Our Team',
  teamSectionTitle: 'Meet the Barbers at The Classic Cut',
  teamSectionDescription: 'Each member of our team brings years of experience, attention to detail, and passion for precision cuts and classic grooming.',
  hours: {
    monday:    { isOff: false, open: '09:00', close: '19:00' },
    tuesday:   { isOff: false, open: '09:00', close: '19:00' },
    wednesday: { isOff: false, open: '09:00', close: '19:00' },
    thursday:  { isOff: false, open: '09:00', close: '19:00' },
    friday:    { isOff: false, open: '09:00', close: '20:00' },
    saturday:  { isOff: false, open: '09:00', close: '18:00' },
    sunday:    { isOff: true,  open: '10:00', close: '16:00' },
  },
  instagram: 'https://instagram.com/theclassiccut',
  facebook: 'https://facebook.com/theclassiccut',
  twitter: null,
  tiktok: null,
  website: null,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
}

// ─── Demo Barbers ──────────────────────────────────────────────────────────

export interface DemoBarber {
  id: string
  businessId: string
  name: string
  slug: string
  bio: string
  specialty: string
  photo: string | null
  isActive: boolean
  order: number
  instagram: string | null
  rating: number
  reviewCount: number
  createdAt: Date
  updatedAt: Date
}

export const DEMO_BARBERS: DemoBarber[] = [
  {
    id: 'demo-barber-1',
    businessId: DEMO_BUSINESS_ID,
    name: 'Marcus Reed',
    slug: 'marcus-reed',
    bio: 'Master barber with over 12 years of experience specializing in classic fades, tapers, and straight razor shaves. Marcus brings old-school precision to every cut.',
    specialty: 'Classic Fades & Straight Razor',
    photo: null,
    isActive: true,
    order: 1,
    instagram: '@marcus_cuts',
    rating: 4.9,
    reviewCount: 127,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'demo-barber-2',
    businessId: DEMO_BUSINESS_ID,
    name: 'Diego Santos',
    slug: 'diego-santos',
    bio: 'Diego blends modern styling techniques with traditional barbering. Known for his skin fades, beard sculpting, and attention to detail.',
    specialty: 'Skin Fades & Beard Sculpting',
    photo: null,
    isActive: true,
    order: 2,
    instagram: '@diego.barber',
    rating: 4.8,
    reviewCount: 98,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'demo-barber-3',
    businessId: DEMO_BUSINESS_ID,
    name: 'Tyler Jackson',
    slug: 'tyler-jackson',
    bio: 'Tyler specializes in textured cuts, curly hair, and modern styles. His creative approach makes every visit a fresh experience.',
    specialty: 'Textured Cuts & Modern Styles',
    photo: null,
    isActive: true,
    order: 3,
    instagram: '@tylerfreshcuts',
    rating: 4.7,
    reviewCount: 76,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
]

// ─── Demo Services ──────────────────────────────────────────────────────────

export interface DemoService {
  id: string
  businessId: string
  name: string
  description: string
  duration: number // minutes
  price: number
  isActive: boolean
  order: number
  category: string
  createdAt: Date
  updatedAt: Date
}

export const DEMO_SERVICES: DemoService[] = [
  {
    id: 'demo-service-1',
    businessId: DEMO_BUSINESS_ID,
    name: 'Classic Haircut',
    description: 'Precision haircut tailored to your style. Includes consultation, cut, and styling.',
    duration: 30,
    price: 35,
    isActive: true,
    order: 1,
    category: 'Haircuts',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'demo-service-2',
    businessId: DEMO_BUSINESS_ID,
    name: 'Skin Fade',
    description: 'Sharp, clean fade blended to perfection. Choose from low, mid, or high fade.',
    duration: 40,
    price: 45,
    isActive: true,
    order: 2,
    category: 'Haircuts',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'demo-service-3',
    businessId: DEMO_BUSINESS_ID,
    name: 'Beard Trim & Shape',
    description: 'Professional beard grooming with straight razor detailing and hot towel finish.',
    duration: 20,
    price: 25,
    isActive: true,
    order: 3,
    category: 'Beard & Shave',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'demo-service-4',
    businessId: DEMO_BUSINESS_ID,
    name: 'Haircut + Beard',
    description: 'Complete package: precision haircut plus beard trim and shape.',
    duration: 50,
    price: 55,
    isActive: true,
    order: 4,
    category: 'Packages',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'demo-service-5',
    businessId: DEMO_BUSINESS_ID,
    name: 'Straight Razor Shave',
    description: 'Traditional hot towel straight razor shave. The ultimate grooming experience.',
    duration: 30,
    price: 40,
    isActive: true,
    order: 5,
    category: 'Beard & Shave',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'demo-service-6',
    businessId: DEMO_BUSINESS_ID,
    name: "Kid's Cut (Under 12)",
    description: 'Professional haircut for children under 12. Patient, friendly service.',
    duration: 25,
    price: 25,
    isActive: true,
    order: 6,
    category: 'Haircuts',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
]

// ─── Demo Barber-Service Relations ──────────────────────────────────────

export const DEMO_BARBER_SERVICES = [
  // Marcus does everything
  { barberId: 'demo-barber-1', serviceId: 'demo-service-1', isActive: true, sortOrder: 1 },
  { barberId: 'demo-barber-1', serviceId: 'demo-service-2', isActive: true, sortOrder: 2 },
  { barberId: 'demo-barber-1', serviceId: 'demo-service-3', isActive: true, sortOrder: 3 },
  { barberId: 'demo-barber-1', serviceId: 'demo-service-4', isActive: true, sortOrder: 4 },
  { barberId: 'demo-barber-1', serviceId: 'demo-service-5', isActive: true, sortOrder: 5 },
  { barberId: 'demo-barber-1', serviceId: 'demo-service-6', isActive: true, sortOrder: 6 },
  // Diego focuses on fades and beards
  { barberId: 'demo-barber-2', serviceId: 'demo-service-1', isActive: true, sortOrder: 1 },
  { barberId: 'demo-barber-2', serviceId: 'demo-service-2', isActive: true, sortOrder: 2 },
  { barberId: 'demo-barber-2', serviceId: 'demo-service-3', isActive: true, sortOrder: 3 },
  { barberId: 'demo-barber-2', serviceId: 'demo-service-4', isActive: true, sortOrder: 4 },
  { barberId: 'demo-barber-2', serviceId: 'demo-service-5', isActive: true, sortOrder: 5 },
  // Tyler focuses on modern cuts
  { barberId: 'demo-barber-3', serviceId: 'demo-service-1', isActive: true, sortOrder: 1 },
  { barberId: 'demo-barber-3', serviceId: 'demo-service-2', isActive: true, sortOrder: 2 },
  { barberId: 'demo-barber-3', serviceId: 'demo-service-4', isActive: true, sortOrder: 3 },
  { barberId: 'demo-barber-3', serviceId: 'demo-service-6', isActive: true, sortOrder: 4 },
]

// ─── Demo Reviews ──────────────────────────────────────────────────────────

export interface DemoReview {
  id: string
  businessId: string
  barberId: string | null
  customerName: string
  rating: number
  comment: string
  isFeatured: boolean
  createdAt: Date
}

export const DEMO_REVIEWS: DemoReview[] = [
  {
    id: 'demo-review-1',
    businessId: DEMO_BUSINESS_ID,
    barberId: 'demo-barber-1',
    customerName: 'James W.',
    rating: 5,
    comment: 'Marcus is the best barber in town. The fade was perfect and the straight razor finish was smooth. Highly recommend!',
    isFeatured: true,
    createdAt: new Date('2024-06-15T10:00:00Z'),
  },
  {
    id: 'demo-review-2',
    businessId: DEMO_BUSINESS_ID,
    barberId: 'demo-barber-2',
    customerName: 'Carlos M.',
    rating: 5,
    comment: "Diego's skin fade is unmatched. Always leave looking fresh. Great atmosphere too.",
    isFeatured: true,
    createdAt: new Date('2024-07-02T14:00:00Z'),
  },
  {
    id: 'demo-review-3',
    businessId: DEMO_BUSINESS_ID,
    barberId: 'demo-barber-3',
    customerName: 'Andre T.',
    rating: 5,
    comment: "Tyler knows exactly how to handle curly hair. Best cut I've had in years.",
    isFeatured: true,
    createdAt: new Date('2024-07-20T11:00:00Z'),
  },
  {
    id: 'demo-review-4',
    businessId: DEMO_BUSINESS_ID,
    barberId: 'demo-barber-1',
    customerName: 'Mike R.',
    rating: 5,
    comment: "Great service, clean cut, friendly staff. This is my go-to spot now.",
    isFeatured: true,
    createdAt: new Date('2024-08-05T09:00:00Z'),
  },
  {
    id: 'demo-review-5',
    businessId: DEMO_BUSINESS_ID,
    barberId: 'demo-barber-2',
    customerName: 'Devon K.',
    rating: 4,
    comment: "Solid beard trim. Diego took his time and made sure everything was even. Will be back.",
    isFeatured: true,
    createdAt: new Date('2024-08-12T15:00:00Z'),
  },
  {
    id: 'demo-review-6',
    businessId: DEMO_BUSINESS_ID,
    barberId: 'demo-barber-3',
    customerName: 'Ryan B.',
    rating: 5,
    comment: "Tyler's attention to detail is incredible. The booking process was super easy too.",
    isFeatured: true,
    createdAt: new Date('2024-08-18T13:00:00Z'),
  },
]

// ─── Demo Customers ──────────────────────────────────────────────────────────

export const DEMO_CUSTOMERS = [
  {
    id: 'demo-customer-1',
    businessId: DEMO_BUSINESS_ID,
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@email.com',
    phone: '(555) 234-5678',
    notes: 'Prefers skin fade on sides, longer on top.',
    createdAt: new Date('2024-06-15T10:00:00Z'),
    updatedAt: new Date('2024-08-20T10:00:00Z'),
  },
  {
    id: 'demo-customer-2',
    businessId: DEMO_BUSINESS_ID,
    firstName: 'Carlos',
    lastName: 'Martinez',
    email: 'carlos.m@email.com',
    phone: '(555) 345-6789',
    notes: 'Allergic to certain aftershaves. Use unscented only.',
    createdAt: new Date('2024-07-02T14:00:00Z'),
    updatedAt: new Date('2024-08-18T14:00:00Z'),
  },
  {
    id: 'demo-customer-3',
    businessId: DEMO_BUSINESS_ID,
    firstName: 'Andre',
    lastName: 'Thompson',
    email: 'andre.t@email.com',
    phone: '(555) 456-7890',
    notes: 'Curly hair. Prefers dry cut method.',
    createdAt: new Date('2024-07-20T11:00:00Z'),
    updatedAt: new Date('2024-08-15T11:00:00Z'),
  },
  {
    id: 'demo-customer-4',
    businessId: DEMO_BUSINESS_ID,
    firstName: 'Michael',
    lastName: 'Ross',
    email: 'mike.ross@email.com',
    phone: '(555) 567-8901',
    notes: 'Regular client. Books every 3 weeks.',
    createdAt: new Date('2024-08-05T09:00:00Z'),
    updatedAt: new Date('2024-08-20T09:00:00Z'),
  },
  {
    id: 'demo-customer-5',
    businessId: DEMO_BUSINESS_ID,
    firstName: 'Devon',
    lastName: 'King',
    email: 'devon.king@email.com',
    phone: '(555) 678-9012',
    notes: '',
    createdAt: new Date('2024-08-12T15:00:00Z'),
    updatedAt: new Date('2024-08-19T15:00:00Z'),
  },
]

// ─── Generate Demo Appointments (today + recent) ────────────────────────────

function generateDemoAppointments() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const appointments: any[] = []
  let counter = 1

  // Generate appointments for today
  const todaySlots = [
    { hour: 9, min: 0, barberId: 'demo-barber-1', serviceId: 'demo-service-1', customerId: 'demo-customer-1', status: 'CONFIRMED' },
    { hour: 10, min: 0, barberId: 'demo-barber-2', serviceId: 'demo-service-2', customerId: 'demo-customer-2', status: 'CONFIRMED' },
    { hour: 11, min: 0, barberId: 'demo-barber-1', serviceId: 'demo-service-4', customerId: 'demo-customer-4', status: 'CONFIRMED' },
    { hour: 13, min: 0, barberId: 'demo-barber-3', serviceId: 'demo-service-1', customerId: 'demo-customer-3', status: 'CONFIRMED' },
    { hour: 14, min: 30, barberId: 'demo-barber-2', serviceId: 'demo-service-3', customerId: 'demo-customer-5', status: 'CONFIRMED' },
    { hour: 15, min: 30, barberId: 'demo-barber-1', serviceId: 'demo-service-2', customerId: 'demo-customer-1', status: 'CONFIRMED' },
    { hour: 16, min: 0, barberId: 'demo-barber-3', serviceId: 'demo-service-4', customerId: 'demo-customer-3', status: 'CONFIRMED' },
  ]

  for (const slot of todaySlots) {
    const service = DEMO_SERVICES.find(s => s.id === slot.serviceId)!
    const barber = DEMO_BARBERS.find(b => b.id === slot.barberId)!
    const customer = DEMO_CUSTOMERS.find(c => c.id === slot.customerId)!
    const startTime = new Date(today)
    startTime.setHours(slot.hour, slot.min, 0, 0)
    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + service.duration)

    appointments.push({
      id: `demo-appt-${counter++}`,
      businessId: DEMO_BUSINESS_ID,
      barberId: slot.barberId,
      customerId: slot.customerId,
      serviceId: slot.serviceId,
      status: slot.status,
      startTime,
      endTime,
      notes: '',
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 3),
      updatedAt: new Date(),
      customer,
      barber,
      service,
    })
  }

  // Generate a few appointments for yesterday (completed)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdaySlots = [
    { hour: 9, min: 0, barberId: 'demo-barber-1', serviceId: 'demo-service-1', customerId: 'demo-customer-4', status: 'COMPLETED' },
    { hour: 10, min: 0, barberId: 'demo-barber-2', serviceId: 'demo-service-3', customerId: 'demo-customer-2', status: 'COMPLETED' },
    { hour: 11, min: 0, barberId: 'demo-barber-3', serviceId: 'demo-service-6', customerId: 'demo-customer-5', status: 'COMPLETED' },
    { hour: 14, min: 0, barberId: 'demo-barber-1', serviceId: 'demo-service-5', customerId: 'demo-customer-1', status: 'COMPLETED' },
    { hour: 15, min: 30, barberId: 'demo-barber-2', serviceId: 'demo-service-4', customerId: 'demo-customer-3', status: 'COMPLETED' },
  ]

  for (const slot of yesterdaySlots) {
    const service = DEMO_SERVICES.find(s => s.id === slot.serviceId)!
    const barber = DEMO_BARBERS.find(b => b.id === slot.barberId)!
    const customer = DEMO_CUSTOMERS.find(c => c.id === slot.customerId)!
    const startTime = new Date(yesterday)
    startTime.setHours(slot.hour, slot.min, 0, 0)
    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + service.duration)

    appointments.push({
      id: `demo-appt-${counter++}`,
      businessId: DEMO_BUSINESS_ID,
      barberId: slot.barberId,
      customerId: slot.customerId,
      serviceId: slot.serviceId,
      status: slot.status,
      startTime,
      endTime,
      notes: '',
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: startTime,
      customer,
      barber,
      service,
    })
  }

  // Generate a few for tomorrow (upcoming)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowSlots = [
    { hour: 9, min: 0, barberId: 'demo-barber-1', serviceId: 'demo-service-2', customerId: 'demo-customer-4', status: 'CONFIRMED' },
    { hour: 10, min: 30, barberId: 'demo-barber-2', serviceId: 'demo-service-1', customerId: 'demo-customer-5', status: 'CONFIRMED' },
    { hour: 13, min: 0, barberId: 'demo-barber-3', serviceId: 'demo-service-4', customerId: 'demo-customer-1', status: 'CONFIRMED' },
    { hour: 15, min: 0, barberId: 'demo-barber-1', serviceId: 'demo-service-3', customerId: 'demo-customer-2', status: 'CONFIRMED' },
  ]

  for (const slot of tomorrowSlots) {
    const service = DEMO_SERVICES.find(s => s.id === slot.serviceId)!
    const barber = DEMO_BARBERS.find(b => b.id === slot.barberId)!
    const customer = DEMO_CUSTOMERS.find(c => c.id === slot.customerId)!
    const startTime = new Date(tomorrow)
    startTime.setHours(slot.hour, slot.min, 0, 0)
    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + service.duration)

    appointments.push({
      id: `demo-appt-${counter++}`,
      businessId: DEMO_BUSINESS_ID,
      barberId: slot.barberId,
      customerId: slot.customerId,
      serviceId: slot.serviceId,
      status: slot.status,
      startTime,
      endTime,
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      customer,
      barber,
      service,
    })
  }

  return appointments
}

export const DEMO_APPOINTMENTS = generateDemoAppointments()

// ─── Demo Schedule (weekly availability per barber) ─────────────────────────

// Schedule model uses dayOfWeek (0=Sunday, 1=Monday, ... 6=Saturday)
// with compound unique key barberId_dayOfWeek
function buildDemoSchedules() {
  const schedules: any[] = []
  DEMO_BARBERS.forEach((barber, i) => {
    // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    const dayConfigs = [
      { dayOfWeek: 0, isOff: true,  startTime: null,   endTime: null },   // Sunday
      { dayOfWeek: 1, isOff: false, startTime: '09:00', endTime: '19:00' }, // Monday
      { dayOfWeek: 2, isOff: false, startTime: '09:00', endTime: '19:00' }, // Tuesday
      { dayOfWeek: 3, isOff: false, startTime: '09:00', endTime: '19:00' }, // Wednesday
      { dayOfWeek: 4, isOff: false, startTime: '09:00', endTime: '19:00' }, // Thursday
      { dayOfWeek: 5, isOff: false, startTime: '09:00', endTime: '20:00' }, // Friday
      { dayOfWeek: 6, isOff: false, startTime: '09:00', endTime: '18:00' }, // Saturday
    ]
    dayConfigs.forEach((dc) => {
      schedules.push({
        id: `demo-schedule-${i + 1}-${dc.dayOfWeek}`,
        barberId: barber.id,
        dayOfWeek: dc.dayOfWeek,
        startTime: dc.startTime,
        endTime: dc.endTime,
        isOff: dc.isOff,
        breaks: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      })
    })
  })
  return schedules
}

export const DEMO_SCHEDULES = buildDemoSchedules()

// ─── Demo FAQ ──────────────────────────────────────────────────────────────────

export const DEMO_FAQS = [
  { id: 'demo-faq-1', businessId: DEMO_BUSINESS_ID, question: 'Do I need to book in advance?', answer: 'We recommend booking online to guarantee your spot, but walk-ins are welcome when we have availability.', order: 1 },
  { id: 'demo-faq-2', businessId: DEMO_BUSINESS_ID, question: 'What is your cancellation policy?', answer: 'Please cancel at least 2 hours before your appointment. Late cancellations may be subject to a fee.', order: 2 },
  { id: 'demo-faq-3', businessId: DEMO_BUSINESS_ID, question: 'Do you accept walk-ins?', answer: 'Yes, walk-ins are welcome but appointments take priority. We recommend booking online for guaranteed service.', order: 3 },
  { id: 'demo-faq-4', businessId: DEMO_BUSINESS_ID, question: 'What forms of payment do you accept?', answer: 'We accept cash, all major credit cards, and mobile payments (Apple Pay, Google Pay).', order: 4 },
]

// ─── Helper: find user by email + password ────────────────────────────────

export function findDemoUser(email: string, password: string): DemoUser | null {
  return DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  ) || null
}

export function findDemoUserById(id: string): DemoUser | null {
  return DEMO_USERS.find((u) => u.id === id) || null
}
