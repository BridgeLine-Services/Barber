// ============================================================================
// Auth Helpers — Authorization layer for API routes.
// Separate from authentication (NextAuth) — this enforces what an
// authenticated user is ALLOWED to do.
// ============================================================================

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuditAction } from '@prisma/client'

export interface AuthResult {
  success: true
  session: any
  user: {
    id: string
    email: string
    name: string
    role: 'OWNER' | 'BARBER'
    businessId: string
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
  const session = await getServerSession(authOptions)
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
 * Require OWNER or BARBER. For BARBER role, optionally restrict to own barberId.
 * Returns the authenticated user with their barberId for scoped queries.
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
 * Verify that the authenticated user's businessId matches the target resource's businessId.
 * Prevents cross-tenant data access even if someone guesses an ID.
 */
export async function verifyBusinessAccess(
  userBusinessId: string,
  resourceBusinessId: string
): Promise<boolean> {
  return userBusinessId === resourceBusinessId
}

/**
 * Log an audit event.
 */
export async function logAudit(params: {
  userId?: string
  businessId?: string
  action: AuditAction
  entityType?: string
  entityId?: string
  oldValues?: any
  newValues?: any
  ipAddress?: string
  userAgent?: string
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        businessId: params.businessId || null,
        action: params.action,
        entityType: params.entityType || null,
        entityId: params.entityId || null,
        oldValues: params.oldValues || undefined,
        newValues: params.newValues || undefined,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    })
  } catch (error) {
    console.error('Failed to write audit log:', error)
    // Don't fail the request if audit logging fails
  }
}

/**
 * Get the businessId for the current authenticated user, or fall back to
 * first business for demo mode. Throws if no business exists.
 */
export async function getBusinessIdForUser(user: { businessId?: string; role: string }): Promise<string> {
  if (user.businessId) return user.businessId
  const business = await prisma.business.findFirst({ orderBy: { createdAt: 'asc' } })
  if (!business) throw new Error('No business found. Run the seed script first.')
  return business.id
}
