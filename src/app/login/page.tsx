'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Scissors, Lock, Mail, AlertCircle, ArrowRight, ServerCrash } from 'lucide-react'
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

  // Check for NextAuth error params (Configuration, Verification, etc.)
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'Configuration') {
      setError('Server configuration error. The database may not be connected. Please contact the site administrator to set up DATABASE_URL and NEXTAUTH_SECRET environment variables.')
    } else if (errorParam === 'Verification') {
      setError('The sign in link is no longer valid. It may have already been used or it has expired.')
    } else if (errorParam === 'AccessDenied') {
      setError('Access denied. You do not have permission to access the dashboard.')
    } else if (errorParam === 'Default') {
      setError('Authentication error. Please try again.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Check if it's a configuration error
        if (result.error === 'Configuration') {
          setError('Server configuration error. The database may not be connected. Please contact the site administrator.')
        } else {
          setError('Invalid email or password. Please try again.')
        }
        setLoading(false)
      } else if (result?.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setError('An unexpected error occurred. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      setError('Failed to connect to the server. Please check your network connection and try again.')
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
            Sign in to manage appointments, schedule & customers
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-zinc-900/90 border border-zinc-800 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-3.5 rounded-lg bg-red-950/50 border border-red-800/50 text-red-300 text-sm flex items-start gap-3">
              {error.includes('configuration') || error.includes('database') ? (
                <ServerCrash className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              )}
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300 text-xs font-medium uppercase tracking-wider">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="barber@shop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300 text-xs font-medium uppercase tracking-wider">
                  Password
                </Label>
                <a
                  href="#reset"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('Please contact your shop owner or manager to reset your password.')
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20 h-11"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold h-11 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 pt-5 border-t border-zinc-800/60">
            <p className="text-xs text-zinc-500 text-center">
              Demo login requires a connected database. Seed with:{' '}
              <span className="text-zinc-400">owner@fadefactory.com</span> / <span className="text-zinc-400">password123</span>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-zinc-600 mt-8 space-y-2">
          <p>Multi-Tenant Barber Shop Operating System</p>
          <a href="/" className="text-zinc-500 hover:text-amber-400 transition-colors">
            ← Back to Website
          </a>
        </div>
      </div>
    </div>
  )
}
