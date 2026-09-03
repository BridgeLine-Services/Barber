export const dynamic = 'force-dynamic'

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

  // Public pages remain available while the owner is configuring the shop.
  // The resolved business is used when available; children are still rendered
  // when no record exists so setup state never becomes a public-site gate.
  const seo = business
    ? await prisma.businessSEO.findUnique({ where: { businessId: business.id } }).catch(() => null)
    : null
  const isDark = (business?.themeMode || 'dark') === 'dark'

  return (
    <div className={`min-h-screen ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'} flex flex-col font-sans pb-16 md:pb-0`}
         style={business ? { ['--accent' as any]: business.accentColor } : undefined}>
      {business && <ThemeStyle business={business} />}
      {business && <SEO business={business} seo={seo} />}
      {business && <Navbar businessName={business.name} logo={business.logo} phone={business.phone} />}
      <main className="flex-1">{children}</main>
      {business && <Footer business={business} />}
      {business && <MobileBottomNav />}
    </div>
  )
}
