'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, update } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Store, Save, AlertCircle, Loader2 } from 'lucide-react'

const TIMEZONES = [
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
]

export default function CreateShopPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    slug: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    timezone: 'America/New_York',
  })

  // Auto-generate slug from shop name
  useEffect(() => {
    if (form.name && !form.slug) {
      setForm(f => ({
        ...f,
        slug: f.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
      }))
    }
  }, [form.name])

  // If user already has a business, redirect to dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user && (session.user as any).businessId) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/dashboard/create-shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast({ title: 'Shop created successfully!' })

        // Update the session with the new businessId/businessName
        await update({
          businessId: data.business.id,
          businessName: data.business.name,
        })

        // Small delay to let session update propagate, then redirect
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 500)
      } else {
        toast({ title: 'Failed to create shop', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    // Middleware should handle this, but as a fallback
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 text-zinc-100">
      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 mb-4 shadow-lg shadow-amber-500/5">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100 font-serif">
            Let&apos;s Build Your Shop
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Enter your shop details below. You can change everything later from Dashboard → Settings.
          </p>
        </div>

        {/* Form */}
        <div className="bg-zinc-900/90 border border-zinc-800 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Shop Name + Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300 text-xs font-medium uppercase tracking-wider">
                  Shop Name *
                </Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20"
                  placeholder="Mike's Cuts"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-zinc-300 text-xs font-medium uppercase tracking-wider">
                  URL Slug *
                </Label>
                <Input
                  id="slug"
                  required
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                  className="bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20"
                  placeholder="mikes-cuts"
                />
                <p className="text-xs text-zinc-500">Lowercase letters, numbers, and hyphens only.</p>
              </div>
            </div>

            {/* Phone + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-zinc-300 text-xs font-medium uppercase tracking-wider">
                  Phone *
                </Label>
                <Input
                  id="phone"
                  required
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20"
                  placeholder="(555) 555-0100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300 text-xs font-medium uppercase tracking-wider">
                  Contact Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20"
                  placeholder="info@mikescuts.com"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-zinc-300 text-xs font-medium uppercase tracking-wider">
                Address *
              </Label>
              <Input
                id="address"
                required
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20"
                placeholder="123 Main Street"
              />
            </div>

            {/* City / State / ZIP */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-zinc-300 text-xs font-medium uppercase tracking-wider">
                  City *
                </Label>
                <Input
                  id="city"
                  required
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  className="bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-zinc-300 text-xs font-medium uppercase tracking-wider">
                  State *
                </Label>
                <Input
                  id="state"
                  required
                  value={form.state}
                  onChange={e => setForm({ ...form, state: e.target.value })}
                  className="bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20"
                  placeholder="CA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode" className="text-zinc-300 text-xs font-medium uppercase tracking-wider">
                  ZIP *
                </Label>
                <Input
                  id="zipCode"
                  required
                  value={form.zipCode}
                  onChange={e => setForm({ ...form, zipCode: e.target.value })}
                  className="bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500/20"
                  placeholder="90210"
                />
              </div>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-zinc-300 text-xs font-medium uppercase tracking-wider">
                Timezone
              </Label>
              <select
                id="timezone"
                value={form.timezone}
                onChange={e => setForm({ ...form, timezone: e.target.value })}
                className="w-full px-3 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-md text-zinc-100 text-sm focus:border-amber-500 focus:ring-amber-500/20"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold h-11 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating your shop...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Create My Shop</span>
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6">
          After creating your shop, you can customize branding, hours, services, and more from the dashboard.
        </p>
      </div>
    </div>
  )
