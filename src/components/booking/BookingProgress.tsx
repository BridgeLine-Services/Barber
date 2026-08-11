'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { BOOKING_FLOW_STEPS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface BookingProgressProps {
  currentStep: number
  onStepClick?: (step: number) => void
}

export function BookingProgress({ currentStep, onStepClick }: BookingProgressProps) {
  return (
    <div className="w-full py-4">
      {/* Mobile progress indicator */}
      <div className="block md:hidden">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-2">
          <span>
            Step {currentStep} of {BOOKING_FLOW_STEPS.length}:{' '}
            <strong className="text-amber-400">
              {BOOKING_FLOW_STEPS[currentStep - 1]?.label}
            </strong>
          </span>
          <span>{Math.round((currentStep / BOOKING_FLOW_STEPS.length) * 100)}%</span>
        </div>
        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / BOOKING_FLOW_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop progress indicator */}
      <div className="hidden md:block">
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center justify-between w-full">
            {BOOKING_FLOW_STEPS.map((step, idx) => {
              const isCompleted = currentStep > step.id
              const isCurrent = currentStep === step.id
              const isClickable = onStepClick && step.id < currentStep

              return (
                <li
                  key={step.id}
                  className={cn(
                    'relative flex-1 flex flex-col items-center group',
                    idx !== BOOKING_FLOW_STEPS.length - 1 && 'pr-2'
                  )}
                >
                  {/* Connecting line */}
                  {idx < BOOKING_FLOW_STEPS.length - 1 && (
                    <div
                      className={cn(
                        'absolute top-4 left-[calc(50%+16px)] right-[calc(-50%+16px)] h-[2px] transition-colors',
                        currentStep > step.id ? 'bg-amber-500' : 'bg-zinc-800'
                      )}
                      aria-hidden="true"
                    />
                  )}

                  <button
                    type="button"
                    disabled={!isClickable}
                    onClick={() => isClickable && onStepClick(step.id)}
                    className={cn(
                      'relative z-10 flex flex-col items-center focus:outline-none transition-transform',
                      isClickable && 'cursor-pointer hover:scale-105',
                      !isClickable && 'cursor-default'
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs border-2 transition-all',
                        isCompleted && 'bg-amber-500 border-amber-500 text-zinc-950',
                        isCurrent &&
                          'bg-zinc-950 border-amber-400 text-amber-400 ring-4 ring-amber-500/20 shadow-md shadow-amber-500/10',
                        !isCompleted &&
                          !isCurrent &&
                          'bg-zinc-900 border-zinc-800 text-zinc-500'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </div>
                    <span
                      className={cn(
                        'mt-2 text-xs font-medium transition-colors text-center',
                        isCurrent && 'text-amber-400 font-semibold',
                        isCompleted && 'text-zinc-300',
                        !isCompleted && !isCurrent && 'text-zinc-600'
                      )}
                    >
                      {step.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>
      </div>
    </div>
  )
}
