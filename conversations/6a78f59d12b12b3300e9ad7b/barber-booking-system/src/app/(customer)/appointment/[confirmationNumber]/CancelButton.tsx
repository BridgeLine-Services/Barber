'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function CancelButton({ appointmentId }: { appointmentId: string }) {
  const [isCancelling, setIsCancelling] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return
    setIsCancelling(true)
    try {
      await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED', cancellationReason: 'Cancelled by customer' }),
      })
      router.refresh()
    } catch (err) {
      alert('Failed to cancel. Please try again or call the shop.')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleCancel}
      disabled={isCancelling}
      className="border-red-800 text-red-400 hover:bg-red-950 w-full sm:w-auto"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
    </Button>
  )
}
