'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getInitials, cn } from '@/lib/utils'
import { Sparkles, Check, User } from 'lucide-react'

export interface BarberItem {
  id: string
  name: string
  photo?: string | null
  specialty?: string | null
  bio?: string | null
  isActive?: boolean
  services?: Array<{ serviceId: string }> | Array<{ service?: { id: string } }>
}

interface BarberStepProps {
  barbers: BarberItem[]
  selectedId: string | null
  onSelect: (barberId: string) => void
  serviceId?: string | null
}

export function BarberStep({ barbers, selectedId, onSelect, serviceId }: BarberStepProps) {
  // Filter barbers client-side based on whether they offer the selected service
  const filteredBarbers = barbers.filter((barber) => {
    if (barber.isActive === false) return false
    if (!serviceId) return true
    if (!barber.services || barber.services.length === 0) return true

    return barber.services.some((s: any) => {
      if (typeof s.serviceId === 'string') return s.serviceId === serviceId
      if (s.service && typeof s.service.id === 'string') return s.service.id === serviceId
      return false
    })
  })

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Select a Barber</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Pick your preferred barber or choose any available team member.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Any Available Barber option */}
        <Card
          onClick={() => onSelect('any')}
          className={cn(
            'relative cursor-pointer transition-all duration-200 p-5 bg-gradient-to-r from-amber-950/30 via-zinc-900 to-zinc-900 border-amber-500/30 hover:border-amber-500 hover:bg-zinc-900 md:col-span-2',
            selectedId === 'any' &&
              'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/40 shadow-lg shadow-amber-500/10'
          )}
        >
          {selectedId === 'any' && (
            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-zinc-100">Any Available Barber</h3>
                <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Fastest
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Show available times across our whole team for maximum schedule flexibility.
              </p>
            </div>
          </div>
        </Card>

        {/* Individual barbers */}
        {filteredBarbers.map((barber) => {
          const isSelected = selectedId === barber.id

          return (
            <Card
              key={barber.id}
              onClick={() => onSelect(barber.id)}
              className={cn(
                'relative cursor-pointer transition-all duration-200 p-5 bg-zinc-900/80 border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900 flex items-center gap-4',
                isSelected &&
                  'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/10'
              )}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}

              <Avatar className="w-14 h-14 border border-zinc-700 bg-zinc-800 shrink-0">
                {barber.photo ? (
                  <AvatarImage src={barber.photo} alt={barber.name} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-amber-500/10 text-amber-400 font-semibold text-base">
                  {getInitials(barber.name)}
                </AvatarFallback>
              </Avatar>

              <div className="pr-6 min-w-0">
                <h3 className="text-base font-semibold text-zinc-100 truncate">{barber.name}</h3>
                {barber.specialty && (
                  <p className="text-xs text-amber-400/90 font-medium mt-0.5 truncate">
                    {barber.specialty}
                  </p>
                )}
                {barber.bio && (
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-tight">
                    {barber.bio}
                  </p>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
