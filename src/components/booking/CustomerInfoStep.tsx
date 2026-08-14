'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { isValidEmail, isValidPhone } from '@/lib/utils'
import { User, Mail, Phone, FileText, CheckCircle2, ArrowRight } from 'lucide-react'

export interface CustomerInfo {
  firstName: string
  lastName: string
  phone: string
  email: string
  notes?: string
  smsConsent?: boolean
}

interface CustomerInfoStepProps {
  customerInfo: CustomerInfo
  onChange: (info: CustomerInfo) => void
  onNext: () => void
  shopName?: string
}

export function CustomerInfoStep({
  customerInfo,
  onChange,
  onNext,
  shopName = 'the Barbershop',
}: CustomerInfoStepProps) {
  const handleChange = (field: keyof CustomerInfo, value: any) => {
    onChange({
      ...customerInfo,
      [field]: value,
    })
  }

  const isFirstNameValid = customerInfo.firstName.trim().length > 0
  const isLastNameValid = customerInfo.lastName.trim().length > 0
  const isEmailValid = isValidEmail(customerInfo.email.trim())
  const isPhoneValid = isValidPhone(customerInfo.phone.trim())

  const isValid = isFirstNameValid && isLastNameValid && isEmailValid && isPhoneValid

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onNext()
    }
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Your Details</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Provide your contact details to complete your appointment booking.
        </p>
      </div>

      <Card className="p-6 bg-zinc-900/90 border-zinc-800 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-zinc-200 text-xs font-semibold">
                First Name <span className="text-amber-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={customerInfo.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-amber-500 pr-8"
                  required
                />
                <User className="w-4 h-4 text-zinc-500 absolute right-3 top-3" />
              </div>
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-zinc-200 text-xs font-semibold">
                Last Name <span className="text-amber-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={customerInfo.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-amber-500 pr-8"
                  required
                />
                <User className="w-4 h-4 text-zinc-500 absolute right-3 top-3" />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-200 text-xs font-semibold">
              Email Address <span className="text-amber-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={customerInfo.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-amber-500 pr-8"
                required
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute right-3 top-3" />
            </div>
            {customerInfo.email.trim() && !isEmailValid && (
              <p className="text-[11px] text-red-400">Please enter a valid email address.</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-zinc-200 text-xs font-semibold">
              Phone Number <span className="text-amber-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 000-0000"
                value={customerInfo.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-amber-500 pr-8"
                required
              />
              <Phone className="w-4 h-4 text-zinc-500 absolute right-3 top-3" />
            </div>
            {customerInfo.phone.trim() && !isPhoneValid && (
              <p className="text-[11px] text-red-400">
                Please enter a valid 10-digit phone number.
              </p>
            )}
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-zinc-200 text-xs font-semibold">
              Special Instructions / Notes <span className="text-zinc-500">(Optional)</span>
            </Label>
            <div className="relative">
              <Textarea
                id="notes"
                placeholder="Any special requests, hair length details, or preferences..."
                value={customerInfo.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-amber-500 min-h-[90px]"
              />
            </div>
          </div>

          {/* SMS Consent Checkbox */}
          <div className="flex items-start space-x-3 pt-2">
            <input
              type="checkbox"
              id="smsConsent"
              checked={customerInfo.smsConsent ?? false}
              onChange={(e) => handleChange('smsConsent', e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-amber-500 focus:ring-amber-500/50"
            />
            <Label htmlFor="smsConsent" className="text-xs text-zinc-400 font-normal leading-relaxed cursor-pointer">
              I agree to receive appointment-related text messages from {shopName}. Message/data rates
              may apply. Reply STOP to opt out.
            </Label>
          </div>

          {/* Submit / Continue Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={!isValid}
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold h-12 text-base transition-all disabled:opacity-40"
            >
              <span>Continue to Confirmation</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
