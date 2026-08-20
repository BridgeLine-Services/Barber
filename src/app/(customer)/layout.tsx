export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { resolveBusiness } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/customer/Navbar'
import { Footer } from '@/components/customer/Footer'
import { MobileBottomNav } from '@/components/customer/MobileBottomNav'
import { SEO } from '@/components/customer/SEO'
import { ThemeStyle } from '@/components/customer/ThemeStyle'

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const business = await resolveBusiness().catch(() => null)

  // No business configured — redirect to first-run setup wizard
  if (!business) {
    redirect('/setup')
  }

  // Fetch SEO settings for this business
  const seo = await prisma.businessSEO.findUnique({
    where: { businessId: business.id },
  }).catch(() => null)

  const isDark = (business.themeMode || 'dark') === 'dark'

  return (
    <div className={`min-h-screen ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'} flex flex-col font-sans pb-16 md:pb-0`}
         style={{ ['--accent' as any]: business.accentColor }}>
      <ThemeStyle business={business} />
      <SEO business={business} seo={seo} />
      <Navbar
        businessName={business.name}
        logo={business.logo}
        phone={business.phone}
      />
      <main className="flex-1">{children}</main>
      <Footer business={business} />
      <MobileBottomNav />
    </div>
  )
}
