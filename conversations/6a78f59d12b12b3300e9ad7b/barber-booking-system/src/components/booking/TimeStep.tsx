'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Clock, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Slot {
  time: string
  available: boolean
  barberId?: string
  barberName?: string
}

interface TimeStepProps {
  businessId?: string
  barberId: string
  serviceId: string
  selectedDate: Date | null
  selectedTime: string | null
  onSelect: (time: string, specificBarberId?: string) => void
}

export function TimeStep({
  barberId,
  serviceId,
  selectedDate,
  selectedTime,
  onSelect,
}: TimeStepProps) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const formattedDateParam = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''

  const fetchAvailability = async () => {
    if (!selectedDate || !serviceId) return

    setLoading(true)
    setError(null)

    try {
      let url = ''
      if (barberId === 'any') {
        url = `/api/availability?serviceId=${encodeURIComponent(
          serviceId
        )}&date=${formattedDateParam}&any=true`
      } else {
        url = `/api/availability?barberId=${encodeURIComponent(
          barberId
        )}&serviceId=${encodeURIComponent(
          serviceId
        )}&date=${formattedDateParam}`
      }

      const res = await fetch(url)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load availability')
      }

      setSlots(data.slots || [])
    } catch (err: any) {
      console.error('TimeStep fetch error:', err)
      setError(err.message || 'Error loading available times. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailability()
  }, [barberId, serviceId, formattedDateParam])

  if (!selectedDate) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <Clock className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
        <p>Please select a date first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Select a Time</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Available appointments for{' '}
          <strong className="text-amber-400">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </strong>
        </p>
      </div>

      {loading && (
        <Card className="p-12 bg-zinc-900/80 border-zinc-800 flex flex-col items-center justify-center text-zinc-400 space-y-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-sm">Checking real-time schedule availability...</p>
        </Card>
      )}

      {error && !loading && (
        <Card className="p-8 bg-red-950/20 border-red-900/50 text-center space-y-3">
          <AlertCircle className="w-10 h-10 mx-auto text-red-400" />
          <p className="text-sm text-red-200">{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchAvailability}
            className="border-red-800 bg-red-950/40 text-red-200 hover:bg-red-900/50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </Card>
      )}

      {!loading && !error && slots.length === 0 && (
        <Card className="p-10 bg-zinc-900/80 border-zinc-800 text-center space-y-3">
          <Clock className="w-10 h-10 mx-auto text-zinc-600" />
          <h3 className="text-base font-semibold text-zinc-200">No Times Available</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            There are no available time slots on this date for the selected barber. Please choose a
            different date or try selecting "Any Available Barber".
          </p>
        </Card>
      )}

      {!loading && !error && slots.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {slots.map((slot) => {
              const isSelected = selectedTime === slot.time

              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => onSelect(slot.time, slot.barberId)}
                  className={cn(
                    'py-3 px-4 rounded-lg text-sm font-semibold transition-all flex flex-col items-center justify-center border focus:outline-none focus:ring-2 focus:ring-amber-500/50',
                    !slot.available &&
                      'bg-zinc-950/50 border-zinc-900 text-zinc-600 cursor-not-allowed line-through',
                    slot.available &&
                      !isSelected &&
                      'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-amber-500/60 hover:text-amber-300 hover:bg-zinc-800/80',
                    isSelected &&
                      'bg-amber-500 border-amber-400 text-zinc-950 font-bold shadow-lg shadow-amber-500/20 scale-105'
                  )}
                >
                  <span>{slot.time}</span>
                  {slot.barberName && barberId === 'any' && (
                    <span className={cn('text-[10px] mt-0.5 truncate max-w-full font-normal', isSelected ? 'text-zinc-900' : 'text-amber-400/80')}>
                      {slot.barberName}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
