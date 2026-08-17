import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function PortalPage({ searchParams }: { searchParams: { shop?: string } }) {
  let business: any = null
  try {
    if (searchParams.shop) {
      business = await prisma.business.findFirst({
        where: { slug: searchParams.shop },
      })
    } else {
      business = await prisma.business.findFirst()
    }
  } catch (error) {
    console.error('Failed to load business:', error)
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
          <p className="text-gray-400">We couldn't find the business you're looking for.</p>
        </div>
      </div>
    )
  }

  const { CustomerPortal } = await import('@/components/customer/CustomerPortal')

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <CustomerPortal businessId={business.id} businessName={business.name} />
    </div>
  )
}
