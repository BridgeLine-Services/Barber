import { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Our privacy policy details how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-8">
      <div className="space-y-3">
        <Badge variant="outline" className="border-amber-500/40 text-amber-400">
          Legal & Compliance
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-poppins">Privacy Policy</h1>
        <p className="text-xs text-zinc-500">Last updated: August 2026</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 p-8 text-zinc-300 space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white font-poppins">1. Introduction</h2>
          <p>
            This Privacy Policy describes how our barber shop (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, discloses, and protects your personal information when you visit our website or book barbering services with us. We respect your privacy and are committed to protecting your personal data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white font-poppins">2. Information We Collect</h2>
          <p>We collect personal information that you voluntarily provide when making a booking, contacting us, or using our services. This includes:</p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li><strong className="text-zinc-200">Contact Information:</strong> First name, last name, phone number, and email address.</li>
            <li><strong className="text-zinc-200">Appointment Data:</strong> Selected barber, service requested, date, time, and optional notes provided during booking.</li>
            <li><strong className="text-zinc-200">Communication Preferences:</strong> Consent options for receiving automated SMS or email appointment reminders.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white font-poppins">3. How We Use Your Information</h2>
          <p>We use your personal data strictly for operational purposes, including:</p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li>Scheduling, confirming, and managing your barbering appointments.</li>
            <li>Sending automated appointment reminders via email or SMS (if opted in).</li>
            <li>Responding to customer inquiries, feedback, or support requests.</li>
            <li>Improving our service offerings and customer experience.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white font-poppins">4. No Online Payment Data Collected</h2>
          <p>
            We do not collect, store, or process credit card or bank account information on our website. All payments are collected in person at the shop at the time of your service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white font-poppins">5. Data Sharing & Disclosure</h2>
          <p>
            We do not sell, rent, or trade your personal information to third parties. We may share necessary information with trusted service providers (e.g., email or SMS notification gateways) solely to deliver appointment notifications on our behalf.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white font-poppins">6. Cookies & Tracking Technologies</h2>
          <p>
            Our website uses minimal session cookies and local storage necessary for core functionality (such as remembering user navigation state during booking). We do not track you across third-party websites.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white font-poppins">7. Your Rights & Data Choices</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li>Access the personal information we hold about you.</li>
            <li>Request corrections to inaccurate personal data.</li>
            <li>Opt out of marketing communications or appointment SMS notifications at any time.</li>
            <li>Request the deletion of your customer record from our database.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white font-poppins">8. Contact Information</h2>
          <p>
            If you have questions regarding this Privacy Policy or wish to exercise your data rights, please reach out to us via our Contact page or call the shop directly.
          </p>
        </section>
      </Card>
    </div>
  )
}
