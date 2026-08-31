// ============================================================================
// MOCK PRISMA CLIENT — Returns demo data for template mode.
// This replaces the real PrismaClient so the app works without a database.
// When you switch to production, restore src/lib/prisma.ts to use the
// real PrismaClient and set DATABASE_URL.
// ============================================================================

import {
  DEMO_USERS,
  DEMO_BUSINESS,
  DEMO_BARBERS,
  DEMO_SERVICES,
  DEMO_REVIEWS,
  DEMO_CUSTOMERS,
  DEMO_APPOINTMENTS,
  DEMO_BARBER_SERVICES,
  DEMO_SCHEDULES,
  DEMO_FAQS,
  DEMO_BUSINESS_ID,
} from './demo-data'

// ─── Deep clone helper (so callers can't mutate the source data) ──────────
function clone<T>(val: T): T {
  return JSON.parse(JSON.stringify(val, (key, value) => {
    if (value instanceof Date) return value.toISOString()
    return value
  }), (key, value) => {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return new Date(value)
    }
    return value
  })
}

// ─── Helper: filter by businessId ─────────────────────────────────────────
function byBusiness<T extends { businessId: string }>(items: T[], businessId?: string): T[] {
  if (!businessId) return items
  return items.filter((i) => i.businessId === businessId)
}

// ─── Mock model delegate ──────────────────────────────────────────────────
// Date.now() alone can collide when tests create records in the same
// millisecond, causing false tenant and conflict-detection failures.
let mockIdSequence = 0

function createModelDelegate(modelName: string, data: any[]) {
  return {
    findMany: async (args?: any) => {
      let result = clone(data)

      // Apply where filter
      if (args?.where) {
        result = result.filter((item) => matchWhere(item, args.where))
      }

      // Apply include relations
      if (args?.include) {
        result = result.map((item) => includeRelations(modelName, item, args.include))
      }

      // Apply select
      if (args?.select) {
        result = result.map((item) => applySelect(item, args.select))
      }

      // Apply orderBy
      if (args?.orderBy) {
        result = applyOrderBy(result, args.orderBy)
      }

      // Apply take
      if (args?.take) {
        result = result.slice(0, args.take)
      }

      // Apply skip
      if (args?.skip) {
        result = result.slice(args.skip)
      }

      return result
    },

    findFirst: async (args?: any) => {
      let result = clone(data)

      if (args?.where) {
        result = result.filter((item) => matchWhere(item, args.where))
      }

      if (args?.orderBy) {
        result = applyOrderBy(result, args.orderBy)
      }

      const item = result[0]
      if (!item) return null

      let final = item
      if (args?.include) {
        final = includeRelations(modelName, final, args.include)
      }
      if (args?.select) {
        final = applySelect(final, args.select)
      }

      return final
    },

    findUnique: async (args?: any) => {
      let result = clone(data)

      if (args?.where) {
        result = result.filter((item) => matchWhere(item, args.where))
      }

      const item = result[0]
      if (!item) return null

      let final = item
      if (args?.include) {
        final = includeRelations(modelName, final, args.include)
      }
      if (args?.select) {
        final = applySelect(final, args.select)
      }

      return final
    },

    create: async (args?: any) => {
      const newItem = { id: `demo-${modelName}-${Date.now()}-${++mockIdSequence}`, ...args?.data, createdAt: new Date(), updatedAt: new Date() }
      data.push(newItem)
      return clone(newItem)
    },

    createMany: async (args?: any) => {
      const items = Array.isArray(args?.data) ? args.data : []
      for (const item of items) data.push({ id: `demo-${modelName}-${Date.now()}-${++mockIdSequence}`, ...item, createdAt: new Date(), updatedAt: new Date() })
      return { count: items.length }
    },

    update: async (args?: any) => {
      const idx = data.findIndex((item) => matchWhere(item, args?.where))
      if (idx === -1) return null
      Object.assign(data[idx], args?.data, { updatedAt: new Date() })
      return clone(data[idx])
    },

    delete: async (args?: any) => {
      const idx = data.findIndex((item) => matchWhere(item, args?.where))
      if (idx === -1) return null
      const deleted = data.splice(idx, 1)[0]
      return clone(deleted)
    },

    updateMany: async (args?: any) => {
      let count = 0
      for (const item of data) {
        if (matchWhere(item, args?.where)) { Object.assign(item, args?.data, { updatedAt: new Date() }); count++ }
      }
      return { count }
    },

    deleteMany: async (args?: any) => {
      const before = data.length
      const indices = data.map((item, i) => matchWhere(item, args?.where) ? i : -1).filter(i => i !== -1)
      for (let i = indices.length - 1; i >= 0; i--) {
        data.splice(indices[i], 1)
      }
      return { count: before - data.length }
    },

    count: async (args?: any) => {
      let result = data
      if (args?.where) {
        result = result.filter((item) => matchWhere(item, args.where))
      }
      return result.length
    },

    upsert: async (args?: any) => {
      const existing = data.find((item) => matchWhere(item, args?.where))
      if (existing) {
        Object.assign(existing, args?.update, { updatedAt: new Date() })
        return clone(existing)
      }
      const newItem = { id: `demo-${modelName}-${Date.now()}`, ...args?.create, createdAt: new Date(), updatedAt: new Date() }
      data.push(newItem)
      return clone(newItem)
    },
  }
}

// ─── Where clause matcher ─────────────────────────────────────────────────
function matchWhere(item: any, where: any): boolean {
  for (const [key, value] of Object.entries(where)) {
    // Handle Prisma operators
    if (key === 'AND') {
      if (!value.every((cond: any) => matchWhere(item, cond))) return false
      continue
    }
    if (key === 'OR') {
      if (!value.some((cond: any) => matchWhere(item, cond))) return false
      continue
    }
    if (key === 'NOT') {
      if (matchWhere(item, value)) return false
      continue
    }

    // Handle compound unique keys (e.g. barberId_dayOfWeek, businessId_email)
    if (key.includes('_') && value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      // Split compound key into field names and match each
      const fieldNames = key.split('_')
      let allMatch = true
      for (const [i, fieldName] of fieldNames.entries()) {
        const fieldVal = value[fieldName]
        if (fieldVal !== undefined && item[fieldName] !== fieldVal) {
          allMatch = false
          break
        }
      }
      if (!allMatch) return false
      continue
    }

    // Handle nested operators on field values
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      // gte, lte, gt, lt, in, not_in, contains, etc.
      const itemVal = item[key]
      for (const [op, opVal] of Object.entries(value)) {
        switch (op) {
          case 'gte': if (!(itemVal >= opVal)) return false; break
          case 'lte': if (!(itemVal <= opVal)) return false; break
          case 'gt':  if (!(itemVal > opVal)) return false; break
          case 'lt':  if (!(itemVal < opVal)) return false; break
          case 'in':  if (!opVal.includes(itemVal)) return false; break
          case 'not_in': if (opVal.includes(itemVal)) return false; break
          case 'contains':
            if (typeof itemVal === 'string' && !itemVal.toLowerCase().includes(String(opVal).toLowerCase())) return false
            break
          case 'startsWith':
            if (typeof itemVal === 'string' && !itemVal.startsWith(opVal)) return false
            break
          case 'endsWith':
            if (typeof itemVal === 'string' && !itemVal.endsWith(opVal)) return false
            break
          case 'not':
            if (itemVal === opVal) return false
            break
          case 'mode': break // ignore case mode
          case 'some':
            // some on a relation field — skip for now, handled in includeRelations
            break
          default: break
        }
      }
    } else if (value === null) {
      if (item[key] !== null && item[key] !== undefined) return false
    } else {
      // Direct equality
      if (item[key] !== value) return false
    }
  }
  return true
}

// ─── Include relations ────────────────────────────────────────────────────
function includeRelations(modelName: string, item: any, include: any): any {
  const result = { ...item }

  for (const [relation, opts] of Object.entries(include)) {
    if (relation === 'services' && modelName === 'barber') {
      // barber.services is a relation through BarberService
      const barberServices = DEMO_BARBER_SERVICES.filter(
        (bs) => bs.barberId === item.id && (bs.isActive !== false)
      )
      result.services = barberServices.map((bs) => {
        const service = DEMO_SERVICES.find((s) => s.id === bs.serviceId)
        return {
          ...clone(bs),
          service: service ? clone(service) : null,
        }
      })
    } else if (relation === 'reviews' && modelName === 'barber') {
      result.reviews = clone(DEMO_REVIEWS.filter((r) => r.barberId === item.id)).map((r) => {
        if (opts === true || opts?.select) {
          if (opts?.select?.rating) return { rating: r.rating }
        }
        return r
      })
    } else if (relation === 'customer' && modelName === 'appointment') {
      result.customer = clone(DEMO_CUSTOMERS.find((c) => c.id === item.customerId)) || null
    } else if (relation === 'barber' && modelName === 'appointment') {
      result.barber = clone(DEMO_BARBERS.find((b) => b.id === item.barberId)) || null
    } else if (relation === 'service' && modelName === 'appointment') {
      result.service = clone(DEMO_SERVICES.find((s) => s.id === item.serviceId)) || null
    } else if (relation === 'business' && modelName === 'user') {
      result.business = clone(DEMO_BUSINESS)
    }
  }

  return result
}

// ─── Apply select ──────────────────────────────────────────────────────────
function applySelect(item: any, select: any): any {
  const result: any = {}
  for (const [key, value] of Object.entries(select)) {
    if (value === true && item[key] !== undefined) {
      result[key] = item[key]
    }
  }
  return result
}

// ─── Apply orderBy ─────────────────────────────────────────────────────────
function applyOrderBy(items: any[], orderBy: any): any[] {
  const sorted = [...items]
  if (Array.isArray(orderBy)) {
    for (const condition of orderBy.reverse()) {
      for (const [key, dir] of Object.entries(condition)) {
        sorted.sort((a, b) => {
          if (a[key] < b[key]) return dir === 'asc' ? -1 : 1
          if (a[key] > b[key]) return dir === 'asc' ? 1 : -1
          return 0
        })
      }
    }
  } else {
    for (const [key, dir] of Object.entries(orderBy)) {
      sorted.sort((a, b) => {
        if (a[key] < b[key]) return dir === 'asc' ? -1 : 1
        if (a[key] > b[key]) return dir === 'asc' ? 1 : -1
        return 0
      })
    }
  }
  return sorted
}

// ─── Mock PrismaClient ─────────────────────────────────────────────────────

function createMockPrisma() {
  return {
    business: createModelDelegate('business', [clone(DEMO_BUSINESS)]),
    user: createModelDelegate('user', clone(DEMO_USERS)),
    barber: createModelDelegate('barber', clone(DEMO_BARBERS)),
    service: createModelDelegate('service', clone(DEMO_SERVICES)),
  appointment: createModelDelegate('appointment', clone(DEMO_APPOINTMENTS)),
  appointmentIntakeResponse: createModelDelegate('appointmentIntakeResponse', []),
  bookingQuestion: createModelDelegate('bookingQuestion', []),
  rescheduleHistory: createModelDelegate('rescheduleHistory', []),
  portalVerificationChallenge: createModelDelegate('portalVerificationChallenge', []),
  portalSession: createModelDelegate('portalSession', []),
  customer: createModelDelegate('customer', clone(DEMO_CUSTOMERS)),
    review: createModelDelegate('review', clone(DEMO_REVIEWS)),
    schedule: createModelDelegate('schedule', clone(DEMO_SCHEDULES)),
    barberService: createModelDelegate('barberService', clone(DEMO_BARBER_SERVICES)),
    blockedTime: createModelDelegate('blockedTime', []),
    availabilityOverride: createModelDelegate('availabilityOverride', []),
    faq: createModelDelegate('faq', clone(DEMO_FAQS)),
    businessSEO: createModelDelegate('businessSEO', [{
      id: 'demo-seo-1',
      businessId: DEMO_BUSINESS_ID,
      metaTitle: 'The Classic Cut | Professional Barber Shop',
      metaDescription: 'Book your next haircut or beard trim at The Classic Cut. Pay in person — easy online booking.',
      ogTitle: 'The Classic Cut - Professional Barber Shop',
      ogDescription: 'Precision cuts and master grooming. Book online today.',
      ogImage: null,
      twitterCard: 'summary_large_image',
      keywords: 'barber shop, haircut, beard trim, fades, straight razor',
      structuredDataType: 'BarberShop',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
    }]),
    auditLog: createModelDelegate('auditLog', []),
    media: createModelDelegate('media', []),
    waitlist: createModelDelegate('waitlist', []),
    inventoryItem: createModelDelegate('inventoryItem', [
      { id: 'demo-inv-1', businessId: DEMO_BUSINESS_ID, name: 'Pomade - Strong Hold', sku: 'POM-001', quantity: 12, minQuantity: 5, price: 18, category: 'Products', createdAt: new Date('2024-01-01'), updatedAt: new Date() },
      { id: 'demo-inv-2', businessId: DEMO_BUSINESS_ID, name: 'Beard Oil - Sandalwood', sku: 'BO-002', quantity: 8, minQuantity: 5, price: 15, category: 'Products', createdAt: new Date('2024-01-01'), updatedAt: new Date() },
      { id: 'demo-inv-3', businessId: DEMO_BUSINESS_ID, name: 'Aftershave - Bay Rum', sku: 'AS-003', quantity: 3, minQuantity: 5, price: 22, category: 'Products', createdAt: new Date('2024-01-01'), updatedAt: new Date() },
      { id: 'demo-inv-4', businessId: DEMO_BUSINESS_ID, name: 'Disposable Razors', sku: 'RZ-004', quantity: 50, minQuantity: 20, price: 0.50, category: 'Supplies', createdAt: new Date('2024-01-01'), updatedAt: new Date() },
    ]),
    loyaltyProgram: createModelDelegate('loyaltyProgram', [{
      id: 'demo-loyalty-1',
      businessId: DEMO_BUSINESS_ID,
      name: 'Frequent Clipper',
      pointsPerVisit: 10,
      pointsPerDollar: 1,
      rewardThreshold: 100,
      rewardDescription: 'Free haircut after 100 points',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    }]),
    marketingCampaign: createModelDelegate('marketingCampaign', []),
    notification: createModelDelegate('notification', []),
    closure: createModelDelegate('closure', []),
    businessClosure: createModelDelegate('businessClosure', []),
    businessRewardProgram: createModelDelegate('businessRewardProgram', []),
    customerTagAssignment: createModelDelegate('customerTagAssignment', []),
    mediaAsset: createModelDelegate('mediaAsset', []),
    noShowPolicy: createModelDelegate('noShowPolicy', []),
    notificationLog: createModelDelegate('notificationLog', []),
    waitlistEntry: createModelDelegate('waitlistEntry', []),
    barberRewardProgram: createModelDelegate('barberRewardProgram', []),
    cancellationRecord: createModelDelegate('cancellationRecord', []),
    recurringAppointment: createModelDelegate('recurringAppointment', []),
    staffMember: createModelDelegate('staffMember', clone(DEMO_USERS).map((u: any) => ({
      id: u.id,
      businessId: u.businessId,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: true,
      phone: '(555) 000-0000',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    }))),

    // Transaction support
    $transaction: async (fn: any) => {
      // Just run the callback with the mock client
      return fn(prismaMock)
    },

    $disconnect: async () => {},
    $connect: async () => {},
  }
}

const prismaMock = createMockPrisma()
export const prisma = prismaMock

