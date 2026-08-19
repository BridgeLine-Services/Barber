export const dynamic = 'force-dynamic'

import { resolveBusiness } from '@/lib/tenant'
import { Navbar } from '@/components/customer/Navbar'
import { Footer } from '@/components/customer/Footer'
import { MobileBottomNav } from '@/components/customer/MobileBottomNav'
import { SEO } from '@/components/customer/SEO'

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const business = await resolveBusiness().catch(() => null)

  // No demo fallback in production — show setup message if no business
  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Shop Not Configured</h1>
          <p className="text-muted-foreground">
            No business has been set up yet. An administrator needs to run the setup process.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950 pb-16 md:pb-0">
      <SEO business={business} />
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
