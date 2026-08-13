export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDuration, formatPrice } from '@/lib/utils'
import { PAYMENT_DISCLAIMER } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, CreditCard, Scissors } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Services & Pricing',
  description: 'View our full service menu and prices. Book your appointment online and pay in person.',
}

export const revalidate = 60

export default async function ServicesPage() {
  let services: any[] = []
  let dbError = false

  try {
    const business = await prisma.business.findFirst({ orderBy: { createdAt: 'asc' } })
    if (business) {
      services = await prisma.service.findMany({
        where: { businessId: business.id, isActive: true },
        orderBy: { order: 'asc' },
      })
    }
  } catch (error) {
    console.error('Failed to load services:', error)
    dbError = true
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="border-amber-500/40 text-amber-400 px-3 py-1">
          Service Menu
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-poppins">
          Barbering Services & Pricing
        </h1>
        <p className="text-zinc-400 text-base leading-relaxed">
          From classic precision haircuts to luxury beard sculpting and hot towel shaves. All services include consultation and style finishing.
        </p>
      </div>

      {/* Services Grid */}
      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-white font-bold group-hover:text-amber-400 transition-colors">
                      {service.name}
                    </CardTitle>
                    <CardDescription className="text-zinc-400 text-xs flex items-center gap-1.5 mt-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      {formatDuration(service.duration)}
                    </CardDescription>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black text-amber-400">
                      {formatPrice(service.price)}
                    </div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                      Pay in Person
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="text-sm text-zinc-300 py-3 leading-relaxed flex-1">
                {service.description || 'Professional barbering service tailored to your style preferences.'}
              </CardContent>

              <CardFooter className="pt-4 border-t border-zinc-800/60">
                <Button
                  asChild
                  className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition shadow-sm"
                >
                  <Link href={`/book?serviceId=${service.id}`}>Book This Service</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Scissors className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">Services Coming Soon</h3>
            <p className="text-zinc-400 text-sm max-w-md">
              {dbError
                ? 'We are setting up our online booking system. Please call or visit us in person to schedule your appointment.'
                : 'Our service menu is being updated. Check back soon or contact us directly for current pricing and availability.'}
            </p>
          </div>
          <Button asChild className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      )}

      {/* Payment Disclaimer Banner */}
      <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">In-Person Payment Notice</p>
            <p className="text-xs text-zinc-400 mt-0.5">{PAYMENT_DISCLAIMER}</p>
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          className="border-zinc-700 text-zinc-200 hover:bg-zinc-800 shrink-0"
        >
          <Link href="/book">Reserve Time Slot</Link>
        </Button>
      </div>
    </div>
  )
}
