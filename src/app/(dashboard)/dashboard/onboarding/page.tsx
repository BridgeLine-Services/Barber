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

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
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
  })

  // Auto-generate slug from business name
  useEffect(() => {
    if (form.businessName) {
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
      const res = await fetch('/api/dashboard/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setDone(true)
        toast({
          title: 'Shop created!',
          description: 'Your shop is ready. Redirecting to dashboard...',
        })
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 1500)
      } else {
        toast({
          title: 'Setup failed',
          description: data.error || 'Something went wrong',
          variant: 'destructive',
        })
        setSubmitting(false)
      }
    } catch (err) {
      toast({
        title: 'Network error',
        description: 'Failed to connect. Please try again.',
        variant: 'destructive',
      })
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Shop Created!</h2>
          <p className="text-zinc-400">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 mb-4">
          <Store className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">Set Up Your Shop</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Tell us about your barbershop. You can change everything later in Settings.
        </p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-zinc-300">Shop Name *</Label>
              <Input
                id="businessName"
                placeholder="Fresh Cuts Barbershop"
                value={form.businessName}
                onChange={(e) => setForm(f => ({ ...f, businessName: e.target.value }))}
                required
                className="bg-zinc-950 border-zinc-800"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-zinc-300">URL Slug *</Label>
              <Input
                id="slug"
                placeholder="fresh-cuts-barbershop"
                value={form.slug}
                onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                required
                pattern="[a-z0-9-]+"
                className="bg-zinc-950 border-zinc-800"
              />
              <p className="text-xs text-zinc-500">Lowercase letters, numbers, and hyphens only.</p>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Business Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="shop@example.com"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-zinc-300">Phone *</Label>
                <Input
                  id="phone"
                  placeholder="(555) 123-4567"
                  value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  required
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-zinc-300">Street Address *</Label>
              <Input
                id="address"
                placeholder="123 Main Street"
                value={form.address}
                onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                required
                className="bg-zinc-950 border-zinc-800"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-zinc-300">City *</Label>
                <Input
                  id="city"
                  placeholder="Springfield"
                  value={form.city}
                  onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                  required
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-zinc-300">State *</Label>
                <Input
                  id="state"
                  placeholder="IL"
                  value={form.state}
                  onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))}
                  required
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode" className="text-zinc-300">ZIP *</Label>
                <Input
                  id="zipCode"
                  placeholder="62701"
                  value={form.zipCode}
                  onChange={(e) => setForm(f => ({ ...f, zipCode: e.target.value }))}
                  required
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-zinc-300">Timezone *</Label>
              <select
                id="timezone"
                value={form.timezone}
                onChange={(e) => setForm(f => ({ ...f, timezone: e.target.value }))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-zinc-100"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold h-11"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating your shop...</>
              ) : (
                'Create My Shop'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
