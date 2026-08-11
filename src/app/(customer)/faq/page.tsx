export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about booking, payments, cancellations, parking, and shop policies.',
}

const FAQS = [
  {
    category: 'Booking & Appointments',
    questions: [
      {
        q: 'How do I book an appointment?',
        a: 'You can easily book online in under 60 seconds through our website. Select your desired service, choose your preferred barber (or first available), pick a date and time, and enter your contact details. You will receive an instant confirmation.',
      },
      {
        q: 'Can I choose a specific barber?',
        a: 'Yes! When booking online, you can browse all active barbers, view their specialties and availability, and choose your favorite. If you have no preference, select "First Available Barber".',
      },
      {
        q: 'How far in advance can I book?',
        a: 'Appointments can be booked up to 30 days in advance online. For advance group bookings or special events, please contact us directly.',
      },
      {
        q: 'Can I reschedule or cancel my appointment?',
        a: 'Yes. If you need to reschedule or cancel, please provide at least 2 hours advance notice using your confirmation link or by calling us directly.',
      },
    ],
  },
  {
    category: 'Payments & Pricing',
    questions: [
      {
        q: 'Do I need to enter a credit card to book?',
        a: 'No! We do not require or collect online payments. You pay in person at the shop after your appointment is completed.',
      },
      {
        q: 'What payment methods do you accept at the shop?',
        a: 'We accept Cash, Debit Cards, Credit Cards (Visa, MasterCard, American Express), Apple Pay, Google Pay, and contactless tap payments.',
      },
      {
        q: 'Are prices subject to change?',
        a: 'Listed prices reflect standard service costs. Any custom add-ons or special requests discussed during your consultation will be clarified before service begins.',
      },
    ],
  },
  {
    category: 'Shop Info & Policies',
    questions: [
      {
        q: 'Do you accept walk-ins?',
        a: 'Yes! Walk-ins are always welcome based on chair availability. However, we strongly recommend booking an appointment online to guarantee your preferred time slot with zero wait time.',
      },
      {
        q: 'What happens if I run late?',
        a: 'If you are running more than 10 minutes late, please call us. We will do our best to accommodate you, but may need to adjust your service duration to keep the schedule on time for other clients.',
      },
      {
        q: 'Is parking available at the shop?',
        a: 'Yes, we have free client parking available in the dedicated lot directly behind our building, as well as metered street parking upfront.',
      },
      {
        q: 'Do you cut children’s hair?',
        a: 'Yes! We provide specialized Kids Haircuts for children aged 3 and above in a safe, patient, and friendly environment.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="border-amber-500/40 text-amber-400 px-3 py-1">
          Help Center
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-poppins">
          Frequently Asked Questions
        </h1>
        <p className="text-zinc-400 text-base leading-relaxed max-w-2xl mx-auto">
          Have a question about booking, payments, or shop policies? Find quick answers below.
        </p>
      </div>

      {/* FAQ Sections */}
      <div className="space-y-10">
        {FAQS.map((cat, idx) => (
          <div key={idx} className="space-y-4">
            <h2 className="text-xl font-bold text-amber-400 font-poppins flex items-center gap-2 border-b border-zinc-800 pb-2">
              <HelpCircle className="h-5 w-5" />
              {cat.category}
            </h2>

            <div className="space-y-3">
              {cat.questions.map((item, qIdx) => (
                <details
                  key={qIdx}
                  className="group rounded-xl bg-zinc-900 border border-zinc-800 p-5 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-white group-open:text-amber-400 transition">
                    <span>{item.q}</span>
                    <span className="ml-2 shrink-0 text-amber-400 font-bold text-xl group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-zinc-300 leading-relaxed pl-1 border-l-2 border-amber-500/40">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Need More Help Banner */}
      <Card className="bg-zinc-900 border-zinc-800 p-8 text-center space-y-4">
        <h3 className="text-xl font-bold text-white font-poppins">Still Have Questions?</h3>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto">
          If you couldn&apos;t find the answer you were looking for, feel free to give us a call or send us a message directly.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold">
            <Link href="/contact">Contact Us</Link>
          </Button>
          <Button asChild variant="outline" className="border-zinc-700 text-zinc-200 hover:bg-zinc-800">
            <Link href="/book">Book Appointment</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
