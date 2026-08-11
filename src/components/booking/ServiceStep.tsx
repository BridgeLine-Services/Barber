'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDuration, formatPrice, cn } from '@/lib/utils'
import { Clock, Check, Scissors } from 'lucide-react'

export interface ServiceItem {
  id: string
  name: string
  description?: string | null
  duration: number
  price: number
  isActive?: boolean
}

interface ServiceStepProps {
  services: ServiceItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ServiceStep({ services, selectedId, onSelect }: ServiceStepProps) {
  const activeServices = services.filter((s) => s.isActive !== false)

  if (activeServices.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <Scissors className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
        <p>No services currently available for booking.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Select a Service</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Choose from our haircut and grooming offerings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeServices.map((service) => {
          const isSelected = selectedId === service.id

          return (
            <Card
              key={service.id}
              onClick={() => onSelect(service.id)}
              className={cn(
                'relative cursor-pointer transition-all duration-200 p-5 bg-zinc-900/80 border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900',
                isSelected &&
                  'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/10'
              )}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}

              <div className="pr-8">
                <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center text-xs text-zinc-400 gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500/80" />
                  <span>{formatDuration(service.duration)}</span>
                </div>
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 font-semibold text-sm">
                  {formatPrice(service.price)}
                </Badge>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
