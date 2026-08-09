import { prisma } from '@/lib/prisma'
import { formatFullDate, formatTime, formatDuration, formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Calendar, Clock, User, Scissors, Phone, Mail, ArrowLeft } from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS, PAYMENT_DISCLAIMER } from '@/lib/constants'
import Link from 'next/link'
import CancelButton from './CancelButton'

export default async function ConfirmationPage({ params }: { params: { confirmationNumber: string } }) {
  const appointment = await prisma.appointment.findUnique({
    where: { confirmationNumber: params.confirmationNumber },
    include: { customer: true, barber: true, service: true, business: true },
  })

  if (!appointment) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Appointment Not Found</h1>
          <p className="text-gray-400 mb-6">
            We couldn't find an appointment with confirmation number{' '}
            <span className="font-mono text-amber-500">{params.confirmationNumber}</span>.
          </p>
          <Link href="/">
            <Button className="bg-amber-500 text-black hover:bg-amber-400">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const isCancelled = appointment.status === 'CANCELLED'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Success header */}
        <div className="text-center mb-8">
          {isCancelled ? (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/50 mb-4">
              <Calendar className="h-8 w-8 text-red-400" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900/50 mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          )}
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            {isCancelled ? 'Appointment Cancelled' : 'Appointment Confirmed!'}
          </h1>
          <p className="mt-2 text-gray-400">
            {isCancelled
              ? 'Your appointment has been cancelled.'
              : 'Your appointment has been successfully booked.'}
          </p>
        </div>

        {/* Confirmation number */}
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Confirmation Number</p>
          <p className="font-mono text-2xl font-bold text-amber-500 tracking-wider">
            {appointment.confirmationNumber}
          </p>
        </div>

        {/* Details card */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Scissors className="h-5 w-5 text-amber-500" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Service */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <Scissors className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-400">Service</span>
              </div>
              <div className="text-right">
                <p className="font-semibold">{appointment.service.name}</p>
                <p className="text-xs text-gray-500">
                  {formatDuration(appointment.service.duration)} · {formatPrice(appointment.service.price)}
                </p>
              </div>
            </div>

            {/* Barber */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-400">Barber</span>
              </div>
              <p className="font-semibold">{appointment.barber.name}</p>
            </div>

            {/* Date */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-400">Date</span>
              </div>
              <p className="font-semibold">{formatFullDate(appointment.startTime)}</p>
            </div>

            {/* Time */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-400">Time</span>
              </div>
              <p className="font-semibold">{formatTime(appointment.startTime)}</p>
            </div>

            {/* Customer */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-400">Customer</span>
              </div>
              <p className="font-semibold">{appointment.customer.firstName} {appointment.customer.lastName}</p>
            </div>

            {/* Contact */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-400">Phone</span>
              </div>
              <p className="font-semibold">{appointment.customer.phone}</p>
            </div>

            {/* Email */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-400">Email</span>
              </div>
              <p className="font-semibold text-sm">{appointment.customer.email}</p>
            </div>

            {/* Notes */}
            {appointment.customerNotes && (
              <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
                <span className="text-sm text-gray-400">Notes</span>
                <p className="font-semibold text-sm text-right max-w-xs">{appointment.customerNotes}</p>
              </div>
            )}

            {/* Status */}
            <div className="flex items-start justify-between">
              <span className="text-sm text-gray-400">Status</span>
              <Badge className={`${STATUS_COLORS[appointment.status] || ''} border`}>
                {STATUS_LABELS[appointment.status] || appointment.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Payment notice */}
        <div className="mb-6 rounded-lg bg-amber-950/30 border border-amber-900/50 p-4 text-center">
          <p className="text-sm font-semibold text-amber-500">Payment</p>
          <p className="text-sm text-gray-400 mt-1">
            Pay in person at the barbershop at the time of your appointment.
          </p>
          <p className="text-xs text-gray-600 mt-2">{PAYMENT_DISCLAIMER}</p>
        </div>

        {/* Actions */}
        {!isCancelled && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/book">
              <Button variant="outline" className="border-zinc-700 text-gray-300 hover:bg-zinc-800 w-full sm:w-auto">
                Reschedule
              </Button>
            </Link>
            <CancelButton appointmentId={appointment.id} />
          </div>
        )}

        {/* Back to home */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-amber-500 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
