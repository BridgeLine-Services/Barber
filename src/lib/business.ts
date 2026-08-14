import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// ============================================================================
// Multi-tenant resolution helper
// In production, resolve by domain or slug. For demo, resolve by first business
// or by the authenticated user's businessId.
// ============================================================================

export async function getCurrentBusiness() {
  // Try authenticated user first
  const session = await getServerSession(authOptions)
  if (session?.user) {
    const businessId = (session.user as any).businessId
    if (businessId) {
      const business = await prisma.business.findUnique({ where: { id: businessId } })
      if (business) return business
    }
  }

  // Fallback: first business (demo mode)
  return prisma.business.findFirst({ orderBy: { createdAt: 'asc' } })
}

export async function getCurrentBusinessId(): Promise<string> {
  const business = await getCurrentBusiness()
  if (!business) throw new Error('No business found. Run the seed script first.')
  return business.id
}

/**
 * For API routes: resolve businessId from session or fallback to first business.
 */
export async function resolveBusinessId(req?: Request): Promise<string> {
  const session = await getServerSession(authOptions)
  if (session?.user) {
    const businessId = (session.user as any).businessId
    if (businessId) return businessId
  }
  // Demo fallback
  const business = await prisma.business.findFirst({ orderBy: { createdAt: 'asc' } })
  if (!business) throw new Error('No business found')
  return business.id
}
