import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Calendar, ArrowLeft, Mail, Phone, MapPin, Clock, AlertTriangle, CheckCircle, CreditCard, Users } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  const business = await prisma.business.findFirst().catch(() => null)
  const businessName = business?.name || 'Fade Factory'
  return {
    title: `Booking Policy | ${businessName}`,
    description: `Booking rules, cancellation terms, late arrival policies, and scheduling options at ${businessName}.`,
  }
}

export default async function BookingPolicyPage() {
  const business = await prisma.business.findFirst().catch(() => null)
  const businessName = business?.name || 'Fade Factory'
  const businessEmail = business?.email || 'booking@fadefactory.com'
  const businessPhone = business?.phone || '(555) 123-4567'
  const businessAddress = business?.address
    ? `${business.address}, ${business.city || ''}, ${business.state || ''} ${business.zipCode || ''}`.trim()
    : '123 Main Street, Suite 100, Los Angeles, CA 90012'

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-zinc-800 pb-8 mb-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-poppins">
                Booking Policy
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                {businessName} • Appointment & Reservation Guidelines
              </p>
            </div>
          </div>
          <p className="text-zinc-300 text-lg leading-relaxed mt-4">
            At <strong className="text-amber-400">{businessName}</strong>, we strive to deliver an exceptional, punctual barbershop experience for every client. To ensure smooth operations and honor everyone’s schedule, please review our booking terms below.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-zinc-300 text-base leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> 1. How to Book an Appointment
            </h2>
            <p>
              We offer multiple convenient options to reserve your haircut or beard grooming session with your preferred barber:
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2 text-lg">Online Booking</h3>
                <p className="text-sm text-zinc-400">
                  Select your service, barber, date, and time instantly 24/7 on our website in under 2 minutes.
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2 text-lg">By Phone</h3>
                <p className="text-sm text-zinc-400">
                  Call our shop at <span className="text-amber-400">{businessPhone}</span> during normal business hours.
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2 text-lg">Walk-In</h3>
                <p className="text-sm text-zinc-400">
                  Walk-ins are welcomed on a first-come, first-served basis, subject to barber availability.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              2. Appointment Confirmation
            </h2>
            <p>
              Once your online booking is successfully submitted:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-300">
              <li>An immediate email confirmation will be sent to the email address provided.</li>
              <li>Your confirmation email includes a unique tracking number (e.g., <span className="font-mono text-amber-400">BRB-8F42K</span>) and a direct link to manage or reschedule your appointment.</li>
              <li>If you selected SMS notifications during checkout, a reminder message will be sent to your mobile phone before your scheduled slot.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2 flex items-center gap-2">
              <Clock className="w-5 h-5" /> 3. Rescheduling Policy
            </h2>
            <p>
              We understand plans change! You can reschedule your appointment at no cost:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-300">
              <li>Rescheduling must be completed at least <strong className="text-white">2 hours</strong> before your scheduled start time.</li>
              <li>You can easily reschedule online by clicking the link in your confirmation email or by calling the shop directly.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              4. Cancellation Policy
            </h2>
            <p>
              If you need to cancel your appointment altogether, please provide us with at least <strong className="text-white">2 hours advance notice</strong>. This gives other clients the opportunity to book the open time slot and ensures our barbers maintain full schedules.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2 flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> 5. Late Arrival Policy
            </h2>
            <p>
              Punctuality is crucial to maintain high service standards for all clients:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-300">
              <li>Please arrive 5 minutes prior to your appointment time.</li>
              <li>If you arrive <strong className="text-white">5-10 minutes late</strong>, your barber will do their best to accommodate you, though your service may be adjusted to fit the remaining time.</li>
              <li>If you are more than <strong className="text-white">15 minutes late</strong>, your appointment may need to be marked as a missed slot or rescheduled so as not to delay subsequent clients.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              6. No-Show Policy
            </h2>
            <p>
              A "No-Show" occurs when a customer fails to arrive for an appointment without giving advance cancellation notice. Because empty time slots directly impact barber earnings:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-300">
              <li>First No-Show: A courteous email/SMS follow-up is recorded on your profile.</li>
              <li>Repeated No-Shows (2 or more): Online self-booking privileges may be suspended. Future bookings will require direct phone verification.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> 7. Payment Policy — Pay In Person
            </h2>
            <div className="p-4 bg-zinc-900 border border-amber-500/30 rounded-lg">
              <p className="text-zinc-200">
                <strong className="text-amber-400">No Online Payment Required:</strong> Booking online requires zero upfront credit card payments or reservation deposits. You pay directly at the shop after your service is completed.
              </p>
              <p className="text-sm text-zinc-400 mt-2">
                We accept Cash, Debit Cards, Major Credit Cards (Visa, MasterCard, Amex, Discover), and Mobile Contactless Payments (Apple Pay, Google Pay).
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2 flex items-center gap-2">
              <Users className="w-5 h-5" /> 8. Group & Multiple Bookings
            </h2>
            <p>
              If you wish to book back-to-back appointments for family members, groomsmen, or groups:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-300">
              <li>You may make separate online bookings for each person with their respective names and preferred services.</li>
              <li>For groups of 4 or more, please call us directly at <span className="text-amber-400">{businessPhone}</span> so we can coordinate multiple barbers simultaneously for your party.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section className="space-y-4 bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-zinc-300 mt-8">
            <h2 className="text-xl font-semibold text-amber-400 font-poppins mb-3">
              9. Contact for Booking Questions
            </h2>
            <p className="mb-4">
              Have questions about our booking policies or need help modifying a reservation?
            </p>
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Email: <a href={`mailto:${businessEmail}`} className="text-amber-400 hover:underline">{businessEmail}</a></span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Phone: {businessPhone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Address: {businessAddress}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
