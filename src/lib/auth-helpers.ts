// ============================================================================
// Auth Helpers — Authorization layer for API routes.
// Demo mode: uses the demo session instead of NextAuth.
// ============================================================================

import { getDemoSession } from './demo-auth'
import { isProductionMode } from './app-config'
import { NextResponse } from 'next/server'

export interface AuthResult {
  success: true
  session: any
  user: {
    id: string
    email: string
    name: string
    role: 'OWNER' | 'BARBER'
    businessId: string | null
    barberId?: string | null
  }
}

export interface AuthError {
  success: false
  response: NextResponse
}

/**
 * Require any authenticated user (OWNER or BARBER).
 */
export async function requireAuth(): Promise<AuthResult | AuthError> {
  // Production authentication is intentionally fail-closed until the client
  // configures a real NextAuth provider/session adapter.
  const session = isProductionMode() ? null : await getDemoSession()
  if (!session?.user) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }
  return {
    success: true,
    session,
    user: session.user as any,
  }
}

/**
 * Require OWNER role only. Barbers get 403.
 */
export async function requireOwner(): Promise<AuthResult | AuthError> {
  const auth = await requireAuth()
  if (!auth.success) return auth

  if (auth.user.role !== 'OWNER') {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Forbidden: Owner access required' },
        { status: 403 }
      ),
    }
  }

  return auth
}

/**
 * Require OWNER or BARBER.
 */
export async function requireStaff(
  options?: { restrictToOwnBarber?: boolean }
): Promise<AuthResult | AuthError> {
  const auth = await requireAuth()
  if (!auth.success) return auth

  if (auth.user.role === 'BARBER' && options?.restrictToOwnBarber && !auth.user.barberId) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Barber account not linked to a barber profile' },
        { status: 403 }
      ),
    }
  }
  return auth
}

/**
 * Verify business access (demo mode: always true since single-tenant).
 */
export async function verifyBusinessAccess(
  userBusinessId: string | null,
  resourceBusinessId: string
): Promise<boolean> {
  if (!userBusinessId) return false
  return userBusinessId === resourceBusinessId
}

/**
 * Log an audit event (demo mode: no-op).
 */
export async function logAudit(params: {
  userId?: string
  businessId?: string
  action: string
  entityType?: string
  entityId?: string
  oldValues?: any
  newValues?: any
  ipAddress?: string
  userAgent?: string
}): Promise<void> {
  // Demo mode: no audit logging
  console.log('[Demo] Audit:', params.action, params.entityType, params.entityId)
}

/**
 * Get the businessId for the current user.
 */
export async function getBusinessIdForUser(user: { businessId?: string | null; role: string }): Promise<string> {
  if (user.businessId) return user.businessId
  if (isProductionMode()) throw new Error('Authenticated user is not assigned to a business')
  const { DEMO_BUSINESS_ID } = await import('./demo-data')
  return DEMO_BUSINESS_ID
}
