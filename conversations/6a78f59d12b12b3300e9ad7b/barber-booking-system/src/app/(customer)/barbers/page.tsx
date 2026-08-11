export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Scissors, Calendar, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Meet Our Barbers',
  description: 'Meet our team of professional barbers and book your next haircut with your favorite specialist.',
}

export const revalidate = 60

export default async function BarbersPage() {
  let barbers: any[] = []
  let dbError = false

  try {
    const business = await prisma.business.findFirst({ orderBy: { createdAt: 'asc' } })
    if (business) {
      barbers = await prisma.barber.findMany({
        where: { businessId: business.id, isActive: true },
        include: {
          services: {
            include: {
              service: true,
            },
          },
        },
        orderBy: { order: 'asc' },
      })
    }
  } catch (error) {
    console.error('Failed to load barbers:', error)
    dbError = true
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="border-amber-500/40 text-amber-400 px-3 py-1">
          Our Team
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-poppins">
          Master Barbers & Stylists
        </h1>
        <p className="text-zinc-400 text-base leading-relaxed">
          Each member of our team brings years of experience, attention to detail, and passion for precision cuts and classic grooming.
        </p>
      </div>

      {/* Barbers Grid */}
      {barbers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {barbers.map((barber) => (
            <Card key={barber.id} className="bg-zinc-900 border-zinc-800 flex flex-col justify-between overflow-hidden">
              <div>
                <CardHeader className="text-center pt-8 pb-4">
                  <div className="mx-auto mb-4 relative">
                    <Avatar className="h-28 w-28 border-2 border-amber-500/40 ring-4 ring-zinc-950">
                      {barber.photo && <AvatarImage src={barber.photo} alt={barber.name} />}
                      <AvatarFallback className="bg-zinc-800 text-amber-400 font-bold text-2xl">
                        {getInitials(barber.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-2xl text-white font-bold font-poppins">{barber.name}</CardTitle>
                  {barber.specialty && (
                    <p className="text-xs font-semibold text-amber-400 mt-1 uppercase tracking-wider">
                      {barber.specialty}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="px-6 space-y-4 text-sm">
                  <p className="text-zinc-300 leading-relaxed text-center italic">
                    &ldquo;{barber.bio || 'Dedicated to precision craftsmanship, clean line-ups, and legendary customer care.'}&rdquo;
                  </p>

                  {/* Services Offered */}
                  {barber.services && barber.services.length > 0 && (
                    <div className="pt-4 border-t border-zinc-800/80 space-y-2">
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Scissors className="h-3.5 w-3.5 text-amber-400" /> Services Offered:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {barber.services.map((bs: any) => (
                          <Badge
                            key={bs.serviceId}
                            variant="secondary"
                            className="bg-zinc-800/90 text-zinc-300 text-[11px] font-normal border border-zinc-700/60"
                          >
                            {bs.service.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>

              <CardFooter className="pt-6 pb-6 px-6 border-t border-zinc-800/60 mt-4">
                <Button
                  asChild
                  className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition shadow-sm"
                >
                  <Link href={`/book?barberId=${barber.id}`}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Book with {barber.name.split(' ')[0]}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Users className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">Our Team is Being Assembled</h3>
            <p className="text-zinc-400 text-sm max-w-md">
              {dbError
                ? 'We&apos;re setting up our online booking system. Please call or visit us in person to schedule your appointment.'
                : 'Our barber profiles are being updated. Check back soon or contact us to learn more about our team.'}
            </p>
          </div>
          <Button asChild className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
