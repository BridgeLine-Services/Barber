'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Demo mode: setup is not needed. Redirect to login.
export default function SetupPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">
      <p className="text-zinc-400">Redirecting to login...</p>
    </div>
  )
}
