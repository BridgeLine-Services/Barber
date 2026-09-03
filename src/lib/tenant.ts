// Central tenant resolution — production mode (no demo fallback).
import { headers } from 'next/headers'
import { prisma } from './prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function getAuthenticatedBusinessId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return (session?.user as any)?.businessId ?? null
}

/** Resolve the public tenant from the request host. */
export async function resolvePublicBusiness() {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const hostname = host?.split(':')[0]?.toLowerCase()
  if (!hostname) return null

  // Custom domains can be added to Business later without changing callers.
  // Slug-based routing is the portable template default.
  return prisma.business.findUnique({ where: { slug: hostname } }).catch(() => null)
}

/** Resolve the authenticated dashboard tenant. */
export async function getAuthenticatedBusiness() {
  const businessId = await getAuthenticatedBusinessId()
  if (!businessId) return null
  return prisma.business.findUnique({ where: { id: businessId } }).catch(() => null)
}

export async function resolveBusiness() {
  return resolvePublicBusiness()
}

export async function resolveBusinessId(): Promise<string> {
  const business = await resolvePublicBusiness()
  if (!business) throw new Error('Business tenant could not be resolved')
  return business.id
}

export async function resolveAuthenticatedBusinessId(): Promise<string> {
  const businessId = await getAuthenticatedBusinessId()
  if (!businessId) throw new Error('Authenticated business could not be resolved')
  return businessId
}
