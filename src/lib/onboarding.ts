// ============================================================================
// ONBOARDING — persistent white-label setup status + dashboard access gate.
//
// Server-side enforcement priority (checked in this exact order):
//   1. Not authenticated            → /login
//   2. mustChangePassword = true    → /change-password
//   3. Onboarding incomplete        → /dashboard/onboarding
//   4. Otherwise                    → dashboard access allowed
//
// Enforcement lives in the dashboard layout (server component) so it cannot
// be bypassed by client-side navigation. Middleware additionally stamps the
// request path into `x-pathname` so the gate can exempt its own redirect
// targets (the onboarding page) without infinite redirect loops.
// ============================================================================

import { prisma } from '@/lib/prisma'

export type DashboardAccessReason = 'unauthenticated' | 'password' | 'onboarding'

/**
 * Access decision for the dashboard gate.
 * `redirectTo` is present only when `allowed` is false.
 */
export type DashboardAccess = {
  allowed: boolean
  redirectTo?: string
  reason?: DashboardAccessReason
}

/** Onboarding wizard step keys (persisted in Business.onboardingStep). */
export const ONBOARDING_STEPS = ['business', 'branding', 'services', 'team', 'booking', 'done'] as const
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]

/**
 * Resolve the authenticated owner's businessId from the DATABASE user record.
 *
 * The session JWT can be stale — it is minted at login and does not refresh
 * when a business is later created/linked — so every onboarding API resolves
 * the business from the DB, never from the token claim.
 *
 * Returns null when the user cannot be found or has no business linked.
 */
export async function resolveOwnerBusinessId(
  user: { id?: string | null; email?: string | null }
): Promise<string | null> {
  if (!user.id && !user.email) return null
  const dbUser = await prisma.user.findUnique({
    where: user.id ? { id: user.id } : { email: user.email! },
    select: { businessId: true },
  })
  return dbUser?.businessId ?? null
}

/**
 * Whether the given business has completed onboarding.
 * A missing business (null id) counts as incomplete.
 */
export async function hasCompletedOnboarding(businessId: string | null | undefined): Promise<boolean> {
  if (!businessId) return false
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { onboardingCompleted: true },
  })
  return business?.onboardingCompleted ?? false
}

/** Paths whose entire purpose is satisfying the gate — never redirect away FROM them. */
function isGateExemptPath(pathname: string): boolean {
  return (
    pathname.startsWith('/dashboard/onboarding') ||
    pathname.startsWith('/change-password') ||
    pathname.startsWith('/api/dashboard/onboarding') ||
    pathname.startsWith('/api/auth')
  )
}

/**
 * Central server-side dashboard access gate.
 *
 * @param session   NextAuth session (or null when unauthenticated).
 * @param pathname  Current request path (from the x-pathname header stamped
 *                  by middleware). Used to exempt the gate's own redirect
 *                  targets so users can actually complete the password change
 *                  or the onboarding wizard.
 */
export async function checkDashboardAccess(
  session: { user?: any } | null,
  pathname: string
): Promise<DashboardAccess> {
  // Priority 1 — authentication
  if (!session?.user) {
    return { allowed: false, redirectTo: '/login', reason: 'unauthenticated' }
  }

  const user = session.user as { id?: string; email?: string; role?: string; businessId?: string | null }

  // Priority 2 — forced password change (checked fresh from DB, always current)
  let mustChangePassword = false
  try {
    const dbUser = await prisma.user.findUnique({
      where: user.id ? { id: user.id } : user.email ? { email: user.email } : undefined,
      select: { mustChangePassword: true },
    })
    mustChangePassword = dbUser?.mustChangePassword ?? false
  } catch (error) {
    // If the DB is unreachable, fail safe: block dashboard access.
    console.error('[onboarding] Failed to load user for access gate:', error)
    return { allowed: false, redirectTo: '/login', reason: 'unauthenticated' }
  }

  if (mustChangePassword && !pathname.startsWith('/change-password')) {
    return { allowed: false, redirectTo: '/change-password', reason: 'password' }
  }

  // Priority 3 — onboarding incomplete (owners only; barbers belong to a
  // business by definition, so onboarding only gates owners)
  const businessId = user.businessId || null
  const role = (user.role || 'BARBER').toUpperCase()

  if (role === 'OWNER') {
    if (!businessId) {
      // Owner with no business at all — onboarding not started.
      if (!isGateExemptPath(pathname)) {
        return { allowed: false, redirectTo: '/dashboard/onboarding', reason: 'onboarding' }
      }
    } else if (!(await hasCompletedOnboarding(businessId))) {
      // Business exists but setup not finished.
      if (!isGateExemptPath(pathname)) {
        return { allowed: false, redirectTo: '/dashboard/onboarding', reason: 'onboarding' }
      }
    }
  }

  // Priority 4 — access allowed
  return { allowed: true }
}
