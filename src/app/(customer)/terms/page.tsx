import { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service and user agreements for using our website and booking appointments.',
}

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-8">
      <div className="space-y-3">
        <Badge variant="outline" className="border-amber-500/40 text-amber-400">
          Legal & Compliance
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-poppins">Terms of Service</h1>
        <p className="text-xs text-zinc-500">Last updated: August 2026</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 p-8 text-zinc-300 space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white font-poppins">1. Acceptance of Terms</h2>
          <p>
            By accessing or using our website and booking system, you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to all of these Terms, please do not use our website or online booking services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white font-poppins">2. Online Booking Terms</h2>
          <p>
            When you schedule an appointment through our website, you warrant that all information provided (name, phone number, email address) is truthful, accurate, and up to date.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li>Each booking reserves a specific barber time slot exclusively for you.</li>
            <li>You will receive an instant confirmation upon completing the booking steps.</li>
            <li>If you need to change your appointment date, time, or service, please use the provided rescheduling option or contact us directly.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white font-poppins">3. Payment Terms</h2>
          <p>
            All services are paid for in person at the shop after service completion.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li>No upfront payment or credit card is required to reserve a time slot online.</li>
            <li>Prices listed on our website are informational and represent standard service rates. Prices are subject to change.</li>
            <li>Accepted payment methods at the shop include Cash, Debit, Credit Cards, and contactless mobile payments.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white font-poppins">4. Cancellation & No-Show Policy</h2>
          <p>
            We value the time of both our clients and master barbers. We ask for a minimum of 2 hours advance notice if you need to cancel or reschedule your appointment.
          </p>
          <p className="text-zinc-400">
            Repeated failure to arrive for scheduled appointments without prior cancellation notice (&ldquo;No-Shows&rdquo;) may result in restrictions on your ability to make future online bookings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white font-poppins">5. Late Arrivals</h2>
          <p>
            Please arrive 5 minutes prior to your scheduled appointment. If you arrive more than 10 minutes late, your barber may need to shorten or reschedule your service to avoid delaying subsequent scheduled clients.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white font-poppins">6. Intellectual Property & Website Use</h2>
          <p>
            All content, brand logos, imagery, and text displayed on this website are the property of the business. You may not copy, reproduce, or distribute any material without express written authorization.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white font-poppins">7. Limitation of Liability</h2>
          <p>
            In no event shall the business, its owners, or employees be liable for any indirect, incidental, or consequential damages arising out of your use of our website, technical delays, or service cancellations caused by unforeseen emergencies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white font-poppins">8. Modifications to Terms</h2>
          <p>
            We reserve the right to update or modify these Terms at any time without prior notice. Continued use of our website following any updates constitutes acceptance of the revised Terms.
          </p>
        </section>
      </Card>
    </div>
  )
}
