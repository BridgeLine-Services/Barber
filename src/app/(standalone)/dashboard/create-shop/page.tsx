'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// In demo mode, the shop already exists (demo business).
// This page just redirects to the dashboard.
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
