'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Scissors, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError('Authentication error. Please try again.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Invalid email or password.')
        setLoading(false)
        return
      }

      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
      router.push(callbackUrl)
      router.refresh()
    } catch (err) {
      setError('Failed to connect to the server. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 text-zinc-100">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-zinc-950 to-zinc-950 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 mb-4 shadow-lg shadow-amber-500/5">
            <Scissors className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-serif">
            Barber Dashboard
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Sign in to manage appointments, schedule &amp; customers
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-zinc-900/90 border border-zinc-800 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-3.5 rounded-lg bg-red-950/50 border border-red-800/50 text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300 text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@barbershop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-zinc-950/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-amber-500/20 pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300 text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-zinc-950/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-amber-500/20 pl-10"
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 text-zinc-950 hover:bg-amber-400 font-bold py-2.5 text-base shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Demo Credentials Hint */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 text-center mb-3">
              Demo credentials — edit in <code className="text-zinc-400">src/lib/demo-data.ts</code>
            </p>
            <div className="space-y-1.5 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span className="text-amber-400">Owner:</span>
                <span>owner@barbershop.demo / OwnerDemo123!</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-400">Barber 1:</span>
                <span>barber1@barbershop.demo / BarberOne123!</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-400">Barber 2:</span>
                <span>barber2@barbershop.demo / BarberTwo123!</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-400">Barber 3:</span>
                <span>barber3@barbershop.demo / BarberThree123!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
