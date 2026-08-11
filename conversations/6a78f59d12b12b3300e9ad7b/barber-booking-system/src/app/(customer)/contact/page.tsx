export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { ContactForm } from '@/components/customer/ContactForm'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with us, find our location, view shop hours, or send us a message.',
}

export const revalidate = 60

export default async function ContactPage() {
  let business = null

  try {
    business = await prisma.business.findFirst({ orderBy: { createdAt: 'asc' } })
  } catch (error) {
    console.error('Failed to load contact page data:', error)
  }

  const shopName = business?.name || 'Executive Barber Shop'
  const phone = business?.phone || '(555) 123-4567'
  const email = business?.email || 'info@barbershop.com'
  const fullAddress = [business?.address, business?.city, business?.state, business?.zipCode]
    .filter(Boolean)
    .join(', ') || '123 Main Street, Suite 100, Downtown'

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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="border-amber-500/40 text-amber-400 px-3 py-1">
          Get In Touch
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-poppins">
          Contact {shopName}
        </h1>
        <p className="text-zinc-400 text-base leading-relaxed">
          Have questions about our services, walk-in availability, or custom group bookings? We&apos;re here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Shop Info Card */}
        <Card className="bg-zinc-900 border-zinc-800 p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white font-poppins mb-6">Location & Information</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Address</h3>
                  <p className="text-sm text-zinc-400 mt-0.5">{fullAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Phone</h3>
                  <a href={`tel:${phone.replace(/\D/g, '')}`} className="text-sm text-amber-400 hover:underline mt-0.5 inline-block">
                    {phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Email</h3>
                  <a href={`mailto:${email}`} className="text-sm text-amber-400 hover:underline mt-0.5 inline-block">
                    {email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-2 border-t border-zinc-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="w-full">
                  <h3 className="text-sm font-semibold text-white mb-3">Hours of Operation</h3>
                  <div className="space-y-1.5 text-xs">
                    {hoursList.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-zinc-800/60">
                        <span className="text-zinc-400 font-medium">{item.day}</span>
                        <span className="text-amber-400 font-semibold">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Form Card */}
        <Card className="bg-zinc-900 border-zinc-800 p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white font-poppins">Send Us a Message</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Fill out the form below and our team will get back to you within 24 hours.
            </p>
          </div>
          <ContactForm />
        </Card>
      </div>

      {/* Google Maps Embed / Card */}
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden p-0 relative">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-amber-400" />
            <span className="text-white font-semibold text-sm">{fullAddress}</span>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shopName} ${fullAddress}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-amber-400 hover:underline"
          >
            Open in Google Maps &rarr;
          </a>
        </div>
        {business?.latitude && business?.longitude ? (
          <iframe
            title="Shop Location Map"
            width="100%"
            height="350"
            style={{ border: 0, filter: 'grayscale(0.8) contrast(1.2) invert(0.9)' }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${business.latitude},${business.longitude}&z=15&output=embed`}
          />
        ) : (
          <iframe
            title="Shop Location Map"
            width="100%"
            height="350"
            style={{ border: 0, filter: 'grayscale(0.8) contrast(1.2) invert(0.9)' }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${encodeURIComponent(`${shopName} ${fullAddress}`)}&z=15&output=embed`}
          />
        )}
      </Card>
    </div>
  )
}
