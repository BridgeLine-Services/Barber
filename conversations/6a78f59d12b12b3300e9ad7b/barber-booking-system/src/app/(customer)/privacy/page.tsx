import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Shield, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  const business = await prisma.business.findFirst().catch(() => null)
  const businessName = business?.name || 'Fade Factory'
  return {
    title: `Privacy Policy | ${businessName}`,
    description: `Privacy policy and data handling terms for ${businessName}. Learn how we protect your personal information when booking appointments.`,
  }
}

export default async function PrivacyPolicyPage() {
  const business = await prisma.business.findFirst().catch(() => null)
  const businessName = business?.name || 'Fade Factory'
  const businessEmail = business?.email || 'privacy@fadefactory.com'
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
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-poppins">
                Privacy Policy
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                {businessName} • Last Updated: {lastUpdated}
              </p>
            </div>
          </div>
          <p className="text-zinc-300 text-lg leading-relaxed mt-4">
            At <strong className="text-amber-400">{businessName}</strong>, we respect your privacy and are committed to protecting the personal information you share with us through our booking system and website.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-zinc-300 text-base leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              1. Information We Collect
            </h2>
            <p>
              When you interact with our website or book an appointment at {businessName}, we collect information that allows us to fulfill your service requests and provide a personalized experience.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-300">
              <li>
                <strong className="text-white">Contact Information:</strong> Your first name, last name, email address, and phone number provided during the booking process.
              </li>
              <li>
                <strong className="text-white">Appointment Details:</strong> Selected barber, service types, appointment date and time, special instructions, or service preferences.
              </li>
              <li>
                <strong className="text-white">Technical & Usage Data:</strong> Basic browser information, IP address, device type, and referral logs automatically recorded when accessing our website for system security and diagnostic purposes.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              2. How We Use Your Information
            </h2>
            <p>
              We use the collected information solely for business operations and customer service purposes, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-300">
              <li>Scheduling, confirming, and managing your barber appointments.</li>
              <li>Sending automated booking confirmations, calendar invites, and appointment reminder notices via email or SMS.</li>
              <li>Notifying you of changes, delays, or emergency cancellations by your barber.</li>
              <li>Maintaining client service history to provide personalized haircuts and grooming preferences on future visits.</li>
              <li>Responding to customer inquiries, feedback, or support requests.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              3. Information Sharing & Disclosure
            </h2>
            <p>
              <strong className="text-white">We do not sell, rent, trade, or monetize your personal information to third parties.</strong>
            </p>
            <p>
              Your personal data is shared strictly with the following trusted entities:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-300">
              <li>
                <strong className="text-white">Assigned Barbers & Staff:</strong> Barbers at {businessName} receive access to your name, contact phone, and service notes to prepare for your appointment.
              </li>
              <li>
                <strong className="text-white">Infrastructure & Service Providers:</strong> Operational technology vendors who assist in running our database, website hosting, transactional email delivery (e.g. Nodemailer/SMTP), and messaging services. These providers are bound by strict confidentiality obligations.
              </li>
              <li>
                <strong className="text-white">Legal Obligations:</strong> We may disclose information if required to do so by applicable law, court order, or governmental regulation.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              4. Data Retention
            </h2>
            <p>
              We retain customer contact records and appointment history for as long as necessary to maintain client records, facilitate quick re-booking, and support legitimate internal business operations. If you wish to have your personal data permanently removed from our active databases, you may submit a deletion request as described in Section 6.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              5. SMS Communications & Consent
            </h2>
            <p>
              SMS messaging consent is collected separately from email communications. When you explicitly opt in to SMS notifications:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-300">
              <li>SMS messages are strictly transactional (appointment confirmations, reminders, and schedule updates).</li>
              <li>Message & data rates may apply depending on your mobile carrier.</li>
              <li>You may opt out of SMS messages at any time by replying <strong className="text-amber-400 font-mono">STOP</strong> to any message, or by contacting our team.</li>
              <li>Mobile opt-in information and phone numbers will never be shared with third parties for marketing purposes.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              6. Your Rights & Choices
            </h2>
            <p>
              Depending on your location, you possess the following privacy rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-300">
              <li><strong className="text-white">Right to Access:</strong> Request a copy of the personal information stored in our system.</li>
              <li><strong className="text-white">Right to Rectification:</strong> Request correction of inaccurate or outdated contact info.</li>
              <li><strong className="text-white">Right to Erasure:</strong> Request full deletion of your client profile and historical booking records.</li>
              <li><strong className="text-white">Opt-Out:</strong> Unsubscribe from marketing or non-essential communication streams at any time.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              7. Cookies & Tracking Technologies
            </h2>
            <p>
              Our website uses only essential session cookies and storage items required for core site functionality (such as keeping you logged in or preserving active booking selections). We do not use third-party cross-site advertising trackers or behavioral targeting scripts.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              8. Children's Privacy
            </h2>
            <p>
              Our online booking services are intended for use by adults aged 18 and older, or parents/guardians booking on behalf of minors. We do not knowingly collect personal information online directly from children under the age of 13.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              9. Security Measures
            </h2>
            <p>
              We enforce administrative, technical, and physical safeguards to guard against unauthorized access, alteration, disclosure, or destruction of your personal data. All standard web connections are encrypted over HTTPS (TLS/SSL), and passwords are cryptographically hashed.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              10. Changes to This Privacy Policy
            </h2>
            <p>
              We reserve the right to modify this Privacy Policy as our services evolve or legal compliance mandates. Any updates will be posted on this page with an updated "Last Updated" date.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-4 bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-zinc-300 mt-8">
            <h2 className="text-xl font-semibold text-amber-400 font-poppins mb-3">
              11. Contact Us for Privacy Requests
            </h2>
            <p className="mb-4">
              If you have any questions, concerns, or privacy requests regarding your personal information at {businessName}, please reach out:
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
