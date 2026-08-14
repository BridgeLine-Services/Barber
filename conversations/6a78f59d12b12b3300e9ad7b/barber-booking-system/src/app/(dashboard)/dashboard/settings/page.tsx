'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Save, Building2, Phone, Mail, MapPin, Clock, Globe, Palette } from 'lucide-react'

const TIMEZONES = [
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
]

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [business, setBusiness] = useState<any>(null)

  useEffect(() => {
    fetch('/api/dashboard/settings')
      .then(r => r.json())
      .then(data => {
        setBusiness(data.business)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/dashboard/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(business),
      })
      const data = await res.json()
      if (data.business) {
        setBusiness(data.business)
        toast({ title: 'Settings saved successfully' })
      } else {
        toast({ title: 'Failed to save', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Failed to save settings', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-400">Loading settings...</p>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <p className="text-zinc-400">No business data found.</p>
          <p className="text-sm text-zinc-500">Run the seed script to create a business.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Business Settings</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage your shop information, branding, and policies.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-amber-500 text-black hover:bg-amber-400">
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Business Info */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-amber-500" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-400">Shop Name</Label>
              <Input
                value={business.name || ''}
                onChange={e => setBusiness({ ...business, name: e.target.value })}
                className="bg-zinc-800 border-zinc-700 mt-1"
              />
            </div>
            <div>
              <Label className="text-zinc-400">Timezone</Label>
              <select
                value={business.timezone || 'America/Los_Angeles'}
                onChange={e => setBusiness({ ...business, timezone: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label className="text-zinc-400">About Text</Label>
            <Textarea
              value={business.aboutText || ''}
              onChange={e => setBusiness({ ...business, aboutText: e.target.value })}
              className="bg-zinc-800 border-zinc-700 mt-1 min-h-[100px]"
              placeholder="Tell customers about your shop..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5 text-amber-500" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-400">Phone</Label>
              <Input
                value={business.phone || ''}
                onChange={e => setBusiness({ ...business, phone: e.target.value })}
                className="bg-zinc-800 border-zinc-700 mt-1"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label className="text-zinc-400">Email</Label>
              <Input
                type="email"
                value={business.email || ''}
                onChange={e => setBusiness({ ...business, email: e.target.value })}
                className="bg-zinc-800 border-zinc-700 mt-1"
                placeholder="shop@example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-amber-500" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-zinc-400">Street Address</Label>
            <Input
              value={business.address || ''}
              onChange={e => setBusiness({ ...business, address: e.target.value })}
              className="bg-zinc-800 border-zinc-700 mt-1"
              placeholder="123 Main St"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-zinc-400">City</Label>
              <Input
                value={business.city || ''}
                onChange={e => setBusiness({ ...business, city: e.target.value })}
                className="bg-zinc-800 border-zinc-700 mt-1"
              />
            </div>
            <div>
              <Label className="text-zinc-400">State</Label>
              <Input
                value={business.state || ''}
                onChange={e => setBusiness({ ...business, state: e.target.value })}
                className="bg-zinc-800 border-zinc-700 mt-1"
              />
            </div>
            <div>
              <Label className="text-zinc-400">ZIP</Label>
              <Input
                value={business.zipCode || ''}
                onChange={e => setBusiness({ ...business, zipCode: e.target.value })}
                className="bg-zinc-800 border-zinc-700 mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-amber-500" />
            Social Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="text-zinc-400">Instagram</Label>
              <Input
                value={business.instagram || ''}
                onChange={e => setBusiness({ ...business, instagram: e.target.value })}
                className="bg-zinc-800 border-zinc-700 mt-1"
                placeholder="@yourshop"
              />
            </div>
            <div>
              <Label className="text-zinc-400">Facebook</Label>
              <Input
                value={business.facebook || ''}
                onChange={e => setBusiness({ ...business, facebook: e.target.value })}
                className="bg-zinc-800 border-zinc-700 mt-1"
                placeholder="facebook.com/yourshop"
              />
            </div>
            <div>
              <Label className="text-zinc-400">TikTok</Label>
              <Input
                value={business.tiktok || ''}
                onChange={e => setBusiness({ ...business, tiktok: e.target.value })}
                className="bg-zinc-800 border-zinc-700 mt-1"
                placeholder="@yourshop"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-amber-500" />
            Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-zinc-400">Booking Policy</Label>
            <Textarea
              value={business.bookingPolicy || ''}
              onChange={e => setBusiness({ ...business, bookingPolicy: e.target.value })}
              className="bg-zinc-800 border-zinc-700 mt-1 min-h-[80px]"
              placeholder="Booking policy text shown to customers..."
            />
          </div>
          <div>
            <Label className="text-zinc-400">Cancellation Policy</Label>
            <Textarea
              value={business.cancellationPolicy || ''}
              onChange={e => setBusiness({ ...business, cancellationPolicy: e.target.value })}
              className="bg-zinc-800 border-zinc-700 mt-1 min-h-[80px]"
              placeholder="Cancellation policy text shown to customers..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
