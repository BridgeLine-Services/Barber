import { prisma } from '@/lib/prisma'

// ============================================================================
// Loyalty System
// Owner-configurable reward programs.
// Supports both visit-based and points-based systems.
// Schema supports BusinessRewardProgram (shop-level) and eventually
// BarberRewardProgram (barber-specific).
// ============================================================================

export type RewardProgramType = 'VISITS' | 'POINTS'
export type RewardProgramStatus = 'ACTIVE' | 'INACTIVE'

export interface RewardTier {
  threshold: number // visits or points needed
  reward: string // description of the reward
  rewardType: 'DISCOUNT' | 'FREE_SERVICE' | 'CUSTOM'
  discountValue?: number // dollar amount for DISCOUNT type
}

export interface CustomerLoyaltyInfo {
  customerId: string
  programName: string | null
  programType: RewardProgramType | null
  currentVisits: number
  currentPoints: number
  tiers: RewardTier[]
  nextTier: RewardTier | null
  progressToNext: number | null // percentage (0-100)
  earnedRewards: string[]
}

/**
 * Get the active business reward program.
 */
export async function getActiveRewardProgram(businessId: string) {
  // Since we don't have a BusinessRewardProgram table yet, we store the config
  // in the Business model as a JSON field. This keeps it flexible and
  // avoids schema migrations for now.
  const business = await prisma.business.findFirst({
    where: { id: businessId },
    select: { id: true, name: true },
  })

  // We'll use the settings API to store reward program config
  // For now, return the business info
  return business
}

/**
 * Compute loyalty info for a customer based on their appointment history.
 */
export async function getCustomerLoyalty(
  customerId: string,
  businessId: string,
  programConfig?: {
    name: string
    type: RewardProgramType
    tiers: RewardTier[]
    pointsPerDollar?: number
  }
): Promise<CustomerLoyaltyInfo> {
  const appointments = await prisma.appointment.findMany({
    where: { customerId, businessId, status: 'COMPLETED' },
    include: { service: { select: { price: true } } },
    orderBy: { startTime: 'asc' },
  })

  const currentVisits = appointments.length
  const totalSpent = appointments.reduce((sum, a) => sum + (a.service?.price || 0), 0)

  let currentPoints = 0
  if (programConfig?.type === 'POINTS' && programConfig.pointsPerDollar) {
    currentPoints = Math.floor(totalSpent * programConfig.pointsPerDollar)
  }

  const tiers = programConfig?.tiers || []
  const earnedRewards: string[] = []

  // Determine earned rewards based on visits or points
  const metric = programConfig?.type === 'POINTS' ? currentPoints : currentVisits
  for (const tier of tiers) {
    if (metric >= tier.threshold) {
      earnedRewards.push(tier.reward)
    }
  }

  // Find next unearned tier
  const nextTier = tiers.find(t => metric < t.threshold) || null
  let progressToNext: number | null = null
  if (nextTier) {
    progressToNext = Math.min(100, Math.round((metric / nextTier.threshold) * 100))
  }

  return {
    customerId,
    programName: programConfig?.name || null,
    programType: programConfig?.type || null,
    currentVisits,
    currentPoints,
    tiers,
    nextTier,
    progressToNext,
    earnedRewards,
  }
}
