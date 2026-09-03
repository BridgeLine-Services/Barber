'use client'

// /onboarding — convenience alias for the onboarding wizard.
// The canonical route is /dashboard/onboarding (rendered inside the
// dashboard shell with the access gate); this redirect keeps the short
// URL working for anyone who expects it.

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/onboarding')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900 text-zinc-400 text-sm">
      Taking you to setup…
    </div>
  )
}
