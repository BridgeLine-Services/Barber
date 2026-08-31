import { prisma } from '@/lib/prisma'
import { resolveBusiness } from '@/lib/tenant'
import { CustomerPortal } from '@/components/customer/CustomerPortal'

export const dynamic = 'force-dynamic'

export default async function PortalPage({ searchParams }: { searchParams: { shop?: string } }) {
  let business: any = null
  try {
    if (searchParams.shop) {
      business = await prisma.business.findUnique({ where: { slug: searchParams.shop } })
    } else {
      business = await resolveBusiness()
    }
  } catch (error) {
    console.error('Failed to load business:', error)
  }

  if (!business) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight font-poppins mb-4">
            Shop Not Found
          </h1>
          <p className="text-zinc-400 text-sm">
            This shop has not been set up yet. Please check your link and try again.
          </p>
        </div>
      </div>
    )
  }

  // Parse hours for display
  const hours = business.hours as Record<string, { open?: string; close?: string; isOff?: boolean }> | null
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  return (
    <>
      <CustomerPortal businessId={business.id} businessName={business.name} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-poppins mb-4">
          {business.name}
        </h1>
        <p className="text-zinc-400 text-base">
          {business.address}, {business.city}, {business.state} {business.zipCode}
        </p>
        <p className="text-zinc-400 text-base mt-2">{business.phone}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Business Hours */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8">
          <h2 className="text-xl font-bold text-white font-poppins mb-6">Business Hours</h2>
          <div className="space-y-2">
            {days.map((day) => {
              const dayHours = hours?.[day]
              return (
                <div key={day} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300 capitalize">{day}</span>
                  {dayHours?.isOff || !dayHours?.open ? (
                    <span className="text-zinc-500">Closed</span>
                  ) : (
                    <span className="text-zinc-200">
                      {dayHours.open} - {dayHours.close}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Services */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8">
          <h2 className="text-xl font-bold text-white font-poppins mb-6">Our Services</h2>
          <div className="space-y-3">
            {(() => {
              try {
                return (
                  <p className="text-zinc-400 text-sm">
                    Visit our booking page to see available services and schedule an appointment.
                  </p>
                )
              } catch {
                return <p className="text-zinc-500 text-sm">No services available.</p>
              }
            })()}
          </div>
          <div className="mt-6">
            <a
              href={`/book`}
              className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-6 py-3 text-sm font-bold text-zinc-950 hover:bg-amber-400 transition-colors"
            >
              Book Appointment
            </a>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
