// Central tenant resolution for template and production modes.
import { headers } from 'next/headers'
import { prisma } from './prisma'
import { DEMO_BUSINESS, DEMO_BUSINESS_ID } from './demo-data'
import { appConfig } from './app-config'
import { getDemoSession } from './demo-auth'

export async function getAuthenticatedBusinessId(): Promise<string | null> {
  const session = await getDemoSession()
  return session?.user.businessId ?? null
}

/** Resolve the public tenant from the request host (production) or demo seed. */
export async function resolvePublicBusiness() {
  if (appConfig.isDemo) return DEMO_BUSINESS

  const host = (await headers()).get('x-forwarded-host') ?? (await headers()).get('host')
  const hostname = host?.split(':')[0]?.toLowerCase()
  if (!hostname) return null

  // Custom domains can be added to Business later without changing callers.
  // Slug-based routing is the portable template default.
  return prisma.business.findUnique({ where: { slug: hostname } })
}

/** Resolve the authenticated dashboard tenant; never falls back to demo in production. */
export async function getAuthenticatedBusiness() {
  if (appConfig.isDemo) return DEMO_BUSINESS
  const businessId = await getAuthenticatedBusinessId()
  if (!businessId) return null
  return prisma.business.findUnique({ where: { id: businessId } })
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
  if (appConfig.isDemo) return DEMO_BUSINESS_ID
  const businessId = await getAuthenticatedBusinessId()
  if (!businessId) throw new Error('Authenticated business could not be resolved')
  return businessId
}
