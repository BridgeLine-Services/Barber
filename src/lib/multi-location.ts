// ============================================================================
// Multi-Location Architecture
// Supports businesses with multiple shop locations
// A parent Business can have child locations, each with their own barbers,
// schedules, services, and appointments — but sharing customer data
// ============================================================================

import { prisma } from '@/lib/prisma'

/**
 * Get all locations for a business (parent + children)
 */
export async function getBusinessLocations(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, name: true, slug: true },
  })

  if (!business) return []

  // Check if this business has a parent (it's a child location)
  // Check if it has children (it's a parent)
  // Currently the schema doesn't have a parentId field, so we return just the business
  // This is the placeholder for when multi-location is enabled via schema migration
  
  return [business]
}

/**
 * Format a business location for display
 */
export function formatLocation(business: { id: string; name: string; slug: string }): {
  id: string
  name: string
  url: string
} {
  return {
    id: business.id,
    name: business.name,
    url: `/${business.slug}`,
  }
}

/**
 * Switch the active business context for a user
 * In multi-location mode, users with access to multiple shops can switch between them
 */
export async function switchBusinessContext(userId: string, businessId: string) {
  // Verify the user has access to the target business
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { businessId: true, role: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // In single-location mode, users can only access their own business
  if (user.businessId !== businessId) {
    throw new Error('You do not have access to this business location')
  }

  return { userId, businessId, role: user.role }
}

/**
 * Get aggregated metrics across all locations
 */
export async function getMultiLocationMetrics(businessId: string) {
  // For now, single-location — returns metrics for just this business
  const [appointmentCount, customerCount, barberCount] = await Promise.all([
    prisma.appointment.count({ where: { businessId } }),
    prisma.customer.count({ where: { businessId, archivedAt: null } }),
    prisma.barber.count({ where: { businessId, isActive: true } }),
  ])

  return {
    locations: 1,
    totalAppointments: appointmentCount,
    totalCustomers: customerCount,
    totalBarbers: barberCount,
  }
}
