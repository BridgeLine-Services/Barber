'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Store, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

const TIMEZONES = [
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
]

export default function SetupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [checking, setChecking] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(true)
  const [dbError, setDbError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const [form, setForm] = useState({
    businessName: '',
    slug: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    timezone: 'America/New_York',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
  })

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

  // Auto-generate slug from business name
  useEffect(() => {
    if (form.businessName && !form.slug) {
      setForm(f => ({
        ...f,
        slug: f.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
      }))
    }
  }, [form.businessName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setDone(true)
        toast({ title: 'Shop configured successfully!' })
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
              Once the database is connected, this page becomes a setup wizard for your shop.
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
            <p className="text-zinc-400">Your shop is already configured. Log in to manage it.</p>
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
            <h1 className="text-2xl font-bold text-white">Setup Complete!</h1>
            <p className="text-zinc-400">
              Your shop is configured. You can now log in with your owner email and password.
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
    <div className="min-h-screen bg-zinc-950 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Store className="h-12 w-12 text-amber-500 mx-auto" />
          <h1 className="text-3xl font-bold text-white">First-Time Setup</h1>
          <p className="text-zinc-400">Configure your barbershop and create an admin account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Info */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">Shop Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-zinc-400">Business Name *</Label>
                <Input
                  required
                  value={form.businessName}
                  onChange={e => setForm({ ...form, businessName: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 mt-1"
                  placeholder="Mike's Cuts"
                />
              </div>
              <div>
                <Label className="text-zinc-400">URL Slug *</Label>
                <Input
                  required
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 mt-1"
                  placeholder="mikes-cuts"
                />
                <p className="text-xs text-zinc-500 mt-1">Lowercase letters, numbers, and hyphens only.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-400">Contact Email *</Label>
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 mt-1"
                    placeholder="info@mikescuts.com"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400">Phone *</Label>
                  <Input
                    required
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 mt-1"
                    placeholder="(555) 555-0100"
                  />
                </div>
              </div>
              <div>
                <Label className="text-zinc-400">Address *</Label>
                <Input
                  required
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 mt-1"
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-zinc-400">City *</Label>
                  <Input
                    required
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400">State *</Label>
                  <Input
                    required
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 mt-1"
                    placeholder="CA"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400">ZIP *</Label>
                  <Input
                    required
                    value={form.zipCode}
                    onChange={e => setForm({ ...form, zipCode: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 mt-1"
                    placeholder="90210"
                  />
                </div>
              </div>
              <div>
                <Label className="text-zinc-400">Timezone</Label>
                <select
                  value={form.timezone}
                  onChange={e => setForm({ ...form, timezone: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md mt-1 h-10 px-3 text-white"
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Owner Account */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">Admin Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-zinc-400">Your Name *</Label>
                <Input
                  required
                  value={form.ownerName}
                  onChange={e => setForm({ ...form, ownerName: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 mt-1"
                  placeholder="Mike Johnson"
                />
              </div>
              <div>
                <Label className="text-zinc-400">Owner Email (login) *</Label>
                <Input
                  required
                  type="email"
                  value={form.ownerEmail}
                  onChange={e => setForm({ ...form, ownerEmail: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 mt-1"
                  placeholder="mike@mikescuts.com"
                />
              </div>
              <div>
                <Label className="text-zinc-400">Password * (min 8 characters)</Label>
                <Input
                  required
                  type="password"
                  minLength={8}
                  value={form.ownerPassword}
                  onChange={e => setForm({ ...form, ownerPassword: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 mt-1"
                  placeholder="Choose a strong password"
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-500 text-black hover:bg-amber-400 font-bold py-3"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              'Complete Setup'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
