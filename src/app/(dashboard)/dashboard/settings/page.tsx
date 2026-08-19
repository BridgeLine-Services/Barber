'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import {
  Save, Building2, Phone, Mail, MapPin, Clock, Globe, Palette,
  Search, FileText, Image as ImageIcon, Check
} from 'lucide-react'

const TIMEZONES = [
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
]

const FONTS = [
  { label: 'Default (System)', value: '' },
  { label: 'Poppins', value: 'poppins' },
  { label: 'Inter', value: 'inter' },
  { label: 'Montserrat', value: 'montserrat' },
]

type Tab = 'business' | 'branding' | 'social' | 'policies' | 'seo'

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [business, setBusiness] = useState<any>(null)
  const [seo, setSeo] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<Tab>('business')

  useEffect(() => {
    fetch('/api/dashboard/settings')
      .then(r => r.json())
      .then(data => {
        setBusiness(data.business)
        setSeo(data.seo || {})
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
        body: JSON.stringify({ ...business, seo }),
      })
      const data = await res.json()
      if (data.business) {
        setBusiness(data.business)
        if (data.seo) setSeo(data.seo)
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

  const tabs: { id: Tab; label: string; icon: typeof Building2 }[] = [
    { id: 'business', label: 'Business Info', icon: Building2 },
    { id: 'branding', label: 'Branding & Theme', icon: Palette },
    { id: 'social', label: 'Social Links', icon: Globe },
    { id: 'policies', label: 'Policies', icon: FileText },
    { id: 'seo', label: 'SEO', icon: Search },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Business Settings</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage your shop information, branding, policies, and SEO.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-amber-500 text-black hover:bg-amber-400">
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Business Info ── */}
      {activeTab === 'business' && (
        <>
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
                    placeholder="(555) 555-0199"
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
        </>
      )}

      {/* ── Branding & Theme ── */}
      {activeTab === 'branding' && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-5 w-5 text-amber-500" />
              Branding & Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo */}
            <div>
              <Label className="text-zinc-400">Logo URL</Label>
              <Input
                value={business.logo || ''}
                onChange={e => setBusiness({ ...business, logo: e.target.value })}
                className="bg-zinc-800 border-zinc-700 mt-1"
                placeholder="https://..."
              />
              {business.logo && (
                <img src={business.logo} alt="Logo preview" className="mt-2 h-16 rounded-lg border border-zinc-700 bg-zinc-800 p-2" />
              )}
            </div>

            {/* Colors */}
            <div className="space-y-4">
              <div>
                <Label className="text-zinc-400">Primary Color (Background)</Label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    value={business.primaryColor || '#1a1a1a'}
                    onChange={e => setBusiness({ ...business, primaryColor: e.target.value })}
                    className="h-10 w-14 rounded border border-zinc-700 bg-zinc-800 cursor-pointer"
                  />
                  <Input
                    value={business.primaryColor || ''}
                    onChange={e => setBusiness({ ...business, primaryColor: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 max-w-[160px]"
                  />
                </div>
              </div>
              <div>
                <Label className="text-zinc-400">Accent Color</Label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    value={business.accentColor || '#d4af37'}
                    onChange={e => setBusiness({ ...business, accentColor: e.target.value })}
                    className="h-10 w-14 rounded border border-zinc-700 bg-zinc-800 cursor-pointer"
                  />
                  <Input
                    value={business.accentColor || ''}
                    onChange={e => setBusiness({ ...business, accentColor: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 max-w-[160px]"
                  />
                </div>
              </div>
              <div>
                <Label className="text-zinc-400">Secondary Surface Color</Label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    value={business.secondaryColor || '#2a2a2a'}
                    onChange={e => setBusiness({ ...business, secondaryColor: e.target.value })}
                    className="h-10 w-14 rounded border border-zinc-700 bg-zinc-800 cursor-pointer"
                  />
                  <Input
                    value={business.secondaryColor || ''}
                    onChange={e => setBusiness({ ...business, secondaryColor: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 max-w-[160px]"
                  />
                </div>
              </div>
            </div>

            {/* Theme mode */}
            <div>
              <Label className="text-zinc-400">Theme Mode</Label>
              <select
                value={business.themeMode || 'dark'}
                onChange={e => setBusiness({ ...business, themeMode: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>

            {/* Font */}
            <div>
              <Label className="text-zinc-400">Font Family</Label>
              <select
                value={business.fontFamily || ''}
                onChange={e => setBusiness({ ...business, fontFamily: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
              >
                {FONTS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Preview */}
            <div className="rounded-lg border border-zinc-700 p-4" style={{ background: business.primaryColor || '#1a1a1a' }}>
              <p className="text-xs text-zinc-500 mb-2">Theme Preview:</p>
              <div className="flex items-center gap-3">
                <span style={{ color: business.accentColor || '#d4af37' }} className="text-lg font-bold">
                  Sample Heading
                </span>
                <button
                  className="px-3 py-1 rounded text-sm font-medium"
                  style={{ background: business.accentColor || '#d4af37', color: business.primaryColor || '#1a1a1a' }}
                >
                  Button
                </button>
              </div>
              <p className="text-sm mt-2" style={{ color: '#a0a0a0' }}>
                Body text on the primary surface.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Social Links ── */}
      {activeTab === 'social' && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-amber-500" />
              Social Media Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div>
              <Label className="text-zinc-400">YouTube</Label>
              <Input
                value={business.youtube || ''}
                onChange={e => setBusiness({ ...business, youtube: e.target.value })}
                className="bg-zinc-800 border-zinc-700 mt-1"
                placeholder="youtube.com/@yourshop"
              />
            </div>
            <div>
              <Label className="text-zinc-400">X (Twitter)</Label>
              <Input
                value={business.xTwitter || ''}
                onChange={e => setBusiness({ ...business, xTwitter: e.target.value })}
                className="bg-zinc-800 border-zinc-700 mt-1"
                placeholder="@yourshop"
              />
            </div>
            <div>
              <Label className="text-zinc-400">Google Business Profile URL</Label>
              <Input
                value={business.googleBusinessProfile || ''}
                onChange={e => setBusiness({ ...business, googleBusinessProfile: e.target.value })}
                className="bg-zinc-800 border-zinc-700 mt-1"
                placeholder="https://business.google.com/..."
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Policies ── */}
      {activeTab === 'policies' && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-amber-500" />
              Shop Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { field: 'bookingPolicy', label: 'Booking Policy', placeholder: 'Rules for booking appointments...' },
              { field: 'cancellationPolicy', label: 'Cancellation Policy', placeholder: 'Cancellation rules and timeframes...' },
              { field: 'latePolicy', label: 'Late Policy', placeholder: 'Late arrival policy...' },
              { field: 'noShowPolicyText', label: 'No-Show Policy', placeholder: 'No-show consequences...' },
              { field: 'paymentPolicy', label: 'Payment Policy', placeholder: 'Payment methods and terms...' },
              { field: 'privacyPolicy', label: 'Privacy Policy', placeholder: 'How customer data is handled...' },
              { field: 'termsPolicy', label: 'Terms of Service', placeholder: 'Terms and conditions...' },
            ].map(p => (
              <div key={p.field}>
                <Label className="text-zinc-400">{p.label}</Label>
                <Textarea
                  value={business[p.field] || ''}
                  onChange={e => setBusiness({ ...business, [p.field]: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 mt-1 min-h-[80px]"
                  placeholder={p.placeholder}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── SEO ── */}
      {activeTab === 'seo' && (
        <>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="h-5 w-5 text-amber-500" />
                Search Engine Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-zinc-400">Site Title</Label>
                <Input
                  value={seo?.siteTitle || ''}
                  onChange={e => setSeo({ ...seo, siteTitle: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 mt-1"
                  placeholder="Custom title for search engines (defaults to shop name)"
                />
                <p className="text-xs text-zinc-500 mt-1">Shown in browser tab and search results. Keep under 60 characters.</p>
              </div>
              <div>
                <Label className="text-zinc-400">Site Description (Meta Description)</Label>
                <Textarea
                  value={seo?.siteDescription || ''}
                  onChange={e => setSeo({ ...seo, siteDescription: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 mt-1 min-h-[80px]"
                  placeholder="Brief description of your shop for search results..."
                />
                <p className="text-xs text-zinc-500 mt-1">Keep under 160 characters for best results.</p>
              </div>
              <div>
                <Label className="text-zinc-400">Keywords</Label>
                <Input
                  value={seo?.keywords || ''}
                  onChange={e => setSeo({ ...seo, keywords: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 mt-1"
                  placeholder="barber, haircut, fade, beard trim, ..."
                />
                <p className="text-xs text-zinc-500 mt-1">Comma-separated keywords relevant to your shop.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="h-5 w-5 text-amber-500" />
                Open Graph (Social Sharing)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-zinc-400">OG Title</Label>
                <Input
                  value={seo?.ogTitle || ''}
                  onChange={e => setSeo({ ...seo, ogTitle: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 mt-1"
                  placeholder="Title shown when sharing on social media"
                />
              </div>
              <div>
                <Label className="text-zinc-400">OG Description</Label>
                <Textarea
                  value={seo?.ogDescription || ''}
                  onChange={e => setSeo({ ...seo, ogDescription: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 mt-1 min-h-[60px]"
                  placeholder="Description shown when sharing on social media"
                />
              </div>
              <div>
                <Label className="text-zinc-400">OG Image URL</Label>
                <Input
                  value={seo?.ogImage || ''}
                  onChange={e => setSeo({ ...seo, ogImage: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 mt-1"
                  placeholder="https://... (recommended 1200x630px)"
                />
                {seo?.ogImage && (
                  <img src={seo.ogImage} alt="OG preview" className="mt-2 max-w-sm rounded-lg border border-zinc-700" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-amber-500" />
                Robots & Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-zinc-200">Allow Search Engine Indexing</Label>
                  <p className="text-xs text-zinc-500 mt-1">Allow Google, Bing, etc. to index your site</p>
                </div>
                <Switch
                  checked={seo?.robotsIndex !== false}
                  onCheckedChange={v => setSeo({ ...seo, robotsIndex: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-zinc-200">Allow Search Engine Following</Label>
                  <p className="text-xs text-zinc-500 mt-1">Allow crawlers to follow links on your site</p>
                </div>
                <Switch
                  checked={seo?.robotsFollow !== false}
                  onCheckedChange={v => setSeo({ ...seo, robotsFollow: v })}
                />
              </div>
              <div>
                <Label className="text-zinc-400">Canonical URL</Label>
                <Input
                  value={seo?.canonicalUrl || ''}
                  onChange={e => setSeo({ ...seo, canonicalUrl: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 mt-1"
                  placeholder="https://yourshop.com"
                />
                <p className="text-xs text-zinc-500 mt-1">The preferred URL for search engines (prevents duplicate content issues).</p>
              </div>
              <div>
                <Label className="text-zinc-400">Google Search Console Verification</Label>
                <Input
                  value={seo?.googleVerification || ''}
                  onChange={e => setSeo({ ...seo, googleVerification: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 mt-1"
                  placeholder="google-site-verification=..."
                />
                <p className="text-xs text-zinc-500 mt-1">From Google Search Console &gt; Settings &gt; HTML tag verification.</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
