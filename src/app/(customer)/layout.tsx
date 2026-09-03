export const dynamic = 'force-dynamic'

import { DEMO_BUSINESS } from '@/lib/demo-data'
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
  const business = DEMO_BUSINESS

  // Fetch SEO settings (mock prisma will return demo SEO)
  const seo = await prisma.businessSEO.findUnique({
    where: { businessId: business.id },
  }).catch(() => null)

  const isDark = (business.themeMode || 'dark') === 'dark'

  return (
    <div className={`min-h-screen ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'} flex flex-col font-sans pb-16 md:pb-0`}
         style={{ ['--accent' as any]: business.accentColor }}>
      <ThemeStyle business={business as any} />
      <SEO business={business as any} seo={seo as any} />
      <Navbar
        businessName={business.name}
        logo={business.logo}
        phone={business.phone}
      />
      <main className="flex-1">{children}</main>
      <Footer business={business as any} />
      <MobileBottomNav />
    </div>
  )
}
