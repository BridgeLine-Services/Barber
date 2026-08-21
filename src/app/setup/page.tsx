'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Scissors, Loader2, CheckCircle2, AlertCircle, Mail, Lock, User } from 'lucide-react'

export default function SetupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [checking, setChecking] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(true)
  const [dbError, setDbError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const [form, setForm] = useState({
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerPasswordConfirm: '',
  })

  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/setup')
      .then(r => r.json())
      .then(data => {
        setNeedsSetup(data.needsSetup)
        setDbError(data.dbError || null)
        setChecking(false)
      })
      .catch(() => {
        setDbError('Failed to check setup status. The database may not be connected.')
        setChecking(false)
      })
  }, [])

  const validatePassword = () => {
    if (form.ownerPassword !== form.ownerPasswordConfirm) {
      setPasswordError('Passwords do not match')
      return false
    }
    if (form.ownerPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return false
    }
    setPasswordError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePassword()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName: form.ownerName,
          ownerEmail: form.ownerEmail,
          ownerPassword: form.ownerPassword,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setDone(true)
        toast({ title: 'Owner account created!' })
      } else {
        toast({ title: 'Setup failed', description: data.error || data.detail, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Network error during setup', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (dbError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 px-4">
        <Card className="bg-zinc-900 border-zinc-800 max-w-lg w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-white">
              <AlertCircle className="h-6 w-6 text-amber-500" />
              Database Not Connected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-zinc-400">
            <p>
              The database isn&apos;t connected yet. To fix this:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Go to your Vercel project → <strong className="text-white">Storage</strong> tab</li>
              <li>Click <strong className="text-white">Create Database</strong> → Postgres</li>
              <li>Vercel will automatically add <code className="bg-zinc-800 px-1 rounded text-amber-400">DATABASE_URL</code> to your env vars</li>
              <li>Go to <strong className="text-white">Deployments</strong> → click the latest → <strong className="text-white">Redeploy</strong></li>
              <li>Come back to this page once the redeploy finishes</li>
            </ol>
            <p className="text-xs text-zinc-500">
              Once the database is connected, this page lets you create your owner account.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!needsSetup && !done) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 px-4">
        <Card className="bg-zinc-900 border-zinc-800 max-w-lg w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <h1 className="text-xl font-bold text-white">Already Set Up</h1>
            <p className="text-zinc-400">An owner account already exists. Log in to manage your shop.</p>
            <Button onClick={() => router.push('/login')} className="bg-amber-500 text-black hover:bg-amber-400">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 px-4">
        <Card className="bg-zinc-900 border-zinc-800 max-w-lg w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <h1 className="text-2xl font-bold text-white">Account Created!</h1>
            <p className="text-zinc-400">
              Your owner account is ready. Log in to start building your shop.
            </p>
            <Button onClick={() => router.push('/login')} className="bg-amber-500 text-black hover:bg-amber-400">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
            Create Your Owner Account
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Set up your account first — you&apos;ll build your shop after logging in.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-zinc-900/90 border border-zinc-800 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="ownerName" className="text-zinc-300 text-xs font-medium uppercase tracking-wider">
                Your Name
              </Label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input
                  id="ownerName"
                  type="text"
                  placeholder="John Doe"
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  required
                  className="pl-10 bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerEmail" className="text-zinc-300 text-xs font-medium uppercase tracking-wider">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input
                  id="ownerEmail"
                  type="email"
                  placeholder="owner@shop.com"
                  value={form.ownerEmail}
                  onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                  required
                  className="pl-10 bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerPassword" className="text-zinc-300 text-xs font-medium uppercase tracking-wider">
                Password
              </Label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input
                  id="ownerPassword"
                  type="password"
                  placeholder="••••••••"
                  value={form.ownerPassword}
                  onChange={(e) => {
                    setForm({ ...form, ownerPassword: e.target.value })
                    if (passwordError) validatePassword()
                  }}
                  required
                  className="pl-10 bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerPasswordConfirm" className="text-zinc-300 text-xs font-medium uppercase tracking-wider">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input
                  id="ownerPasswordConfirm"
                  type="password"
                  placeholder="••••••••"
                  value={form.ownerPasswordConfirm}
                  onChange={(e) => {
                    setForm({ ...form, ownerPasswordConfirm: e.target.value })
                    if (passwordError) validatePassword()
                  }}
                  required
                  className="pl-10 bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20 h-11"
                />
              </div>
            </div>

            {passwordError && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                {passwordError}
              </p>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold h-11 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-zinc-600 mt-8 space-y-2">
          <p>Barber Shop Operating System — Template Edition</p>
          <a href="/login" className="text-zinc-500 hover:text-amber-400 transition-colors">
            Already have an account? Sign in →
          </a>
        </div>
      </div>
    </div>
  )

}
