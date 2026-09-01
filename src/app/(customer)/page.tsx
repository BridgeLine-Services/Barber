import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { resolveBusiness } from '@/lib/tenant'
import { formatDuration, formatPrice, getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Scissors,
  Calendar,
  Phone,
  MessageSquare,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

export const revalidate = 60

export default async function HomePage() {
  const business = await resolveBusiness().catch(() => null)

  if (!business) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Shop Not Configured</h1>
          <p className="text-muted-foreground">An administrator needs to run the setup process.</p>
        </div>
      </div>
    )
  }

  const [barbers, services, reviews] = await Promise.all([
    prisma.barber.findMany({
      where: { businessId: business.id, isActive: true },
      orderBy: { order: 'asc' },
    }),
    prisma.service.findMany({
      where: { businessId: business.id, isActive: true },
      orderBy: { order: 'asc' },
    }),
    prisma.review.findMany({
      where: { businessId: business.id, isFeatured: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ])

  const shopName = business?.name || 'Barber Shop'
  const shopPhone = business?.phone || ''
  const shopPhoneDigits = shopPhone.replace(/\D/g, '')
  const fullAddress = [business?.address, business?.city, business?.state, business?.zipCode]
    .filter(Boolean)
    .join(', ') || ''

  const hoursList = business?.hours && typeof business.hours === 'object'
    ? Object.entries(business.hours).map(([day, val]: [string, any]) => ({
        day: day.charAt(0).toUpperCase() + day.slice(1),
        hours: val?.isOff ? 'Closed' : `${val?.open || '09:00'} - ${val?.close || '18:00'}`,
      }))
    : [
        { day: 'Monday - Friday', hours: '9:00 AM - 7:00 PM' },
        { day: 'Saturday', hours: '9:00 AM - 6:00 PM' },
        { day: 'Sunday', hours: '10:00 AM - 4:00 PM' },
      ]

  return (
    <div className="space-y-16 lg:space-y-24 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-zinc-950 pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-zinc-800/60">
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 px-3 py-1 text-xs sm:text-sm inline-flex items-center gap-1.5 font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              Easy Online Booking
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-poppins leading-tight">
              Precision Cuts & <span className="text-amber-400">Master Grooming</span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
              {business?.aboutText ||
                `Experience top-tier craftsmanship at ${shopName}. From classic razor fades to precision beard styling, walk out looking and feeling sharp.`}
            </p>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-amber-500 text-zinc-950 hover:bg-amber-400 font-bold px-8 py-6 text-base shadow-lg shadow-amber-500/20"
              >
                <Link href="/book">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Your Appointment
                </Link>
              </Button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-zinc-700 bg-zinc-900/80 text-zinc-200 hover:bg-zinc-800 hover:text-white px-5 py-6 text-sm"
                >
                  <a href={`tel:${shopPhoneDigits}`}>
                    <Phone className="mr-2 h-4 w-4 text-amber-400" />
                    Call
                  </a>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-zinc-700 bg-zinc-900/80 text-zinc-200 hover:bg-zinc-800 hover:text-white px-5 py-6 text-sm"
                >
                  <a href={`sms:${shopPhoneDigits}`}>
                    <MessageSquare className="mr-2 h-4 w-4 text-amber-400" />
                    Text Us
                  </a>
                </Button>
              </div>
            </div>

            {/* Guarantees */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-zinc-400 border-t border-zinc-800/80 max-w-xl mx-auto">
              <div className="flex items-center justify-center gap-2 col-span-2 sm:col-span-1">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Instant Confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <Badge variant="outline" className="border-amber-500/40 text-amber-400 mb-2">
              Our Services
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-white font-poppins">
              Crafted Haircuts & Barbering Services
            </h2>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center text-sm font-semibold text-amber-400 hover:text-amber-300 transition mt-2 md:mt-0"
          >
            View All Services <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>

        {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.slice(0, 6).map((service) => (
            <Card key={service.id} className="bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-xl text-white font-semibold">{service.name}</CardTitle>
                  <span className="text-lg font-bold text-amber-400 shrink-0">
                    {formatPrice(service.price)}
                  </span>
                </div>
                <CardDescription className="text-zinc-400 text-xs flex items-center gap-1 mt-1">
                  <Clock className="h-3.5 w-3.5 text-zinc-500" />
                  {formatDuration(service.duration)}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-zinc-300 py-2 leading-relaxed flex-1">
                {service.description || 'Full haircut service with lineup, neck shave, and styling.'}
              </CardContent>
              <CardFooter className="pt-4 border-t border-zinc-800/60">
                <Button
                  asChild
                  className="w-full bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-100 font-semibold transition"
                  size="sm"
                >
                  <Link href={`/book?serviceId=${service.id}`}>Book Service</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Scissors className="h-7 w-7" />
          </div>
          <p className="text-zinc-400 text-sm">Our service menu is being updated. Check back soon!</p>
        </div>
        )}
      </section>

      {/* Meet the Barbers Section */}
      <section className="bg-zinc-900/50 py-16 border-y border-zinc-800/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <Badge variant="outline" className="border-amber-500/40 text-amber-400">
              The Team
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-white font-poppins">
              Meet Our Master Barbers
            </h2>
            <p className="text-zinc-400 text-sm">
              Skilled professionals dedicated to giving you the exact look you want.
            </p>
          </div>

          {barbers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {barbers.map((barber) => (
              <Card key={barber.id} className="bg-zinc-900 border-zinc-800 flex flex-col justify-between overflow-hidden group">
                <CardHeader className="text-center pb-2 pt-6">
                  <div className="mx-auto mb-3 relative">
                    <Avatar className="h-24 w-24 border-2 border-amber-500/30 ring-4 ring-zinc-950">
                      {barber.photo && <AvatarImage src={barber.photo} alt={barber.name} />}
                      <AvatarFallback className="bg-zinc-800 text-amber-400 font-bold text-xl">
                        {getInitials(barber.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl text-white font-bold">{barber.name}</CardTitle>
                  {barber.specialty && (
                    <p className="text-xs font-medium text-amber-400 mt-1">{barber.specialty}</p>
                  )}
                </CardHeader>
                <CardContent className="text-center text-zinc-400 text-sm py-2 px-6">
                  <p className="line-clamp-3 leading-relaxed">
                    {barber.bio || 'Expert in fades, tapers, razor line-ups, and luxury beard sculpting.'}
                  </p>
                </CardContent>
                <CardFooter className="pt-4 pb-6 px-6">
                  <Button
                    asChild
                    className="w-full bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-zinc-950 border border-amber-500/30 font-semibold transition"
                  >
                    <Link href={`/book?barberId=${barber.id}`}>Book with {barber.name.split(' ')[0]}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <p className="text-zinc-400 text-sm">Our team profiles are coming soon. Book with any available barber!</p>
            <Button asChild className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold">
              <Link href="/book">Book Now</Link>
            </Button>
          </div>
          )}
        </div>
      </section>

      {/* Featured Reviews Section */}
      {reviews.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <Badge variant="outline" className="border-amber-500/40 text-amber-400 mb-2">
                Client Testimonials
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-white font-poppins">
                What Our Clients Say
              </h2>
            </div>
            <Link
              href="/reviews"
              className="inline-flex items-center text-sm font-semibold text-amber-400 hover:text-amber-300 transition mt-2 md:mt-0"
            >
              See All Reviews <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <Card key={review.id} className="bg-zinc-900/80 border-zinc-800 p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-zinc-300 italic leading-relaxed">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{review.authorName}</span>
                  <span className="text-zinc-500">Verified Client</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Shop Info Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Address & Hours */}
          <Card className="bg-zinc-900 border-zinc-800 p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <Badge variant="outline" className="border-amber-500/40 text-amber-400 mb-2">
                  Visit Us
                </Badge>
                <h2 className="text-2xl font-bold text-white font-poppins">{shopName}</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Address</p>
                    <p className="text-sm text-zinc-400">{fullAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Phone</p>
                    <a href={`tel:${shopPhoneDigits}`} className="text-sm text-amber-400 hover:underline">
                      {shopPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                  <div className="w-full">
                    <p className="text-sm font-semibold text-white mb-2">Hours of Operation</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {hoursList.map((item, idx) => (
                        <div key={idx} className="flex justify-between p-2 rounded bg-zinc-950/60 border border-zinc-800">
                          <span className="text-zinc-400 font-medium">{item.day}</span>
                          <span className="text-amber-400 font-semibold">{item.hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800 mt-6 flex gap-4">
              <Button asChild className="flex-1 bg-amber-500 text-zinc-950 hover:bg-amber-400 font-bold">
                <Link href="/book">Book Appointment</Link>
              </Button>
              <Button asChild variant="outline" className="border-amber-500/30 text-amber-100 hover:bg-amber-500/10 hover:border-amber-500/50">
                <Link href="/contact">Get Directions</Link>
              </Button>
            </div>
          </Card>

          {/* Map Placeholder */}
          <Card className="bg-zinc-900 border-zinc-800 relative overflow-hidden flex flex-col justify-center items-center text-center p-8 min-h-[320px]">
            <div className="relative z-10 space-y-4 max-w-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <MapPin className="h-7 w-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white font-poppins">Interactive Shop Location</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Located at {fullAddress}. Check the shop details for current parking and access information.
              </p>
              <Button
                asChild
                variant="outline"
                className="border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 font-semibold"
              >
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shopName} ${fullAddress}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps
                </a>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <Badge variant="outline" className="border-amber-500/40 text-amber-400">
            Frequently Asked Questions
          </Badge>
          <h2 className="text-3xl font-bold text-white font-poppins">Got Questions?</h2>
        </div>

        <div className="space-y-4">
          <details className="group rounded-xl bg-zinc-900 border border-zinc-800 p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-white group-open:text-amber-400 transition">
              Do I need to pay online when I book?
              <span className="ml-2 shrink-0 text-amber-400 font-bold text-xl group-open:rotate-45 transition-transform">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              Your booking reserves your time slot. Payment details are provided by the shop and handled in person.
            </p>
          </details>

          <details className="group rounded-xl bg-zinc-900 border border-zinc-800 p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-white group-open:text-amber-400 transition">
              Can I request a specific barber?
              <span className="ml-2 shrink-0 text-amber-400 font-bold text-xl group-open:rotate-45 transition-transform">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              Yes, absolutely! When booking online, you can select your preferred barber or choose &quot;First Available&quot; if you need the quickest available time slot.
            </p>
          </details>

          <details className="group rounded-xl bg-zinc-900 border border-zinc-800 p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-white group-open:text-amber-400 transition">
              What is your cancellation policy?
              <span className="ml-2 shrink-0 text-amber-400 font-bold text-xl group-open:rotate-45 transition-transform">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              We ask for at least 2 hours advance notice if you need to cancel or reschedule your appointment so we can offer that slot to other clients.
            </p>
          </details>

          <details className="group rounded-xl bg-zinc-900 border border-zinc-800 p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-white group-open:text-amber-400 transition">
              Do you accept walk-ins?
              <span className="ml-2 shrink-0 text-amber-400 font-bold text-xl group-open:rotate-45 transition-transform">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              Availability varies by shop. Booking in advance is the best way to reserve your preferred time.
            </p>
          </details>
        </div>
      </section>

      {/* Final Booking CTA Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-amber-500 p-8 sm:p-12 text-center text-zinc-950 overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-poppins">
              Ready for Your Next Haircut?
            </h2>
            <p className="text-zinc-900 text-sm sm:text-base font-medium leading-relaxed">
              Book online in under 60 seconds. Choose your service, select your favorite barber, and pick a time that works for you.
            </p>
            <div className="pt-2">
              <Button
                asChild
                size="lg"
                className="bg-zinc-950 hover:bg-zinc-900 text-white font-bold px-8 py-6 text-base shadow-xl"
              >
                <Link href="/book">
                  <Calendar className="mr-2 h-5 w-5 text-amber-400" />
                  Book Your Appointment Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
