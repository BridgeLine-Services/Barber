'use client'

// /dashboard/onboarding — multi-step setup wizard for new barbershop owners.
// The dashboard access gate routes any owner with incomplete onboarding here.
// (A convenience redirect also exists at /onboarding.)

import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export default function OnboardingPage() {
  return (
    <div className="py-2">
      <OnboardingWizard />
    </div>
  )
}
