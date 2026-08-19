'use client'

import { useState } from 'react'
import { Search, Calendar, Clock, Scissors, User, Phone, Mail, CheckCircle, XCircle, Gift, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  CONFIRMED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  COMPLETED: 'text-zinc-300 bg-zinc-700/40 border-zinc-600',
  CANCELLED: 'text-red-400 bg-red-500/10 border-red-500/20',
  NO_SHOW: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  RESCHEDULED: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No-Show',
  RESCHEDULED: 'Rescheduled',
}

interface PortalAppointment {
  id: string
  confirmationNumber: string
  customerAccessToken: string
  status: string
  startTime: string
  endTime: string
  barber: { name: string } | null
  service: { name: string; price: number; duration: number } | null
}

interface PortalData {
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    smsConsent: boolean
  }
  upcoming: PortalAppointment[]
  past: PortalAppointment[]
  loyalty: { programName: string; type: string; visits: number } | null
}

export function CustomerPortal({ businessId, businessName }: { businessId: string; businessName: string }) {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<PortalData | null>(null)

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setData(null)

    try {
      const res = await fetch('/api/public/portal/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || undefined, phone: phone || undefined, businessId }),
      })
      const result = await res.json()
      if (!res.ok) {
        setError(result.error || 'Lookup failed')
      } else {
        setData(result)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Lookup Form ─────────────────────────────────────────────────────
  if (!data) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 font-serif">My Appointments</h1>
          <p className="text-sm text-zinc-400 mt-1">Look up your appointments and loyalty status at {businessName}</p>
        </div>

        <form onSubmit={handleLookup} className="space-y-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="text-center text-xs text-zinc-600">— or —</div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="(555) 555-0100"
              className="w-full px-3 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || (!email && !phone)}
            className="w-full px-4 py-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Searching...' : 'Find My Appointments'}
          </button>
        </form>
      </div>
    )
  }

  // ── Results Dashboard ─────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <button
        onClick={() => setData(null)}
        className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> New Lookup
      </button>

      {/* Customer Header */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
            {data.customer.firstName[0]}{data.customer.lastName[0]}
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100">{data.customer.firstName} {data.customer.lastName}</h1>
            <p className="text-xs text-zinc-500">{data.customer.email} · {data.customer.phone}</p>
          </div>
        </div>

        {/* Loyalty */}
        {data.loyalty && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
            <Gift className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-amber-400">{data.loyalty.programName}</p>
              <p className="text-xs text-zinc-400">{data.loyalty.visits} visits completed</p>
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Appointments */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-500" /> Upcoming ({data.upcoming.length})
        </h2>
        {data.upcoming.length === 0 ? (
          <p className="text-zinc-500 text-sm py-4 text-center bg-zinc-900/30 border border-zinc-800/50 rounded-lg">
            No upcoming appointments. <a href="/book" className="text-amber-400 hover:underline">Book one →</a>
          </p>
        ) : (
          <div className="space-y-3">
            {data.upcoming.map(a => <AppointmentCard key={a.id} appt={a} />)}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-500" /> History ({data.past.length})
        </h2>
        {data.past.length === 0 ? (
          <p className="text-zinc-500 text-sm py-4 text-center bg-zinc-900/30 border border-zinc-800/50 rounded-lg">
            No past appointments yet.
          </p>
        ) : (
          <div className="space-y-3">
            {data.past.slice(0, 20).map(a => <AppointmentCard key={a.id} appt={a} />)}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Appointment Card ───────────────────────────────────────────────────────

function AppointmentCard({ appt }: { appt: PortalAppointment }) {
  const date = new Date(appt.startTime)
  const canCancel = appt.status === 'PENDING' || appt.status === 'CONFIRMED'

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
          <Scissors className="w-5 h-5 text-zinc-500" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-200 truncate">{appt.service?.name || 'Service'}</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
            {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium border', STATUS_COLORS[appt.status])}>
              {STATUS_LABELS[appt.status] || appt.status}
            </span>
            {appt.barber && (
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <User className="w-3 h-3" /> {appt.barber.name}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {appt.service && <span className="text-sm font-semibold text-amber-400">${appt.service.price.toFixed(0)}</span>}
        {canCancel && (
          <a
            href={`/appointment/${appt.confirmationNumber}?token=${appt.customerAccessToken}`}
            className="text-xs text-red-400 hover:text-red-300 hover:underline"
          >
            Cancel
          </a>
        )}
      </div>
    </div>
  )
}
