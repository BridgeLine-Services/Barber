'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RebookDialog } from '@/components/dashboard/RebookDialog'
import { Sparkles, CalendarPlus, MessageSquare, Star } from 'lucide-react'

export function CustomerProfileClient({ customerId }: { customerId: string }) {
  const [rebookOpen, setRebookOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setRebookOpen(true)}
        className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2"
        size="sm"
      >
        <Sparkles className="w-4 h-4" />
        Rebook
      </Button>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 gap-2"
      >
        <a href={`/dashboard/appointments?customer=${customerId}`}>
          <CalendarPlus className="w-4 h-4" />
          Book Appointment
        </a>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 gap-2"
      >
        <MessageSquare className="w-4 h-4" />
        Add Note
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 gap-2"
      >
        <Star className="w-4 h-4" />
        Mark VIP
      </Button>

      <RebookDialog customerId={customerId} open={rebookOpen} onOpenChange={setRebookOpen} />
    </>
  )
}
