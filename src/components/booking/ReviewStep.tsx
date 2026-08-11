'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatFullDate, formatDuration, formatPrice } from '@/lib/utils'
import { PAYMENT_DISCLAIMER } from '@/lib/constants'
import {
  Scissors,
  User,
  Calendar,
  Clock,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle,
  CreditCard,
  ShieldAlert,
} from 'lucide-react'

interface ReviewStepProps {
  service: { name: string; duration: number; price: number } | null
  barber: { name: string; specialty?: string | null } | null
  date: Date | null
  time: string | null
  customerInfo: {
    firstName: string
    lastName: string
    phone: string
    email: string
    notes?: string
    smsConsent?: boolean
  }
  onConfirm: () => void
  isSubmitting: boolean
  error: string | null
  onBackToTime?: () => void
}

export function ReviewStep({
  service,
  barber,
  date,
  time,
  customerInfo,
  onConfirm,
  isSubmitting,
  error,
  onBackToTime,
}: ReviewStepProps) {
  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Review & Confirm</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Please review your booking details before confirming your appointment.
        </p>
      </div>

      {error && (
        <Card className="p-4 bg-red-950/40 border-red-800 text-red-200 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <h4 className="font-semibold text-sm">Booking Error</h4>
          </div>
          <p className="text-xs text-red-300 leading-relaxed">{error}</p>
          {onBackToTime && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBackToTime}
              className="mt-1 self-start border-red-800 text-red-200 hover:bg-red-900/50"
            >
              Select a Different Time Slot
            </Button>
          )}
        </Card>
      )}

      <Card className="p-6 bg-zinc-900/90 border-zinc-800 shadow-xl space-y-6">
        {/* Service & Barber Details */}
        <div className="space-y-3 pb-5 border-b border-zinc-800">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">
                  {service?.name || 'Selected Service'}
                </h3>
                <p className="text-xs text-zinc-400">
                  {service ? `${formatDuration(service.duration)}` : ''}
                </p>
              </div>
            </div>
            <span className="text-lg font-bold text-amber-400">
              {service ? formatPrice(service.price) : ''}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Barber</p>
              <p className="text-sm font-semibold text-zinc-200">
                {barber?.name || 'Any Available Barber'}
              </p>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center text-amber-400 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Date</p>
              <p className="text-sm font-semibold text-zinc-200">
                {date ? formatFullDate(date) : '-'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Time</p>
              <p className="text-sm font-semibold text-zinc-200">{time || '-'}</p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-3 pb-5 border-b border-zinc-800">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
            Customer Information
          </h4>
          <div className="bg-zinc-950/80 p-4 rounded-lg border border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Name:</span>
              <span className="font-semibold text-zinc-200">
                {customerInfo.firstName} {customerInfo.lastName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Phone:</span>
              <span className="font-semibold text-zinc-200">{customerInfo.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Email:</span>
              <span className="font-semibold text-zinc-200">{customerInfo.email}</span>
            </div>
            {customerInfo.notes && (
              <div className="pt-2 border-t border-zinc-900">
                <span className="text-zinc-400 block mb-1">Notes:</span>
                <p className="text-zinc-300 italic">{customerInfo.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment & Disclaimer */}
        <div className="space-y-3 bg-amber-500/5 border border-amber-500/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
            <CreditCard className="w-4 h-4" />
            <span>Payment Information</span>
          </div>
          <p className="text-xs font-medium text-amber-200/90">
            Payment: Pay in person at the barbershop.
          </p>
          <p className="text-[11px] text-zinc-400 leading-relaxed">{PAYMENT_DISCLAIMER}</p>
        </div>

        {/* Confirm Action */}
        <div className="pt-2">
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold h-14 text-base transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Appointment...</span>
              </div>
            ) : (
              <span>Confirm Appointment</span>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
