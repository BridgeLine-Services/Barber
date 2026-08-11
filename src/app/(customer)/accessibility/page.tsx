export const dynamic = 'force-dynamic'

import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Accessibility, ArrowLeft, Mail, Phone, MapPin, CheckCircle, ShieldCheck } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  const business = await prisma.business.findFirst().catch(() => null)
  const businessName = business?.name || 'Fade Factory'
  return {
    title: `Accessibility Statement | ${businessName}`,
    description: `Accessibility commitment and digital standards for ${businessName}. Learn how we ensure our website is accessible to everyone.`,
  }
}

export default async function AccessibilityStatementPage() {
  const business = await prisma.business.findFirst().catch(() => null)
  const businessName = business?.name || 'Fade Factory'
  const businessEmail = business?.email || 'accessibility@fadefactory.com'
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
              <Accessibility className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-poppins">
                Accessibility Statement
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                {businessName} • Digital Accessibility Commitment
              </p>
            </div>
          </div>
          <p className="text-zinc-300 text-lg leading-relaxed mt-4">
            <strong className="text-amber-400">{businessName}</strong> is committed to guaranteeing digital accessibility for all users, including people with disabilities. We continually enhance user experience for everyone and apply relevant accessibility standards.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-zinc-300 text-base leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> 1. Commitment to Accessibility
            </h2>
            <p>
              We believe that the web should be available and accessible to anyone. We strive to adhere strictly to web accessibility standards and ensure our online booking system provides equal access to individuals of all abilities, regardless of assistive technology utilized.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> 2. Standards Followed
            </h2>
            <p>
              Our web design and development team aims to align with the <strong className="text-white">Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> standards. These guidelines define requirements to make web content more accessible to people with visual, hearing, cognitive, and motor disabilities.
            </p>
            <p className="text-sm text-zinc-400">
              Key accessibility implementation practices across our platform include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-300">
              <li><strong className="text-white">Keyboard Navigation:</strong> Fully operable interface elements with standard tab focus indicators.</li>
              <li><strong className="text-white">High Contrast & Aesthetic:</strong> High contrast color pairings for text elements to improve readability.</li>
              <li><strong className="text-white">ARIA Labels:</strong> Screen reader attributes applied to interactive widgets, modals, and appointment selection forms.</li>
              <li><strong className="text-white">Responsive Scaling:</strong> Fluid layouts that adapt without horizontal scrolling when zoomed up to 200%.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-amber-400 font-poppins border-b border-zinc-800 pb-2">
              3. Known Limitations & Continuous Improvement
            </h2>
            <p>
              Despite our efforts to make all content and features fully accessible, some items may occasionally undergo updates or rely on third-party dependencies (such as map widgets or external calendar tools).
            </p>
            <p>
              We continuously audit our web workflows to identify potential accessibility gaps and remedy them promptly.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4 bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-zinc-300 mt-8">
            <h2 className="text-xl font-semibold text-amber-400 font-poppins mb-3">
              4. Contact for Accessibility Issues & Assistance
            </h2>
            <p className="mb-4">
              If you experience difficulty accessing any part of our website or booking system, or if you require assistance placing a booking using assistive tools, please contact us directly:
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
            <p className="text-xs text-zinc-400 mt-4">
              We aim to respond to accessibility inquiries within 1-2 business days and offer alternative booking solutions by telephone or in person.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
