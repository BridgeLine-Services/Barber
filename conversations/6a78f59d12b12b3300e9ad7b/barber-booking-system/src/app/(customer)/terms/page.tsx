import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { FileText, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  const business = await prisma.business.findFirst().catch(() => null)
  const businessName = business?.name || 'Fade Factory'
  return {
    title: `Terms of Service | ${businessName}`,
    description: `Terms of service and booking conditions for ${businessName}. Read about our shop policies, cancellations, and payment terms.`,
  }
}

export default async function TermsOfServicePage() {
  const business = await prisma.business.findFirst().catch(() => null)
  const businessName = business?.name || 'Fade Factory'
  const businessEmail = business?.email || 'terms@fadefactory.com'
  const businessPhone = business?.phone || '(555) 123-4567'
  const businessAddress = business?.address
    ? `${business.address}, ${business.city || ''}, ${business.state || ''} ${business.zipCode || ''}`.trim()
    : '123 Main Street, Suite 100, Los Angeles, CA 90012'
  const lastUpdated = 'August 9, 2026'

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
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-poppins">
                Terms of Service
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                {businessName} • Last Updated: {lastUpdated}
              </p>
            </div>
          </div>
          <p className="text-zinc-300 text-lg leading-relaxed mt-4">
            Welcome to <strong className="text-amber-400">{businessName}</strong>. Please review these Terms of Service carefully before booking an appointment or using our online services.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-zinc-300 text-base leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or placing a reservation through our website, mobile interface, or booking widgets, you agree to be bound by these Terms of Service and our associated Privacy Policy and Booking Policy. If you do not agree to these terms, you must refrain from using our online scheduling platform.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              2. Eligibility & Website Usage
            </h2>
            <p>
              To make a booking through our platform, you represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-300">
              <li>You are at least 18 years of age, or possess legal parental/guardian authorization to book on behalf of a minor.</li>
              <li>You provide true, accurate, current, and complete personal details (name, email address, phone number).</li>
              <li>You will not submit false, duplicate, or speculative appointment reservations.</li>
              <li>You will not attempt to hack, disrupt, reverse-engineer, or misuse the website infrastructure.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              3. Booking Terms & Availability
            </h2>
            <p>
              All online bookings are subject to availability and schedule confirmation:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-300">
              <li>An automated booking request does not constitute a guaranteed contract until confirmed by {businessName} or accompanied by a unique confirmation code (e.g. <span className="font-mono text-amber-400">BRB-XXXXX</span>).</li>
              <li>{businessName} reserves the right to adjust appointment times or reassign staff in unforeseen emergency circumstances, with prior customer notification.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              4. Payment Terms — In-Person Only
            </h2>
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30 text-zinc-200">
              <strong className="text-amber-400 block mb-1">Important Payment Policy:</strong>
              {businessName} does NOT require online payment or credit card processing to lock in your reservation. All fees for services rendered are due and payable <strong className="text-white">in person at the barbershop</strong> upon completion of your service. Accepted in-shop payment methods include Cash, Credit/Debit Cards, and mobile contactless options.
            </div>
            <p>
              Prices listed on our service menu are informational and subject to modification. Any add-on services requested in shop will be billed according to the current shop menu rate.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              5. Cancellation & Rescheduling Policy
            </h2>
            <p>
              We value both your time and our barbers' schedules. If you need to modify or cancel an appointment:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-300">
              <li>Please notify us or submit a cancellation via your confirmation email link at least <strong className="text-white">2 hours</strong> in advance.</li>
              <li>If you arrive more than <strong className="text-white">15 minutes late</strong>, your barber may need to shorten or reschedule your session to stay on schedule for other clients.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              6. No-Show Policy
            </h2>
            <p>
              Failing to arrive for a scheduled appointment without advance cancellation notice disrupts barber schedules. Repeated failure to show up ("No-Shows") twice or more may result in suspension of online booking privileges, requiring walk-in or telephone authorization for future visits.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              7. Service Descriptions & Menu Modifications
            </h2>
            <p>
              While we strive to portray exact service descriptions, durations, and estimates on our website, actual haircut time may vary depending on individual hair thickness, style complexity, or custom requests. {businessName} reserves the right to update service offerings and prices without prior notice.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              8. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by applicable law, {businessName}, its owners, employees, and independent contractors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or loss of time arising out of or related to website downtime, scheduling delays, or service dissatisfaction beyond the cost of the requested service.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              9. Indemnification
            </h2>
            <p>
              You agree to defend, indemnify, and hold harmless {businessName}, its affiliates, officers, and employees from any claims, liabilities, losses, or legal fees resulting from your violation of these Terms of Service or unauthorized use of our booking platform.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              10. Intellectual Property
            </h2>
            <p>
              All branding elements, logos, custom graphics, text content, software code, and interface assets on this website are the intellectual property of {businessName} or its technology licensors. Unauthorized copying or redistribution is strictly prohibited.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              11. Governing Law & Dispute Resolution
            </h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which {businessName} operates, without regard to its conflict of law principles. Any dispute arising under these Terms shall be resolved in local courts.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              12. Changes to Terms
            </h2>
            <p>
              We reserve the right to revise these Terms of Service at any time. Updated terms will be published directly on this website page. Your continued use of our booking platform after changes are posted constitutes acceptance of the modified Terms.
            </p>
          </section>

          {/* Section 13 */}
          <section className="space-y-4 bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-zinc-300 mt-8">
            <h2 className="text-xl font-semibold text-amber-400 font-poppins mb-3">
              13. Contact Information
            </h2>
            <p className="mb-4">
              Questions or comments regarding these Terms of Service should be directed to {businessName}:
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
