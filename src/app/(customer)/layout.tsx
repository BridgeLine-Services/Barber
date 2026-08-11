export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/customer/Navbar'
import { Footer } from '@/components/customer/Footer'
import { MobileBottomNav } from '@/components/customer/MobileBottomNav'
import { SEO } from '@/components/customer/SEO'

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let business = null
  try {
    business = await prisma.business.findFirst({
      orderBy: { createdAt: 'asc' },
    })
  } catch (error) {
    console.error('Failed to fetch business for customer layout:', error)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950 pb-16 md:pb-0">
      <SEO business={business} />
      <Navbar
        businessName={business?.name || 'Barber Shop'}
        logo={business?.logo}
        phone={business?.phone}
      />
      <main className="flex-1">{children}</main>
      <Footer business={business} />
      <MobileBottomNav />
    </div>
  )
}
