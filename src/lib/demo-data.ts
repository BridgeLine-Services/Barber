// ============================================================================
// Template Data — Used as fallback when the database is not yet configured.
// These are placeholder values for the template. When the database is
// connected and seeded, real business data takes precedence.
// A business owner should configure their real info in Dashboard > Settings.
// ============================================================================

export const demoBusiness = {
  id: 'demo-business',
  name: 'The Barber Co.',
  slug: 'the-barber-co',
  phone: '(555) 555-0199',
  email: 'hello@thebarberco.com',
  address: '456 Style Avenue',
  city: 'Your City',
  state: 'ST',
  zipCode: '00000',
  aboutText: 'Welcome to your barbershop! This is a template description. Update your shop\'s story, hours, and contact info in the Dashboard > Settings page once your database is connected. Replace this text with your own to tell customers what makes your shop special.',
  hours: {
    monday: { open: '09:00', close: '19:00', isOff: false },
    tuesday: { open: '09:00', close: '19:00', isOff: false },
    wednesday: { open: '09:00', close: '19:00', isOff: false },
    thursday: { open: '09:00', close: '19:00', isOff: false },
    friday: { open: '09:00', close: '19:00', isOff: false },
    saturday: { open: '09:00', close: '18:00', isOff: false },
    sunday: { open: '10:00', close: '16:00', isOff: false },
  },
  instagram: '@thebarberco',
  facebook: 'thebarberco',
  tiktok: '@thebarberco',
}

export const demoServices = [
  {
    id: 'demo-svc-1',
    name: 'Classic Haircut',
    description: 'Precision haircut with hot towel finish, lineup, and styling. Includes consultation.',
    duration: 30,
    price: 35,
    isActive: true,
    order: 0,
  },
  {
    id: 'demo-svc-2',
    name: 'Skin Fade',
    description: 'Sharp fade blend (low, mid, or high) with precise line work and styling.',
    duration: 45,
    price: 45,
    isActive: true,
    order: 1,
  },
  {
    id: 'demo-svc-3',
    name: 'Beard Trim & Shape',
    description: 'Beard sculpting with razor outline, hot towel treatment, and beard oil.',
    duration: 30,
    price: 25,
    isActive: true,
    order: 2,
  },
  {
    id: 'demo-svc-4',
    name: 'Haircut + Beard Combo',
    description: 'Full service: precision haircut plus beard trim and shape. Best value.',
    duration: 60,
    price: 60,
    isActive: true,
    order: 3,
  },
  {
    id: 'demo-svc-5',
    name: 'Hot Towel Shave',
    description: 'Traditional straight razor shave with hot towel prep and aftershave balm.',
    duration: 30,
    price: 35,
    isActive: true,
    order: 4,
  },
  {
    id: 'demo-svc-6',
    name: "Kids' Haircut (Under 12)",
    description: 'Gentle haircut for our youngest clients. Includes styling and a lollipop.',
    duration: 25,
    price: 25,
    isActive: true,
    order: 5,
  },
]

export const demoBarbers = [
  {
    id: 'demo-barber-1',
    name: 'Marcus "The Blade" Reid',
    photo: null,
    specialty: 'Fades | Tapers | Beard Work',
    bio: 'With over 12 years behind the chair, Marcus specializes in skin fades and razor-sharp lineups. Former competition barber with a passion for classic techniques.',
    isActive: true,
    order: 0,
    services: [
      { serviceId: 'demo-svc-1' },
      { serviceId: 'demo-svc-2' },
      { serviceId: 'demo-svc-3' },
      { serviceId: 'demo-svc-4' },
      { serviceId: 'demo-svc-5' },
      { serviceId: 'demo-svc-6' },
    ],
  },
  {
    id: 'demo-barber-2',
    name: 'Antonio "Scissors" Silva',
    photo: null,
    specialty: 'Classic Cuts | Hot Towel Shaves',
    bio: 'Antonio brings old-world Italian barbering to the modern chair. Master of the straight razor shave and timeless scissor cuts.',
    isActive: true,
    order: 1,
    services: [
      { serviceId: 'demo-svc-1' },
      { serviceId: 'demo-svc-3' },
      { serviceId: 'demo-svc-4' },
      { serviceId: 'demo-svc-5' },
    ],
  },
  {
    id: 'demo-barber-3',
    name: 'James "Fresh" Carter',
    photo: null,
    specialty: 'Modern Styles | Kids Cuts',
    bio: 'The newest talent on the team, James is known for creative modern styles and making kids feel right at home in the chair.',
    isActive: true,
    order: 2,
    services: [
      { serviceId: 'demo-svc-1' },
      { serviceId: 'demo-svc-2' },
      { serviceId: 'demo-svc-6' },
    ],
  },
]

export const demoReviews = [
  {
    id: 'demo-rev-1',
    customerName: 'David L.',
    rating: 5,
    comment: 'Best fade I have ever gotten. Marcus is a true artist with the clippers. The atmosphere is clean and professional. Highly recommend!',
    createdAt: new Date('2026-07-15').toISOString(),
  },
  {
    id: 'demo-rev-2',
    customerName: 'Michael R.',
    rating: 5,
    comment: "Antonio's hot towel shave is an experience every man should try. Old school barbering at its finest. I will be back every week.",
    createdAt: new Date('2026-07-08').toISOString(),
  },
  {
    id: 'demo-rev-3',
    customerName: 'Chris P.',
    rating: 5,
    comment: 'Booked online in under a minute, walked in, sat right down. James gave my son his first real haircut and he loved it. 10/10.',
    createdAt: new Date('2026-06-28').toISOString(),
  },
  {
    id: 'demo-rev-4',
    customerName: 'Tyler W.',
    rating: 5,
    comment: 'The combo deal is unbeatable. Clean cut, sharp beard, and great conversation. This is what a barbershop should feel like.',
    createdAt: new Date('2026-06-20').toISOString(),
  },
]
