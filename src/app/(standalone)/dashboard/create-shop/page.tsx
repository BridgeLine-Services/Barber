'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirects to the dashboard — shop creation is handled via onboarding.
export default function CreateShopPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">
      <p className="text-zinc-400">Redirecting to dashboard...</p>
    </div>
  )
}
