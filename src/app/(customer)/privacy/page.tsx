export const dynamic = 'force-dynamic'
import { generatePageMetadata } from '@/lib/generate-page-metadata'

import type { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { resolveBusiness } from '@/lib/tenant'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    titleSuffix: "Privacy Policy",
    description: "Our privacy policy details how we collect, use, and protect your personal information.",
    path: "/privacy",
  })
}

export default async function PrivacyPolicyPage() {
  const business = await resolveBusiness().catch(() => null)
  const customPolicy = business?.privacyPolicy

  if (customPolicy) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-8">
        <div className="space-y-3">
          <Badge variant="outline" className="border-amber-500/40 text-amber-400">Legal & Compliance</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-poppins">Privacy Policy</h1>
          <p className="text-xs text-zinc-500">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
        </div>
        <Card className="bg-zinc-900 border-zinc-800 p-8 text-zinc-300 space-y-6 text-sm leading-relaxed">
          <div className="whitespace-pre-wrap">{customPolicy}</div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-8">
      <div className="space-y-3">
        <Badge variant="outline" className="border-amber-500/40 text-amber-400">
          Legal & Compliance
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-poppins">Privacy Policy</h1>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 p-8 text-zinc-300 space-y-4 text-sm leading-relaxed">
        <h2 className="text-lg font-bold text-white font-poppins">Policy not available</h2>
        <p>
          This business has not published a privacy policy yet. Please contact the shop directly if you have questions about how your information is handled.
        </p>
        <p className="text-zinc-500">
          Business owners should review and customize this policy for their location and services before publishing it.
        </p>
      </Card>

    </div>
  )
}
