'use client'

// Onboarding Wizard — multi-step setup for new barbershop owners.
//
// Steps: Welcome → Business Basics → Branding → done.
//
// Persistence & resumability:
//   • Business record + Business.onboardingStep live in the database, so the
//     owner can leave and return — the wizard resumes exactly where they
//     stopped (via GET /api/dashboard/onboarding).
//   • Before the business is created (welcome/basics steps), the basics
//     form is saved as a localStorage draft so nothing is lost on refresh.
//
// All wizard data is saved to the authenticated owner's OWN business record —
// the API resolves the business from the DB user, so another business can
// never be modified from here.

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WelcomeStep } from './WelcomeStep'
import { BusinessBasicsStep, type BasicsForm } from './BusinessBasicsStep'
import { BrandingStep, type BrandingForm } from './BrandingStep'
import { WIZARD_STEPS, ONBOARDING_DRAFT_KEY, ONBOARDING_STEP_LABELS } from '@/lib/onboarding-constants'
import { Check, Loader2, AlertCircle, PartyPopper } from 'lucide-react'

interface OnboardingBusiness {
  id: string
  name: string
  slug: string
  timezone: string
  phone: string | null
  email: string | null
  logo: string | null
  primaryColor: string
  accentColor: string
  secondaryColor: string | null
  themeMode: string
  fontFamily: string | null
  onboardingCompleted: boolean
  onboardingStep: string
}

type Step = 'welcome' | 'business' | 'branding' | 'done'

const initialBranding: BrandingForm = {
  logo: null,
  primaryColor: '#1a1a1a',
  accentColor: '#d4af37',
  secondaryColor: '#2a2a2a',
  themeMode: 'dark',
  fontFamily: null,
}

function brandingFromBusiness(b: OnboardingBusiness): BrandingForm {
  return {
    logo: b.logo,
    primaryColor: b.primaryColor,
    accentColor: b.accentColor,
    secondaryColor: b.secondaryColor,
    themeMode: b.themeMode === 'light' ? 'light' : 'dark',
    fontFamily: b.fontFamily,
  }
}

function basicsFromBusiness(b: OnboardingBusiness): BasicsForm {
  return {
    businessName: b.name,
    slug: b.slug,
    timezone: b.timezone,
    phone: b.phone || '',
    email: b.email || '',
  }
}

/** Load the pre-creation basics draft (leave & return support). */
function loadDraft(): Partial<BasicsForm> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(ONBOARDING_DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveDraft(draft: Partial<BasicsForm> | null) {
  if (typeof window === 'undefined') return
  try {
    if (draft) window.localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft))
    else window.localStorage.removeItem(ONBOARDING_DRAFT_KEY)
  } catch {
    // storage unavailable — non-fatal, wizard still works without drafts
  }
}

export function OnboardingWizard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('welcome')
  const [business, setBusiness] = useState<OnboardingBusiness | null>(null)
  const [basicsInitial, setBasicsInitial] = useState<BasicsForm>({
    businessName: '',
    slug: '',
    timezone: null,
    phone: '',
    email: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [slugServerError, setSlugServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // ─── Load onboarding state (resume) ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/dashboard/onboarding')
        const data = await res.json()
        if (cancelled) return
        if (!res.ok) throw new Error(data.error || 'Failed to load')

        const b: OnboardingBusiness | null = data.business || null
        setBusiness(b)

        if (data.hasBusiness && b) {
          // Resume mid-onboarding: pick up at the persisted step.
          // 'branding' → branding step; anything else → basics in update mode.
          if (!b.onboardingCompleted) {
            if (b.onboardingStep === 'branding') {
              setStep('branding')
            } else {
              setBasicsInitial(basicsFromBusiness(b))
              setStep('business')
            }
          } else {
            setStep('done')
          }
        } else {
          // Fresh start — restore any unsaved basics draft.
          const draft = loadDraft()
          if (draft && Object.values(draft).some((v) => v)) {
            setBasicsInitial((prev) => ({ ...prev, ...draft }))
          }
        }
      } catch (err: any) {
        if (!cancelled) setLoadError(err.message || 'Something went wrong loading your setup.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // ─── Basics draft persistence (pre-creation) ────────────────────────────
  const persistDraft = useCallback(
    (draft: Partial<BasicsForm> | null) => {
      if (!business) saveDraft(draft)
    },
    [business]
  )

  // ─── Step 2: save business basics ───────────────────────────────────────
  const handleBasicsSubmit = async (data: BasicsForm) => {
    setSubmitting(true)
    setServerError(null)
    setSlugServerError(null)
    try {
      if (business) {
        // Update the existing business record (own business only, enforced server-side)
        const res = await fetch('/api/dashboard/onboarding', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, step: 'branding' }),
        })
        const json = await res.json()
        if (!res.ok) {
          if (res.status === 409 && json.error?.toLowerCase().includes('slug')) setSlugServerError(json.error)
          else setServerError(json.error || 'Failed to save your business details.')
          return
        }
        setBusiness(json.business)
        saveDraft(null)
        setStep('branding')
      } else {
        // Create the business
        const res = await fetch('/api/dashboard/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const json = await res.json()
        if (!res.ok) {
          if (res.status === 409 && json.error?.toLowerCase().includes('slug')) setSlugServerError(json.error)
          else if (res.status === 400 && json.details) {
            const first = Object.values(json.details.fieldErrors || {})[0]?.[0]
            setServerError(first || json.error || 'Please check your entries.')
          } else setServerError(json.error || 'Failed to create your shop.')
          return
        }
        setBusiness(json.business)
        saveDraft(null)
        setStep('branding')
      }
    } catch {
      setServerError('Network error — check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Step 3: save branding / complete onboarding ────────────────────────
  const handleBrandingSave = async (branding: BrandingForm, _opts: { complete: boolean }) => {
    await patchAndComplete(branding)
  }

  const handleBrandingSkip = async () => {
    // Branding is optional — complete with the currently saved values.
    await patchAndComplete(null)
  }

  const patchAndComplete = async (branding: BrandingForm | null) => {
    setSubmitting(true)
    setServerError(null)
    try {
      const body: Record<string, unknown> = { step: 'done' }
      if (branding) {
        Object.assign(body, {
          logo: branding.logo ?? '',
          primaryColor: branding.primaryColor,
          accentColor: branding.accentColor,
          secondaryColor: branding.secondaryColor || '',
          themeMode: branding.themeMode,
          fontFamily: branding.fontFamily || '',
        })
      }
      const res = await fetch('/api/dashboard/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) {
        if (res.status === 400 && json.details) {
          const first = Object.values(json.details.fieldErrors || {})[0]?.[0]
          setServerError(first || json.error || 'Please check your branding values.')
        } else {
          setServerError(json.error || 'Failed to save your branding.')
        }
        return
      }
      setBusiness(json.business)
      setSuccess(true)
      setStep('done')
      // Give the owner a moment on the success screen, then into the dashboard.
      setTimeout(() => router.push('/dashboard'), 1600)
    } catch {
      setServerError('Network error — check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        <p className="mt-3 text-sm">Loading your setup…</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
        <h2 className="mt-4 text-lg font-semibold text-zinc-100">Couldn&apos;t load your setup</h2>
        <p className="mt-1.5 text-sm text-zinc-400">{loadError}</p>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="mt-5 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
        >
          Retry
        </button>
      </div>
    )
  }

  // Already completed (visited directly or just finished)
  if (step === 'done') {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30">
          {success ? <PartyPopper className="h-8 w-8 text-amber-400" /> : <Check className="h-8 w-8 text-amber-400" />}
        </div>
        <h2 className="mt-5 text-xl font-bold text-zinc-100">
          {success ? 'Setup complete!' : 'Your shop is already set up'}
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          {success ? 'Taking you to your dashboard…' : 'Head to your dashboard to manage your shop.'}
        </p>
        {!success && (
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="mt-6 rounded-md bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      <ProgressIndicator step={step} />
      <div className="mt-6">
        {step === 'welcome' && <WelcomeStep onNext={() => setStep('business')} />}

        {step === 'business' && (
          <BusinessBasicsStep
            key={business ? 'update' : 'create'}
            initial={basicsInitial}
            mode={business ? 'update' : 'create'}
            submitting={submitting}
            serverError={serverError}
            slugServerError={slugServerError}
            onSubmit={(data) => {
              persistDraft(data) // survives refresh before the record exists
              return handleBasicsSubmit(data)
            }}
            onBack={() => setStep(business ? 'branding' : 'welcome')}
          />
        )}

        {step === 'branding' && business && (
          <BrandingStep
            businessName={business.name}
            initial={brandingFromBusiness(business)}
            submitting={submitting}
            serverError={serverError}
            onSave={handleBrandingSave}
            onSkip={handleBrandingSkip}
            onBack={() => {
              setBasicsInitial(basicsFromBusiness(business))
              setServerError(null)
              setStep('business')
            }}
          />
        )}
      </div>
    </div>
  )
}

// ─── Progress indicator ────────────────────────────────────────────────────

function ProgressIndicator({ step }: { step: Step }) {
  const currentIndex = WIZARD_STEPS.findIndex((s) => s.key === step)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {WIZARD_STEPS.map((s, i) => {
          const done = currentIndex > i || step === 'done'
          const current = currentIndex === i
          return (
            <div
              key={s.key}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors ${
                done
                  ? 'border-amber-500/50 bg-amber-500/10'
                  : current
                    ? 'border-amber-500/70 bg-amber-500/5'
                    : 'border-zinc-800 bg-zinc-950/60'
              }`}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                  done
                    ? 'bg-amber-500 text-zinc-950'
                    : current
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/50'
                      : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  current || done ? 'text-zinc-200' : 'text-zinc-600'
                }`}
              >
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
