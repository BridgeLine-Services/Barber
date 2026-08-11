'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BookingProgress } from '@/components/booking/BookingProgress'
import { ServiceStep } from '@/components/booking/ServiceStep'
import { BarberStep } from '@/components/booking/BarberStep'
import { DateStep } from '@/components/booking/DateStep'
import { TimeStep } from '@/components/booking/TimeStep'
import { CustomerInfoStep } from '@/components/booking/CustomerInfoStep'
import { ReviewStep } from '@/components/booking/ReviewStep'
import { ArrowLeft, ArrowRight, Scissors } from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
}

interface Barber {
  id: string
  name: string
  photo: string | null
  specialty: string | null
  bio: string | null
  services?: { serviceId: string }[]
}

interface CustomerInfo {
  firstName: string
  lastName: string
  phone: string
  email: string
  notes?: string
  smsConsent?: boolean
}

const STEPS = ['Service', 'Barber', 'Date', 'Time', 'Info', 'Confirm']

function BookingFlow() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [selectedBarberId, setSelectedBarberId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '', lastName: '', phone: '', email: '', notes: '', smsConsent: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Pre-fill from URL params
  useEffect(() => {
    const serviceParam = searchParams.get('serviceId')
    const barberParam = searchParams.get('barberId')
    if (serviceParam) setSelectedServiceId(serviceParam)
    if (barberParam) setSelectedBarberId(barberParam)
  }, [searchParams])

  // Fetch services and barbers on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/services').then(r => r.json()),
      fetch('/api/barbers').then(r => r.json()),
    ]).then(([s, b]) => {
      setServices(Array.isArray(s) ? s : [])
      setBarbers(Array.isArray(b) ? b : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const selectedService = services.find(s => s.id === selectedServiceId) ?? null
  const selectedBarber = barbers.find(b => b.id === selectedBarberId) ?? null

  const canProceed = () => {
    switch (step) {
      case 1: return !!selectedServiceId
      case 2: return !!selectedBarberId
      case 3: return !!selectedDate
      case 4: return !!selectedTime
      case 5: return !!customerInfo.firstName && !!customerInfo.lastName && !!customerInfo.phone && !!customerInfo.email
      default: return true
    }
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    setBookingError('')

    try {
      const dateStr = selectedDate!.toISOString().split('T')[0]
      // Parse the time string (e.g. "2:30 PM") to 24h "HH:mm"
      const time24h = selectedTime // The API should handle parsing

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barberId: selectedBarberId,
          serviceId: selectedServiceId,
          date: dateStr,
          time: selectedTime,
          customer: {
            firstName: customerInfo.firstName,
            lastName: customerInfo.lastName,
            phone: customerInfo.phone,
            email: customerInfo.email,
            notes: customerInfo.notes || undefined,
            smsConsent: customerInfo.smsConsent,
          },
        }),
      })

      const data = await res.json()

      if (data.success) {
        router.push(`/appointment/${data.appointment.confirmationNumber}`)
      } else {
        setBookingError(data.error || 'Booking failed. Please try again.')
      }
    } catch (err) {
      setBookingError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <Scissors className="h-12 w-12 mx-auto mb-4 animate-pulse text-amber-500" />
          <p className="text-gray-400">Loading booking system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Book an Appointment</h1>
          <p className="mt-2 text-gray-400">Pay in person — no online payment required.</p>
        </div>

        {/* Progress */}
        <BookingProgress currentStep={step} totalSteps={6} />

        {/* Step content */}
        <div className="mt-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6 sm:p-8">
              {step === 1 && (
                <ServiceStep
                  services={services}
                  selectedId={selectedServiceId}
                  onSelect={(id) => { setSelectedServiceId(id); setStep(2) }}
                />
              )}

              {step === 2 && (
                <BarberStep
                  barbers={barbers}
                  selectedId={selectedBarberId}
                  onSelect={(id) => { setSelectedBarberId(id); setStep(3) }}
                  serviceId={selectedServiceId}
                />
              )}

              {step === 3 && (
                <DateStep
                  selectedDate={selectedDate}
                  onSelect={(d) => { setSelectedDate(d); setStep(4) }}
                />
              )}

              {step === 4 && (
                <TimeStep
                  businessId=""
                  barberId={selectedBarberId}
                  serviceId={selectedServiceId}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onSelect={(t) => { setSelectedTime(t); setStep(5) }}
                />
              )}

              {step === 5 && (
                <CustomerInfoStep
                  customerInfo={customerInfo}
                  onChange={setCustomerInfo}
                  onNext={() => setStep(6)}
                />
              )}

              {step === 6 && (
                <ReviewStep
                  service={selectedService}
                  barber={selectedBarber}
                  date={selectedDate}
                  time={selectedTime}
                  customerInfo={customerInfo}
                  onConfirm={handleConfirm}
                  isSubmitting={isSubmitting}
                  error={bookingError}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          {step > 1 && step < 6 ? (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="border-zinc-700 text-gray-300 hover:bg-zinc-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          ) : (
            <div />
          )}

          {step < 5 && canProceed() && step !== 1 && step !== 2 && (
            <Button
              onClick={() => setStep(step + 1)}
              className="bg-amber-500 text-black hover:bg-amber-400"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {bookingError && step === 6 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => { setStep(4); setBookingError('') }}
              className="border-red-800 text-red-400 hover:bg-red-950"
            >
              Select a different time
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <BookingFlow />
    </Suspense>
  )
}
