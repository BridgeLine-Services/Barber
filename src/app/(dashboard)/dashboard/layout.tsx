import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  const businessId = user.businessId
  const userRole = user.role

  // If the owner has no business yet, redirect to the shop creation page.
  // Barbers always have a businessId (they're created by an owner who already
  // has a shop), so this redirect only applies to newly-registered owners.
  if (!businessId && userRole === 'OWNER') {
    redirect('/dashboard/create-shop')
  }

  let business = null
  if (businessId) {
    try {
      business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { name: true, logo: true, primaryColor: true, accentColor: true },
      })
    } catch (error) {
      console.error('Failed to load business data:', error)
    }
  }

  const businessName = business?.name || user.businessName || 'Barber Shop'
  const userName = user.name || user.email || 'User'

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col lg:flex-row">
      {/* Sidebar Component */}
      <Sidebar
        userName={userName}
        userRole={userRole}
        businessName={businessName}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-zinc-950 border-b border-zinc-800 sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-bold text-zinc-100">{businessName}</h1>
            <p className="text-xs text-zinc-400">Shop Management Portal</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-zinc-200">{userName}</p>
              <span className="inline-block text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full capitalize">
                {userRole.toLowerCase()}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
              {userName[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-zinc-900 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
